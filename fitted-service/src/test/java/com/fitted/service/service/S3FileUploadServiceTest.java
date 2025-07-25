package com.fitted.service.service;

import com.fitted.service.exception.s3.S3FileUploadServerException;
import com.fitted.service.exception.s3.S3FileUploadValidationException;
import com.fitted.service.properties.AWSProperties;
import com.fitted.service.utils.TestDataUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3FileUploadServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private AWSProperties awsProperties;

    @Mock
    private AWSProperties.S3Properties s3Properties;

    @InjectMocks
    private S3FileUploadService s3FileUploadService;

    @Test
    void uploadImageFileSimple_Success() {
        // Arrange
        MockMultipartFile imageFile = TestDataUtils.createValidJpegFile("test.jpg");
        String keyFileName = "test-key";

        // Setup mocks for this specific test
        when(awsProperties.getS3()).thenReturn(s3Properties);
        when(s3Properties.getBucketName()).thenReturn(TestDataUtils.TEST_BUCKET_NAME);
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        // Act
        String result = s3FileUploadService.uploadImageFileSimple(imageFile, keyFileName);

        // Assert
        assertEquals("s3://test-bucket/test-key", result);
        verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadImageFileSimple_NullFile_ThrowsValidationException() {
        // Act & Assert - No mocks needed for validation that happens before S3 call
        S3FileUploadValidationException exception = assertThrows(S3FileUploadValidationException.class, () -> {
            s3FileUploadService.uploadImageFileSimple(null, "test-key");
        });

        assertEquals("Input image file is missing but required.", exception.getMessage());
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadImageFileSimple_EmptyFile_ThrowsValidationException() {
        // Arrange
        MockMultipartFile emptyFile = TestDataUtils.createEmptyFile("test.jpg");

        // Act & Assert - No mocks needed for validation
        S3FileUploadValidationException exception = assertThrows(S3FileUploadValidationException.class, () -> {
            s3FileUploadService.uploadImageFileSimple(emptyFile, "test-key");
        });

        assertEquals("Input image file is missing but required.", exception.getMessage());
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadImageFileSimple_FileTooLarge_ThrowsValidationException() {
        // Arrange
        MockMultipartFile largeFile = spy(TestDataUtils.createValidJpegFile("large.jpg"));
        when(largeFile.getSize()).thenReturn(3L * 1024 * 1024 * 1024); // 3GB

        // Act & Assert - No mocks needed for validation
        S3FileUploadValidationException exception = assertThrows(S3FileUploadValidationException.class, () -> {
            s3FileUploadService.uploadImageFileSimple(largeFile, "test-key");
        });

        assertEquals("Input image size is larger than supported size of 2 GB.", exception.getMessage());
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadImageFileSimple_S3Exception_ThrowsServerException() {
        // Arrange
        MockMultipartFile imageFile = TestDataUtils.createValidJpegFile("test.jpg");
        String keyFileName = "test-key";

        // Setup mocks for this specific test
        when(awsProperties.getS3()).thenReturn(s3Properties);
        when(s3Properties.getBucketName()).thenReturn(TestDataUtils.TEST_BUCKET_NAME);
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(S3Exception.builder().message("S3 error").build());

        // Act & Assert
        S3FileUploadServerException exception = assertThrows(S3FileUploadServerException.class, () -> {
            s3FileUploadService.uploadImageFileSimple(imageFile, keyFileName);
        });

        assertTrue(exception.getMessage().contains("S3 error"));
        verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadImageFileMultipart_Success() {
        // Arrange
        MockMultipartFile imageFile = TestDataUtils.createValidJpegFile("test.jpg");
        String keyFileName = "test-key";

        // Setup mocks
        when(awsProperties.getS3()).thenReturn(s3Properties);
        when(s3Properties.getBucketName()).thenReturn(TestDataUtils.TEST_BUCKET_NAME);

        CreateMultipartUploadResponse createResponse = CreateMultipartUploadResponse.builder()
                .uploadId("test-upload-id")
                .build();

        UploadPartResponse uploadPartResponse = UploadPartResponse.builder()
                .eTag("test-etag")
                .build();

        CompleteMultipartUploadResponse completeResponse = CompleteMultipartUploadResponse.builder()
                .bucket(TestDataUtils.TEST_BUCKET_NAME)
                .key(keyFileName)
                .build();

        when(s3Client.createMultipartUpload(any(CreateMultipartUploadRequest.class)))
                .thenReturn(createResponse);
        when(s3Client.uploadPart(any(UploadPartRequest.class), any(RequestBody.class)))
                .thenReturn(uploadPartResponse);
        when(s3Client.completeMultipartUpload(any(CompleteMultipartUploadRequest.class)))
                .thenReturn(completeResponse);

        // Act
        String result = s3FileUploadService.uploadImageFileMultipart(imageFile, keyFileName);

        // Assert
        assertEquals("s3://test-bucket/test-key", result);
        verify(s3Client, times(1)).createMultipartUpload(any(CreateMultipartUploadRequest.class));
        verify(s3Client, times(1)).uploadPart(any(UploadPartRequest.class), any(RequestBody.class));
        verify(s3Client, times(1)).completeMultipartUpload(any(CompleteMultipartUploadRequest.class));
    }

    @Test
    void uploadImageFileMultipart_S3Error_AbortsUpload() {
        // Arrange
        MockMultipartFile imageFile = TestDataUtils.createValidJpegFile("test.jpg");
        String keyFileName = "test-key";

        // Setup mocks
        when(awsProperties.getS3()).thenReturn(s3Properties);
        when(s3Properties.getBucketName()).thenReturn(TestDataUtils.TEST_BUCKET_NAME);
        when(s3Client.createMultipartUpload(any(CreateMultipartUploadRequest.class)))
                .thenThrow(S3Exception.builder().message("S3 error").build());

        // Act & Assert
        S3FileUploadServerException exception = assertThrows(S3FileUploadServerException.class, () -> {
            s3FileUploadService.uploadImageFileMultipart(imageFile, keyFileName);
        });

        assertTrue(exception.getMessage().contains("S3 error"));
        verify(s3Client, times(1)).createMultipartUpload(any(CreateMultipartUploadRequest.class));
    }
}