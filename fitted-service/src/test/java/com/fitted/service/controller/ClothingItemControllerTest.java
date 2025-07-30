package com.fitted.service.controller;

import com.fitted.service.dto.ClothingItemResponse;
import com.fitted.service.dto.CreateClothingItemRequest;
import com.fitted.service.exception.GlobalExceptionHandler;
import com.fitted.service.exception.InternalServerException;
import com.fitted.service.exception.ValidationException;
import com.fitted.service.service.ClothingItemService;
import com.fitted.service.utils.ServiceTestDataUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ClothingItemControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClothingItemService clothingItemService;

    @InjectMocks
    private ClothingItemController clothingItemController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(clothingItemController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void saveClothingItem_Success() throws Exception {
        // Arrange
        MockMultipartFile originalImage = new MockMultipartFile(
                "originalImageFile", "original.jpg", "image/jpeg", "test content".getBytes());
        MockMultipartFile modifiedImage = new MockMultipartFile(
                "modifiedImageFile", "modified.png", "image/png", "test content".getBytes());

        ClothingItemResponse response = ServiceTestDataUtils.createClothingItemResponse(UUID.randomUUID());

        when(clothingItemService.saveClothingItem(any(CreateClothingItemRequest.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(multipart("/api/clothing-items")
                        .file(originalImage)
                        .file(modifiedImage)
                        .param("name", "Blue Jeans")
                        .param("type", "BOTTOM")
                        .param("color", "Blue")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Blue Jeans"))
                .andExpect(jsonPath("$.type").value("bottom"))
                .andExpect(jsonPath("$.original_image_url").exists())
                .andExpect(jsonPath("$.modified_image_url").exists())
                .andExpect(jsonPath("$.color").value("Blue"))
                .andExpect(jsonPath("$.id").exists());

        verify(clothingItemService, times(1)).saveClothingItem(any(CreateClothingItemRequest.class));
    }

    @Test
    void saveClothingItem_ValidationException_ReturnsBadRequest() throws Exception {
        // Arrange
        MockMultipartFile originalImage = new MockMultipartFile(
                "originalImageFile", "original.jpg", "image/jpeg", "test content".getBytes());
        MockMultipartFile modifiedImage = new MockMultipartFile(
                "modifiedImageFile", "modified.png", "image/png", "test content".getBytes());

        when(clothingItemService.saveClothingItem(any(CreateClothingItemRequest.class)))
                .thenThrow(new ValidationException("File input is invalid."));

        // Act & Assert
        mockMvc.perform(multipart("/api/clothing-items")
                        .file(originalImage)
                        .file(modifiedImage)
                        .param("name", "Test Item")
                        .param("type", "TOP")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("File input is invalid."));

        verify(clothingItemService, times(1)).saveClothingItem(any(CreateClothingItemRequest.class));
    }

    @Test
    void saveClothingItem_InternalServerException_ReturnsInternalServerError() throws Exception {
        // Arrange
        MockMultipartFile originalImage = new MockMultipartFile(
                "originalImageFile", "original.jpg", "image/jpeg", "test content".getBytes());
        MockMultipartFile modifiedImage = new MockMultipartFile(
                "modifiedImageFile", "modified.png", "image/png", "test content".getBytes());

        when(clothingItemService.saveClothingItem(any(CreateClothingItemRequest.class)))
                .thenThrow(new InternalServerException("S3 upload failed"));

        // Act & Assert
        mockMvc.perform(multipart("/api/clothing-items")
                        .file(originalImage)
                        .file(modifiedImage)
                        .param("name", "Test Item")
                        .param("type", "TOP")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Internal server error"));

        verify(clothingItemService, times(1)).saveClothingItem(any(CreateClothingItemRequest.class));
    }

    @Test
    void saveClothingItem_MissingName_ReturnsBadRequest() throws Exception {
        // Arrange
        MockMultipartFile originalImage = new MockMultipartFile(
                "originalImageFile", "original.jpg", "image/jpeg", "test content".getBytes());
        MockMultipartFile modifiedImage = new MockMultipartFile(
                "modifiedImageFile", "modified.png", "image/png", "test content".getBytes());

        // Act & Assert - Testing Spring's validation, so we expect 400
        mockMvc.perform(multipart("/api/clothing-items")
                        .file(originalImage)
                        .file(modifiedImage)
                        .param("type", "TOP")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest());

        // Don't verify service call since validation should fail before reaching service
        verify(clothingItemService, never()).saveClothingItem(any(CreateClothingItemRequest.class));
    }
}