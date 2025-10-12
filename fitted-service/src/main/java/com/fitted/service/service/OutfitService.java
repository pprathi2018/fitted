package com.fitted.service.service;

import com.fitted.service.dto.CreateOutfitRequest;
import com.fitted.service.dto.OutfitResponse;
import com.fitted.service.dto.outfit.OutfitClothingItemDTO;
import com.fitted.service.exception.InternalServerException;
import com.fitted.service.exception.ValidationException;
import com.fitted.service.exception.s3.S3FileUploadServerException;
import com.fitted.service.exception.s3.S3FileUploadValidationException;
import com.fitted.service.model.Outfit;
import com.fitted.service.model.OutfitClothingItem;
import com.fitted.service.repository.OutfitClothingItemRepository;
import com.fitted.service.repository.OutfitRepository;
import com.fitted.service.utils.FileUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class OutfitService {

    private final OutfitRepository outfitRepository;
    private final OutfitClothingItemRepository outfitClothingItemRepository;
    private final S3FileUploadService s3FileUploadService;
    private final CloudFrontUrlService cloudFrontUrlService;

    @Transactional
    public OutfitResponse saveOutfit(CreateOutfitRequest request) {
        log.info("Started save outfit request: num clothing items in outfit={}, user={}",
                request.getClothingItems().size(), request.getUser().getId());
        String outfitImageS3Url = null;
        try {
            MultipartFile outfitImageFile = FileUtils.validateFile(request.getOutfitImageFile());

            UUID outfitId = UUID.randomUUID();
            String userId = request.getUser().getId().toString();

            String outfitCloudFrontUrl;
            try {
                log.info("Attempting to save outfit image to S3: {}", outfitImageFile.getOriginalFilename());
                String outfitItemKey = FileUtils.getOutfitItemFileKey(userId, outfitId.toString(),
                        FileUtils.getFileExtension(outfitImageFile.getOriginalFilename()));
                outfitImageS3Url = s3FileUploadService.uploadImageFileSimple(outfitImageFile, outfitItemKey);
                log.info("Saved outfit image to S3: {}", outfitImageS3Url);

                outfitCloudFrontUrl = cloudFrontUrlService.convertS3ToCloudFrontUrl(outfitImageS3Url);
            } catch (Exception e) {
                s3FileUploadService.cleanupS3(outfitImageS3Url);
                throw e;
            }

            log.info("Attempting to save outfit: {} to database.", outfitId);
            Outfit outfit = Outfit.builder()
                    .id(outfitId)
                    .outfitImageUrl(outfitCloudFrontUrl)
                    .user(request.getUser())
                    .build();
            Outfit savedOutfit = outfitRepository.save(outfit);
            log.info("Successfully saved outfit: {} to database.", outfitId);

            log.info("Attempting to save {} outfit clothing items to database.", request.getClothingItems().size());
            List<OutfitClothingItem> outfitClothingItemsToSave = request.getClothingItems().stream().map(outfitClothingItemDTO ->
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
                    .build();
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
}
