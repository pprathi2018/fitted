package com.fitted.service.service;

import com.fitted.service.dto.ClothingItemResponse;
import com.fitted.service.dto.CreateClothingItemRequest;
import com.fitted.service.exception.InternalServerException;
import com.fitted.service.exception.ValidationException;
import com.fitted.service.exception.s3.S3FileUploadServerException;
import com.fitted.service.exception.s3.S3FileUploadValidationException;
import com.fitted.service.model.ClothingItem;
import com.fitted.service.repository.ClothingItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class ClothingItemService {

    private final ClothingItemRepository clothingItemRepository;
    private final S3FileUploadService s3FileUploadService;

    private final static String ORIGINAL_IMAGE_TYPE = "original";
    private final static String MODIFIED_IMAGE_TYPE = "modified";

    @Transactional
    public ClothingItemResponse saveClothingItem(CreateClothingItemRequest request) {
        log.info("Started save clothing item request: name={}, user={}", request.getName(), request.getUser().getId());
        try {
            MultipartFile originalImageFile = validateFile(request.getOriginalImageFile());
            MultipartFile modifiedImageFile = validateFile(request.getModifiedImageFile());

            UUID clothingItemId = UUID.randomUUID();
            String userId = request.getUser().getId().toString();

            log.info("Attempting to save original image to S3: {}", originalImageFile.getOriginalFilename());
            String originalItemKey = getFileKey(userId, clothingItemId.toString(), ORIGINAL_IMAGE_TYPE,
                    getFileExtension(originalImageFile.getOriginalFilename()));
            String originalItemS3Url = s3FileUploadService.uploadImageFileSimple(originalImageFile, originalItemKey);
            log.info("Saved original image to S3: {}", originalItemS3Url);

            log.info("Attempting to save modified image to S3: {}", modifiedImageFile.getOriginalFilename());
            String modifiedItemKey = getFileKey(userId, clothingItemId.toString(), MODIFIED_IMAGE_TYPE,
                    getFileExtension(modifiedImageFile.getOriginalFilename()));
            String modifiedItemS3Url = s3FileUploadService.uploadImageFileSimple(modifiedImageFile, modifiedItemKey);
            log.info("Saved modified image to S3: {}", modifiedItemS3Url);

            log.info("Attempting to save clothing item to database: name={}", request.getName());
            ClothingItem clothingItem = ClothingItem.builder()
                    .id(clothingItemId)
                    .name(request.getName())
                    .type(request.getType())
                    .originalImageUrl(originalItemS3Url)
                    .modifiedImageUrl(modifiedItemS3Url)
                    .color(request.getColor())
                    .user(request.getUser())
                    .build();
            ClothingItem saved = clothingItemRepository.save(clothingItem);
            log.info("Save clothing item was successful");

            return ClothingItemResponse.builder()
                    .id(saved.getId())
                    .name(saved.getName())
                    .type(saved.getType())
                    .originalImageUrl(saved.getOriginalImageUrl())
                    .modifiedImageUrl(saved.getModifiedImageUrl())
                    .color(saved.getColor())
                    .userId(saved.getUser().getId().toString())
                    .createdAt(saved.getCreatedAt())
                    .build();
        } catch (S3FileUploadValidationException e) {
            throw new ValidationException(e.getMessage(), e);
        } catch (S3FileUploadServerException e) {
            throw new InternalServerException("Internal server error while uploading image to S3", e);
        }
    }

    private MultipartFile validateFile(MultipartFile file) {
        if (Objects.isNull(file) || Objects.isNull(file.getContentType()) || !file.getContentType().contains("image")) {
            throw new ValidationException("File input is invalid.");
        }
        return file;
    }

    private String getFileKey(String userId, String id, String imageType, String extension) {
        // userid/clothing-items/id/original.png
        return String.format("%s/clothing-items/%s/%s%s", userId, id, imageType, extension);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".jpg";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
}
