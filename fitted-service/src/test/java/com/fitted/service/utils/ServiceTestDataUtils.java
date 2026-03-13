package com.fitted.service.utils;

import com.fitted.service.auth.model.Users;
import com.fitted.service.dto.ClothingItemResponse;
import com.fitted.service.dto.CreateClothingItemRequest;
import com.fitted.service.model.ClothingItem;
import com.fitted.service.model.ClothingType;
import com.fitted.service.model.EnrichmentStatus;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

public class ServiceTestDataUtils {

    public static final String TEST_BUCKET_NAME = "test-bucket";
    public static final String TEST_S3_URL_ORIGINAL = "s3://test-bucket/original.jpg";
    public static final String TEST_S3_URL_MODIFIED = "s3://test-bucket/modified.png";
    public static final String TEST_CLOUDFRONT_URL_ORIGINAL = "https://d2w2rzyrwrz8rb.cloudfront.net/original.jpg";
    public static final String TEST_CLOUDFRONT_URL_MODIFIED = "https://d2w2rzyrwrz8rb.cloudfront.net/modified.png";
    public static final String JPEG_CONTENT_TYPE = "image/jpeg";
    public static final String PNG_CONTENT_TYPE = "image/png";
    public static final String TEXT_CONTENT_TYPE = "text/plain";
    public static final String USER_ID = "a81bc81b-dead-4e5d-abff-90865d1e13b1";
    public static final Users USER = Users.builder()
            .id(UUID.fromString(USER_ID))
            .email("test@email.com")
            .firstName("test")
            .lastName("test")
            .build();

    private static final byte[] JPEG_BYTES = createMinimalImage("jpg");
    private static final byte[] PNG_BYTES = createMinimalImage("png");

    private static byte[] createMinimalImage(String format) {
        try {
            BufferedImage img = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(img, format, baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to create test image", e);
        }
    }

    public static MockMultipartFile createValidJpegFile(String fileName) {
        return new MockMultipartFile(
                "originalImageFile", fileName, JPEG_CONTENT_TYPE, JPEG_BYTES);
    }

    public static MockMultipartFile createValidPngFile(String fileName) {
        return new MockMultipartFile(
                "modifiedImageFile", fileName, PNG_CONTENT_TYPE, PNG_BYTES);
    }

    public static MockMultipartFile createInvalidFile(String fileName) {
        return new MockMultipartFile(
                "originalImageFile", fileName, TEXT_CONTENT_TYPE, "not an image".getBytes());
    }

    public static MockMultipartFile createEmptyFile(String fileName) {
        return new MockMultipartFile(
                "originalImageFile", fileName, JPEG_CONTENT_TYPE, new byte[0]);
    }

    public static CreateClothingItemRequest createValidRequest() {
        return CreateClothingItemRequest.builder()
                .name("Blue Jeans")
                .type(ClothingType.BOTTOM)
                .originalImageFile(createValidJpegFile("original.jpg"))
                .modifiedImageFile(createValidPngFile("modified.png"))
                .color("Blue")
                .user(USER)
                .build();
    }

    public static ClothingItem createClothingItem(UUID id) {
        return ClothingItem.builder()
                .id(id)
                .name("Blue Jeans")
                .type(ClothingType.BOTTOM)
                .originalImageUrl(TEST_CLOUDFRONT_URL_ORIGINAL)
                .modifiedImageUrl(TEST_CLOUDFRONT_URL_MODIFIED)
                .color("Blue")
                .createdAt(LocalDateTime.now())
                .user(USER)
                .build();
    }

    public static ClothingItemResponse createClothingItemResponse(UUID id) {
        return ClothingItemResponse.builder()
                .id(id)
                .name("Blue Jeans")
                .type(ClothingType.BOTTOM)
                .originalImageUrl(TEST_CLOUDFRONT_URL_ORIGINAL)
                .modifiedImageUrl(TEST_CLOUDFRONT_URL_MODIFIED)
                .color("Blue")
                .enrichmentStatus(EnrichmentStatus.NONE.name())
                .createdAt(LocalDateTime.now())
                .userId(USER_ID)
                .build();
    }
}
