package com.fitted.service.service;

import com.fitted.service.dto.ClothingItemResponse;
import com.fitted.service.dto.CreateClothingItemRequest;
import com.fitted.service.dto.SearchClothingItemRequest;
import com.fitted.service.dto.SearchClothingItemResponse;
import com.fitted.service.dto.search.SortOrder;
import com.fitted.service.exception.InternalServerException;
import com.fitted.service.exception.ResourceNotFoundException;
import com.fitted.service.exception.ValidationException;
import com.fitted.service.exception.s3.S3FileUploadServerException;
import com.fitted.service.exception.s3.S3FileUploadValidationException;
import com.fitted.service.model.ClothingItem;
import com.fitted.service.repository.ClothingItemRepository;
import com.fitted.service.repository.ClothingItemSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.tika.Tika;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
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

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    @Transactional
    public ClothingItemResponse saveClothingItem(CreateClothingItemRequest request) {
        log.info("Started save clothing item request: name={}, user={}", request.getName(), request.getUser().getId());
        String originalItemS3Url = null;
        String modifiedItemS3Url = null;
        try {
            MultipartFile originalImageFile = validateFile(request.getOriginalImageFile());
            MultipartFile modifiedImageFile = validateFile(request.getModifiedImageFile());

            UUID clothingItemId = UUID.randomUUID();
            String userId = request.getUser().getId().toString();

            ClothingItem saved;
            try {
                log.info("Attempting to save original image to S3: {}", originalImageFile.getOriginalFilename());
                String originalItemKey = getFileKey(userId, clothingItemId.toString(), ORIGINAL_IMAGE_TYPE,
                        getFileExtension(originalImageFile.getOriginalFilename()));
                originalItemS3Url = s3FileUploadService.uploadImageFileSimple(originalImageFile, originalItemKey);
                log.info("Saved original image to S3: {}", originalItemS3Url);

                log.info("Attempting to save modified image to S3: {}", modifiedImageFile.getOriginalFilename());
                String modifiedItemKey = getFileKey(userId, clothingItemId.toString(), MODIFIED_IMAGE_TYPE,
                        getFileExtension(modifiedImageFile.getOriginalFilename()));
                modifiedItemS3Url = s3FileUploadService.uploadImageFileSimple(modifiedImageFile, modifiedItemKey);
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
                saved = clothingItemRepository.save(clothingItem);
                log.info("Save clothing item was successful");
            } catch (Exception e) {
                cleanupS3(originalItemS3Url, modifiedItemS3Url);
                throw e;
            }

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
        } catch (Exception e) {
            log.error("Unexpected error during clothing item save", e);
            cleanupS3(originalItemS3Url, modifiedItemS3Url);
            throw new InternalServerException("Failed to save clothing item", e);
        }
    }

    public ClothingItemResponse getClothingItem(String clothingItemId, UUID userId) {
        log.info("Started get clothing item request: clothingItemId={}", clothingItemId);
        ClothingItem clothingItem = clothingItemRepository.findByIdAndUserId(UUID.fromString(clothingItemId), userId).orElseThrow(
                () -> new ResourceNotFoundException(String.format("Clothing item with id: %s not found.", clothingItemId))
        );

        return ClothingItemResponse.builder()
                .id(clothingItem.getId())
                .name(clothingItem.getName())
                .type(clothingItem.getType())
                .originalImageUrl(clothingItem.getOriginalImageUrl())
                .modifiedImageUrl(clothingItem.getModifiedImageUrl())
                .color(clothingItem.getColor())
                .userId(clothingItem.getUser().getId().toString())
                .createdAt(clothingItem.getCreatedAt())
                .build();
    }

    public SearchClothingItemResponse searchClothingItems(SearchClothingItemRequest request) {
        log.info("Started search clothing items request");
        Sort sort = getSortOrderFromSearchRequest(request.getSort()).equals(SortOrder.ASCENDING) ?
                Sort.by(getSortByFromSearchRequest(request.getSort())).ascending() :
                Sort.by(getSortByFromSearchRequest(request.getSort())).descending();
        Pageable pageable = PageRequest.of(request.getPage(), request.getMaxSize(), sort);
        Specification<ClothingItem> spec = ClothingItemSpecification.buildClothingItemSpec(request.getFilter(), request.getSearch());
        Page<ClothingItem> clothingItemPage = clothingItemRepository.findAll(spec, pageable);
        log.info("Search clothing items was successful. Total items returned: {}", clothingItemPage.getTotalElements());
        return SearchClothingItemResponse.builder()
                .items(clothingItemPage.getContent().stream().map(clothingItem ->
                        ClothingItemResponse.builder()
                                .id(clothingItem.getId())
                                .name(clothingItem.getName())
                                .type(clothingItem.getType())
                                .originalImageUrl(clothingItem.getOriginalImageUrl())
                                .modifiedImageUrl(clothingItem.getModifiedImageUrl())
                                .color(clothingItem.getColor())
                                .createdAt(clothingItem.getCreatedAt())
                                .userId(clothingItem.getUser().getId().toString())
                                .build())
                        .toList())
                .totalCount(clothingItemPage.getTotalElements())
                .hasNext(clothingItemPage.hasNext())
                .build();
    }

    @Transactional
    public void deleteClothingItem(String clothingItemId, UUID userId) {
        log.info("Started delete clothing item request: clothingItemId={}", clothingItemId);

        ClothingItem clothingItem = clothingItemRepository.findByIdAndUserId(UUID.fromString(clothingItemId), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Clothing item with id: %s not found.", clothingItemId)));

        clothingItemRepository.deleteById(UUID.fromString(clothingItemId));

        cleanupS3(clothingItem.getOriginalImageUrl(), clothingItem.getModifiedImageUrl());
    }

    // PRIVATE METHODS

    private void cleanupS3(String originalItemS3Url, String modifiedItemS3Url) {
        if (originalItemS3Url != null) {
            try {
                s3FileUploadService.deleteFile(originalItemS3Url);
            } catch (Exception cleanupEx) {
                log.error("Failed to cleanup original image from S3", cleanupEx);
            }
        }

        if (modifiedItemS3Url != null) {
            try {
                s3FileUploadService.deleteFile(modifiedItemS3Url);
            } catch (Exception cleanupEx) {
                log.error("Failed to cleanup modified image from S3", cleanupEx);
            }
        }
    }

    private MultipartFile validateFile(MultipartFile file) {
        if (Objects.isNull(file) || file.isEmpty()) {
            throw new ValidationException("File input is missing or empty.");
        }

        String contentType = file.getContentType();
        if (Objects.isNull(contentType) || !isValidFileType(file)) {
            throw new ValidationException(
                    String.format("Invalid file type: %s. Allowed types are: JPEG, PNG, WebP", contentType)
            );
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new ValidationException("File size exceeds maximum allowed size of 10MB");
        }

        return file;
    }

    private boolean isValidFileType(MultipartFile file) {
        try {
            Tika tika = new Tika();
            String detectedType = tika.detect(file.getInputStream());
            return ALLOWED_IMAGE_TYPES.contains(detectedType);
        } catch (IOException e) {
            log.error("Failed to detect file type", e);
            return false;
        }
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

    private String getSortByFromSearchRequest(com.fitted.service.dto.search.Sort sortRequest) {
        return Objects.nonNull(sortRequest) ?
                Objects.nonNull(sortRequest.getSortBy()) ?
                        sortRequest.getSortBy() :
                        "createdAt" :
                "createdAt";
    }

    private SortOrder getSortOrderFromSearchRequest(com.fitted.service.dto.search.Sort sortRequest) {
        return Objects.nonNull(sortRequest) ?
                Objects.nonNull(sortRequest.getSortOrder()) ?
                        sortRequest.getSortOrder() :
                        SortOrder.DESCENDING :
                SortOrder.DESCENDING;
    }
}
