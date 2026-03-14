package com.fitted.service.service;

import com.fitted.service.dto.ClothingItemResponse;
import com.fitted.service.dto.CreateClothingItemRequest;
import com.fitted.service.ai.enrichment.EnrichmentPublisher;
import com.fitted.service.exception.InternalServerException;
import com.fitted.service.exception.s3.S3FileUploadServerException;
import com.fitted.service.exception.s3.S3FileUploadValidationException;
import com.fitted.service.model.ClothingItem;
import com.fitted.service.model.ClothingType;
import com.fitted.service.model.EnrichmentStatus;
import com.fitted.service.repository.ClothingItemRepository;
import com.fitted.service.utils.ServiceTestDataUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

import static com.fitted.service.utils.ServiceTestDataUtils.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClothingItemServiceTest {

    @Mock
    private ClothingItemRepository clothingItemRepository;

    @Mock
    private S3FileUploadService s3FileUploadService;

    @Mock
    private CloudFrontUrlService cloudFrontUrlService;

    @Mock
    private EnrichmentPublisher enrichmentPublisher;

    @InjectMocks
    private ClothingItemService clothingItemService;

    @Test
    void saveClothingItem_Success() {
        // Arrange
        CreateClothingItemRequest request = ServiceTestDataUtils.createValidRequest();
        UUID mockId = UUID.randomUUID();
        ClothingItem savedItem = ServiceTestDataUtils.createClothingItem(mockId);

        when(s3FileUploadService.uploadImageFileSimple(any(MultipartFile.class), anyString()))
                .thenReturn(TEST_S3_URL_ORIGINAL)
                .thenReturn(TEST_S3_URL_MODIFIED);
        when(cloudFrontUrlService.convertS3ToCloudFrontUrl(TEST_S3_URL_ORIGINAL))
                .thenReturn(TEST_CLOUDFRONT_URL_ORIGINAL);
        when(cloudFrontUrlService.convertS3ToCloudFrontUrl(TEST_S3_URL_MODIFIED))
                .thenReturn(TEST_CLOUDFRONT_URL_MODIFIED);
        when(clothingItemRepository.save(any(ClothingItem.class))).thenReturn(savedItem);

        // Act
        ClothingItemResponse response = clothingItemService.saveClothingItem(request);

        // Assert
        assertNotNull(response);
        assertEquals(mockId, response.getId());
        assertEquals("Blue Jeans", response.getName());
        assertEquals(ClothingType.BOTTOM, response.getType());
        assertEquals(TEST_CLOUDFRONT_URL_ORIGINAL, response.getOriginalImageUrl());
        assertEquals(TEST_CLOUDFRONT_URL_MODIFIED, response.getModifiedImageUrl());
        assertEquals("Blue", response.getColor());
        assertEquals(EnrichmentStatus.NONE.name(), response.getEnrichmentStatus());
        assertEquals(USER_ID, response.getUserId());

        verify(s3FileUploadService, times(2)).uploadImageFileSimple(any(MultipartFile.class), anyString());
        verify(cloudFrontUrlService, times(2)).convertS3ToCloudFrontUrl(anyString());
        verify(clothingItemRepository, times(1)).save(any(ClothingItem.class));
    }

    @Test
    void saveClothingItem_NullOriginalFile_ThrowsInternalServerException() {
        // Arrange — null file causes ValidationException from FileUtils,
        // which is caught by the generic catch(Exception) in saveClothingItem
        CreateClothingItemRequest request = CreateClothingItemRequest.builder()
                .name("Test Item")
                .type(ClothingType.TOP)
                .originalImageFile(null)
                .modifiedImageFile(ServiceTestDataUtils.createValidPngFile("modified.png"))
                .user(USER)
                .build();

        // Act & Assert
        assertThrows(InternalServerException.class, () -> {
            clothingItemService.saveClothingItem(request);
        });

        verify(s3FileUploadService, never()).uploadImageFileSimple(any(), anyString());
        verify(clothingItemRepository, never()).save(any());
    }

    @Test
    void saveClothingItem_InvalidContentType_ThrowsInternalServerException() {
        // Arrange
        CreateClothingItemRequest request = CreateClothingItemRequest.builder()
                .name("Test Item")
                .type(ClothingType.TOP)
                .originalImageFile(ServiceTestDataUtils.createInvalidFile("original.txt"))
                .modifiedImageFile(ServiceTestDataUtils.createValidPngFile("modified.png"))
                .user(USER)
                .build();

        // Act & Assert
        assertThrows(InternalServerException.class, () -> {
            clothingItemService.saveClothingItem(request);
        });
    }

    @Test
    void saveClothingItem_S3ValidationException_ThrowsValidationException() {
        // Arrange
        CreateClothingItemRequest request = ServiceTestDataUtils.createValidRequest();

        when(s3FileUploadService.uploadImageFileSimple(any(MultipartFile.class), anyString()))
                .thenThrow(new S3FileUploadValidationException("File too large"));

        // Act & Assert
        assertThrows(com.fitted.service.exception.ValidationException.class, () -> {
            clothingItemService.saveClothingItem(request);
        });

        verify(clothingItemRepository, never()).save(any());
    }

    @Test
    void saveClothingItem_S3ServerException_ThrowsInternalServerException() {
        // Arrange
        CreateClothingItemRequest request = ServiceTestDataUtils.createValidRequest();

        when(s3FileUploadService.uploadImageFileSimple(any(MultipartFile.class), anyString()))
                .thenThrow(new S3FileUploadServerException("S3 connection failed"));

        // Act & Assert
        assertThrows(InternalServerException.class, () -> {
            clothingItemService.saveClothingItem(request);
        });

        verify(clothingItemRepository, never()).save(any());
    }

    @Test
    void saveClothingItem_DatabaseException_ThrowsInternalServerException() {
        // Arrange
        CreateClothingItemRequest request = ServiceTestDataUtils.createValidRequest();

        when(s3FileUploadService.uploadImageFileSimple(any(MultipartFile.class), anyString()))
                .thenReturn(TEST_S3_URL_ORIGINAL)
                .thenReturn(TEST_S3_URL_MODIFIED);
        when(cloudFrontUrlService.convertS3ToCloudFrontUrl(anyString()))
                .thenReturn(TEST_CLOUDFRONT_URL_ORIGINAL);
        when(clothingItemRepository.save(any(ClothingItem.class)))
                .thenThrow(new RuntimeException("Database connection failed"));

        // Act & Assert
        assertThrows(InternalServerException.class, () -> {
            clothingItemService.saveClothingItem(request);
        });

        verify(s3FileUploadService, times(2)).uploadImageFileSimple(any(MultipartFile.class), anyString());
        verify(clothingItemRepository, times(1)).save(any(ClothingItem.class));
    }
}
