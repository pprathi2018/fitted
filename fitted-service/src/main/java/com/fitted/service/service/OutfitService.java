package com.fitted.service.service;

import com.fitted.service.auth.model.Users;
import com.fitted.service.dto.CreateOutfitRequest;
import com.fitted.service.dto.OutfitResponse;
import com.fitted.service.dto.SearchOutfitsRequest;
import com.fitted.service.dto.SearchOutfitsResponse;
import com.fitted.service.dto.UpdateOutfitRequest;
import com.fitted.service.dto.outfit.OutfitClothingItemDTO;
import com.fitted.service.dto.search.SortOrder;
import com.fitted.service.exception.InternalServerException;
import com.fitted.service.exception.ResourceNotFoundException;
import com.fitted.service.exception.ValidationException;
import com.fitted.service.exception.s3.S3FileUploadServerException;
import com.fitted.service.exception.s3.S3FileUploadValidationException;
import com.fitted.service.model.ClothingItem;
import com.fitted.service.model.Outfit;
import com.fitted.service.model.OutfitClothingItem;
import com.fitted.service.repository.ClothingItemRepository;
import com.fitted.service.repository.OutfitClothingItemRepository;
import com.fitted.service.repository.OutfitRepository;
import com.fitted.service.specifications.OutfitSpecification;
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
import software.amazon.awssdk.utils.Pair;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class OutfitService {

    private final OutfitRepository outfitRepository;
    private final ClothingItemRepository clothingItemRepository;
    private final OutfitClothingItemRepository outfitClothingItemRepository;
    private final S3FileUploadService s3FileUploadService;
    private final CloudFrontUrlService cloudFrontUrlService;

    @Transactional
    public OutfitResponse saveOutfit(CreateOutfitRequest request) {
        log.info("Started save outfit request: num clothing items in outfit={}, user={}",
                request.getClothingItems().size(), request.getUser().getId());

        validateOutfitClothingItems(request.getClothingItems(), request.getUser());

        String outfitImageS3Url = null;

        UUID outfitId = UUID.randomUUID();
        String userId = request.getUser().getId().toString();

        try {
            Pair<String, String> outfitImageUrls = uploadImageFileToS3(request.getOutfitImageFile(), outfitId, userId);
            outfitImageS3Url = outfitImageUrls.left();
            String outfitCloudFrontUrl = outfitImageUrls.right();

            return saveOutfitAndOutfitClothingItems(outfitId, request.getUser(),
                    request.getClothingItems(), outfitCloudFrontUrl);
        } catch (S3FileUploadValidationException e) {
            throw new ValidationException(e.getMessage(), e);
        } catch (S3FileUploadServerException e) {
            throw new InternalServerException("Internal server error while uploading image to S3", e);
        } catch (Exception e) {
            log.error("Unexpected error during outfit save", e);
            s3FileUploadService.cleanupS3(outfitImageS3Url);
            throw new InternalServerException("Failed to save outfit", e);
        }
    }

    public OutfitResponse getOutfit(String outfitId, UUID userId) {
        log.info("Started get outfit request: outfitId={}", outfitId);
        Outfit outfit = outfitRepository.findByIdAndUserId(UUID.fromString(outfitId), userId).orElseThrow(
                () -> new ResourceNotFoundException(String.format("Outfit with id: %s not found.", outfitId))
        );

        List<OutfitClothingItem> outfitClothingItems = outfitClothingItemRepository.findByOutfitIdWithClothingItems(UUID.fromString(outfitId));

        return OutfitResponse.builder()
                .id(outfit.getId())
                .outfitImageUrl(outfit.getOutfitImageUrl())
                .clothingItems(outfitClothingItems.stream().map(outfitClothingItem ->
                        OutfitClothingItemDTO.builder()
                                .clothingItemId(outfitClothingItem.getClothingItemId())
                                .positionXPercent(outfitClothingItem.getPositionXPercent())
                                .positionYPercent(outfitClothingItem.getPositionYPercent())
                                .widthPercent(outfitClothingItem.getWidthPercent())
                                .heightPercent(outfitClothingItem.getHeightPercent())
                                .zIndex(outfitClothingItem.getZIndex())
                                // Fields from Clothing Item entity to include
                                .modifiedImageUrl(outfitClothingItem.getClothingItem().getModifiedImageUrl())
                                .build())
                        .toList())
                .createdAt(outfit.getCreatedAt())
                .userId(outfit.getUser().getId().toString())
                .build();
    }

    public SearchOutfitsResponse searchOutfits(SearchOutfitsRequest request, UUID userId) {
        log.info("Started search outfits request.");
        if (request == null) {
            request = SearchOutfitsRequest.builder()
                    .page(0)
                    .maxSize(50)
                    .build();
        }

        Sort sort = SearchUtils.getSortOrderFromSearchRequest(request.getSort()).equals(SortOrder.ASCENDING) ?
                Sort.by(SearchUtils.getSortByFromSearchRequest(request.getSort())).ascending() :
                Sort.by(SearchUtils.getSortByFromSearchRequest(request.getSort())).descending();
        Pageable pageable = PageRequest.of(request.getPage(), request.getMaxSize(), sort);
        Specification<Outfit> spec = OutfitSpecification.buildOutfitSpec(request.getFilter(),
                request.getSearch(), userId);
        try {
            Page<Outfit> outfitPage = outfitRepository.findAll(spec, pageable);
            log.info("Search outfits was successful. Total items returned: {}", outfitPage.getTotalElements());
            return SearchOutfitsResponse.builder()
                    .items(outfitPage.getContent().stream().map(outfit ->
                            OutfitResponse.builder()
                                    .id(outfit.getId())
                                    .outfitImageUrl(outfit.getOutfitImageUrl())
                                    .createdAt(outfit.getCreatedAt())
                                    .userId(outfit.getUser().getId().toString())
                                    .build())
                            .toList())
                    .totalCount(outfitPage.getTotalElements())
                    .hasNext(outfitPage.hasNext())
                    .build();
        } catch (DataAccessException e) {
            log.error("Database error during outfits search for user: {}", userId, e);
            throw new InternalServerException("Failed to search outfits", e);
        } catch (Exception e) {
            log.error("Unexpected error during outfits search for user: {}", userId, e);
            throw new InternalServerException("An error occurred while searching outfits", e);
        }
    }

    @Transactional
    public void deleteOutfit(String outfitId, UUID userId) {
        log.info("Started delete outfit request: outfitId={}", outfitId);

        Outfit outfit = outfitRepository.findByIdAndUserId(UUID.fromString(outfitId), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Outfit with id: %s not found.", outfitId)));

        outfitRepository.deleteById(UUID.fromString(outfitId));

        String outfitS3Url = cloudFrontUrlService.convertCloudFrontToS3Url(
                outfit.getOutfitImageUrl()
        );

        s3FileUploadService.cleanupS3(outfitS3Url);

        log.info("Completed delete outfit: outfitId={}", outfitId);
    }

    @Transactional
    public OutfitResponse updateOutfit(UpdateOutfitRequest request) {
        log.info("Started update outfit request: outfitId={}, num clothing items in outfit={}, user={}",
                request.getOutfitId(), request.getClothingItems().size(), request.getUser().getId());

        validateOutfitClothingItems(request.getClothingItems(), request.getUser());
        String outfitImageS3Url = null;

        UUID outfitId = UUID.fromString(request.getOutfitId());
        String userId = request.getUser().getId().toString();

        OutfitResponse existingOutfit = getOutfit(outfitId.toString(), UUID.fromString(userId));

        try {
            Pair<String, String> outfitImageUrls = uploadImageFileToS3(request.getOutfitImageFile(), outfitId, userId);
            outfitImageS3Url = outfitImageUrls.left();
            String outfitCloudFrontUrl = outfitImageUrls.right();

            // delete old S3 object
            s3FileUploadService.deleteFile(cloudFrontUrlService.convertCloudFrontToS3Url(existingOutfit.getOutfitImageUrl()));

            // delete all existing outfit clothing items
            List<UUID> existingClothingItemsInExistingOutfit = existingOutfit.getClothingItems().stream()
                    .map(OutfitClothingItemDTO::getClothingItemId).toList();
            outfitClothingItemRepository.deleteByOutfitIdAndClothingItemIdIn(outfitId, existingClothingItemsInExistingOutfit);

            return saveOutfitAndOutfitClothingItems(outfitId, request.getUser(),
                    request.getClothingItems(), outfitCloudFrontUrl);
        } catch (S3FileUploadValidationException e) {
            throw new ValidationException(e.getMessage(), e);
        } catch (S3FileUploadServerException e) {
            throw new InternalServerException("Internal server error while uploading image to S3", e);
        } catch (Exception e) {
            log.error("Unexpected error during outfit save", e);
            s3FileUploadService.cleanupS3(outfitImageS3Url);
            throw new InternalServerException("Failed to save outfit", e);
        }
    }

    // PRIVATE METHODS

    private void validateOutfitClothingItems(List<OutfitClothingItemDTO> clothingItems, Users user) {
        List<UUID> requestedItemIds = clothingItems.stream()
                .map(OutfitClothingItemDTO::getClothingItemId)
                .collect(Collectors.toList());

        List<ClothingItem> userClothingItems = clothingItemRepository.findByIdInAndUserId(
                requestedItemIds, user.getId());

        if (userClothingItems.size() != requestedItemIds.size()) {
            throw new ValidationException("One or more clothing items do not belong to the user or do not exist");
        }
    }

    private Pair<String, String> uploadImageFileToS3(MultipartFile imageFile, UUID objectId, String userId) {
        MultipartFile outfitImageFile = FileUtils.validateFile(imageFile);

        String outfitCloudFrontUrl;
        String outfitImageS3Url = null;
        try {
            log.info("Attempting to save outfit image to S3: {}", outfitImageFile.getOriginalFilename());
            String outfitItemKey = FileUtils.getOutfitItemFileKey(userId, objectId.toString(),
                    FileUtils.getFileExtension(outfitImageFile.getOriginalFilename()));
            outfitImageS3Url = s3FileUploadService.uploadImageFileSimple(outfitImageFile, outfitItemKey);
            log.info("Saved outfit image to S3: {}", outfitImageS3Url);

            outfitCloudFrontUrl = cloudFrontUrlService.convertS3ToCloudFrontUrl(outfitImageS3Url);
        } catch (Exception e) {
            s3FileUploadService.cleanupS3(outfitImageS3Url);
            throw e;
        }
        return Pair.of(outfitImageS3Url, outfitCloudFrontUrl);
    }

    private OutfitResponse saveOutfitAndOutfitClothingItems(UUID outfitId, Users user, List<OutfitClothingItemDTO> clothingItems,
                                                            String outfitCloudFrontUrl) {
        log.info("Attempting to update outfit: {} in database.", outfitId);
        Outfit outfit = Outfit.builder()
                .id(outfitId)
                .outfitImageUrl(outfitCloudFrontUrl)
                .user(user)
                .build();
        Outfit savedOutfit = outfitRepository.save(outfit);
        log.info("Successfully updated outfit: {} in database.", outfitId);

        log.info("Attempting to save {} outfit clothing items to database.", clothingItems.size());
        List<OutfitClothingItem> outfitClothingItemsToSave = clothingItems.stream().map(outfitClothingItemDTO ->
                        OutfitClothingItem.builder()
                                .id(UUID.randomUUID())
                                .outfitId(outfitId)
                                .clothingItemId(outfitClothingItemDTO.getClothingItemId())
                                .positionXPercent(outfitClothingItemDTO.getPositionXPercent())
                                .positionYPercent(outfitClothingItemDTO.getPositionYPercent())
                                .widthPercent(outfitClothingItemDTO.getWidthPercent())
                                .heightPercent(outfitClothingItemDTO.getHeightPercent())
                                .zIndex(outfitClothingItemDTO.getZIndex())
                                .build())
                .toList();
        List<OutfitClothingItem> savedOutfitClothingItems = outfitClothingItemRepository.saveAll(outfitClothingItemsToSave);
        log.info("Saved {} outfit clothing items to database.", savedOutfitClothingItems.size());

        return OutfitResponse.builder()
                .id(savedOutfit.getId())
                .outfitImageUrl(savedOutfit.getOutfitImageUrl())
                .clothingItems(savedOutfitClothingItems.stream().map(savedOutfitClothingItem ->
                                OutfitClothingItemDTO.builder()
                                        .clothingItemId(savedOutfitClothingItem.getClothingItemId())
                                        .positionXPercent(savedOutfitClothingItem.getPositionXPercent())
                                        .positionYPercent(savedOutfitClothingItem.getPositionYPercent())
                                        .widthPercent(savedOutfitClothingItem.getWidthPercent())
                                        .heightPercent(savedOutfitClothingItem.getHeightPercent())
                                        .zIndex(savedOutfitClothingItem.getZIndex())
                                        .build())
                        .toList())
                .createdAt(savedOutfit.getCreatedAt())
                .userId(savedOutfit.getUser().getId().toString())
                .build();
    }

}
