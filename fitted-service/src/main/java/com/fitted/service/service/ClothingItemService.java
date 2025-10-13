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
import com.fitted.service.specifications.ClothingItemSpecification;
import com.fitted.service.utils.FileUtils;
import com.fitted.service.utils.SearchUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class ClothingItemService {

    private final ClothingItemRepository clothingItemRepository;
    private final S3FileUploadService s3FileUploadService;
    private final CloudFrontUrlService cloudFrontUrlService;

    private final static String ORIGINAL_IMAGE_TYPE = "original";
    private final static String MODIFIED_IMAGE_TYPE = "modified";

    @Transactional
    public ClothingItemResponse saveClothingItem(CreateClothingItemRequest request) {
        log.info("Started save clothing item request: name={}, user={}", request.getName(), request.getUser().getId());
        String originalItemS3Url = null;
        String modifiedItemS3Url = null;
        try {
            MultipartFile originalImageFile = FileUtils.validateFile(request.getOriginalImageFile());
            MultipartFile modifiedImageFile = FileUtils.validateFile(request.getModifiedImageFile());

            UUID clothingItemId = UUID.randomUUID();
            String userId = request.getUser().getId().toString();

            String originalCloudFrontUrl;
            String modifiedCloudFrontUrl;
            try {
                log.info("Attempting to save original image to S3: {}", originalImageFile.getOriginalFilename());
                String originalItemKey = FileUtils.getClothingItemFileKey(userId, clothingItemId.toString(), ORIGINAL_IMAGE_TYPE,
                        FileUtils.getFileExtension(originalImageFile.getOriginalFilename()));
                originalItemS3Url = s3FileUploadService.uploadImageFileSimple(originalImageFile, originalItemKey);
                log.info("Saved original image to S3: {}", originalItemS3Url);

                log.info("Attempting to save modified image to S3: {}", modifiedImageFile.getOriginalFilename());
                String modifiedItemKey = FileUtils.getClothingItemFileKey(userId, clothingItemId.toString(), MODIFIED_IMAGE_TYPE,
                        FileUtils.getFileExtension(modifiedImageFile.getOriginalFilename()));
                modifiedItemS3Url = s3FileUploadService.uploadImageFileSimple(modifiedImageFile, modifiedItemKey);
                log.info("Saved modified image to S3: {}", modifiedItemS3Url);

                originalCloudFrontUrl = cloudFrontUrlService.convertS3ToCloudFrontUrl(originalItemS3Url);
                modifiedCloudFrontUrl = cloudFrontUrlService.convertS3ToCloudFrontUrl(modifiedItemS3Url);
            } catch (Exception e) {
                s3FileUploadService.cleanupS3(originalItemS3Url, modifiedItemS3Url);
                throw e;
            }

            log.info("Attempting to save clothing item to database: name={}", request.getName());
            ClothingItem clothingItem = ClothingItem.builder()
                    .id(clothingItemId)
                    .name(request.getName())
                    .type(request.getType())
                    .originalImageUrl(originalCloudFrontUrl)
                    .modifiedImageUrl(modifiedCloudFrontUrl)
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
        } catch (Exception e) {
            log.error("Unexpected error during clothing item save", e);
            s3FileUploadService.cleanupS3(originalItemS3Url, modifiedItemS3Url);
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

    public SearchClothingItemResponse searchClothingItems(SearchClothingItemRequest request, UUID userId) {
        log.info("Started search clothing items request");
        if (request == null) {
            request = SearchClothingItemRequest.builder()
                    .page(0)
                    .maxSize(50)
                    .build();
        }

        Sort sort = SearchUtils.getSortOrderFromSearchRequest(request.getSort()).equals(SortOrder.ASCENDING) ?
                Sort.by(SearchUtils.getSortByFromSearchRequest(request.getSort())).ascending() :
                Sort.by(SearchUtils.getSortByFromSearchRequest(request.getSort())).descending();
        Pageable pageable = PageRequest.of(request.getPage(), request.getMaxSize(), sort);
        Specification<ClothingItem> spec = ClothingItemSpecification.buildClothingItemSpec(request.getFilter(),
                request.getSearch(), userId);
        try {
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
        } catch (DataAccessException e) {
            log.error("Database error during clothing items search for user: {}", userId, e);
            throw new InternalServerException("Failed to search clothing items", e);
        } catch (Exception e) {
            log.error("Unexpected error during clothing items search for user: {}", userId, e);
            throw new InternalServerException("An error occurred while searching clothing items", e);
        }
    }

    @Transactional
    public void deleteClothingItem(String clothingItemId, UUID userId) {
        log.info("Started delete clothing item request: clothingItemId={}", clothingItemId);

        ClothingItem clothingItem = clothingItemRepository.findByIdAndUserId(UUID.fromString(clothingItemId), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Clothing item with id: %s not found.", clothingItemId)));

        clothingItemRepository.deleteById(UUID.fromString(clothingItemId));

        String originalS3Url = cloudFrontUrlService.convertCloudFrontToS3Url(
                clothingItem.getOriginalImageUrl()
        );
        String modifiedS3Url = cloudFrontUrlService.convertCloudFrontToS3Url(
                clothingItem.getModifiedImageUrl()
        );

        s3FileUploadService.cleanupS3(originalS3Url, modifiedS3Url);

        log.info("Completed delete clothing item: clothingItemId={}", clothingItem);
    }
}
