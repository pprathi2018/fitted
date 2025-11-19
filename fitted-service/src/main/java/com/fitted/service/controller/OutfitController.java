package com.fitted.service.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitted.service.auth.model.UserPrincipal;
import com.fitted.service.dto.CreateOutfitRequest;
import com.fitted.service.dto.OutfitResponse;
import com.fitted.service.dto.SearchOutfitsRequest;
import com.fitted.service.dto.SearchOutfitsResponse;
import com.fitted.service.dto.UpdateOutfitRequest;
import com.fitted.service.dto.outfit.OutfitClothingItemDTO;
import com.fitted.service.exception.InternalServerException;
import com.fitted.service.service.OutfitService;
import jakarta.validation.constraints.NotNull;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Log4j2
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1")
public class OutfitController {

    @Autowired
    private OutfitService outfitService;

    @PostMapping(value = "/outfits", consumes = "multipart/form-data")
    public ResponseEntity<OutfitResponse> saveOutfit(
            @RequestParam("outfitImageFile") @NotNull(message = "Outfit image file is required") MultipartFile outfitImageFile,
            @RequestParam("clothingItems") String clothingItemsJson,
            @RequestParam("tags") List<String> tags,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {

        ObjectMapper objectMapper = new ObjectMapper();
        List<OutfitClothingItemDTO> clothingItems;
        try {
            clothingItems = objectMapper.readValue(
                    clothingItemsJson,
                    new TypeReference<>() {
                    }
            );
        } catch (JsonProcessingException e) {
            throw new InternalServerException("Invalid clothing items format: " + e.getMessage());
        }

        log.info("Received SaveOutfit request: originalImageFileSize={}, clothing items in outfit={}",
                outfitImageFile.getSize(), clothingItems.size());

        CreateOutfitRequest createOutfitRequest = CreateOutfitRequest.builder()
                .outfitImageFile(outfitImageFile)
                .clothingItems(clothingItems)
                .tags(tags)
                .user(userPrincipal.user())
                .build();

        OutfitResponse response = outfitService.saveOutfit(createOutfitRequest);

        log.info("Successfully saved outfit with id: {}", response.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(value = "/outfits")
    public ResponseEntity<OutfitResponse> getOutfit(
            @RequestParam(name = "outfitId") String outfitId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Received GetOutfit request: outfitId={}", outfitId);

        OutfitResponse response = outfitService.getOutfit(outfitId, userPrincipal.user().getId());

        log.info("Successfully retrieved outfit with id: {}", response.getId());

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping(value = "/outfits/search")
    public ResponseEntity<SearchOutfitsResponse> searchOutfits(@RequestBody SearchOutfitsRequest request,
                                                               @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Received SearchOutfits request");

        SearchOutfitsResponse response = outfitService.searchOutfits(request, userPrincipal.user().getId());

        log.info("Successfully searched outfits. Total items matched: {}", response.getTotalCount());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping(value = "/outfits")
    public ResponseEntity<Void> deleteOutfit(
            @RequestParam(name = "outfitId") String outfitId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Received DeleteOutfit request: outfitId={}", outfitId);

        outfitService.deleteOutfit(outfitId, userPrincipal.user().getId());

        log.info("Successfully deleted outfit with id: {}", outfitId);

        return ResponseEntity.status(HttpStatusCode.valueOf(200)).build();
    }

    @PutMapping(value = "/outfits", consumes = "multipart/form-data")
    public ResponseEntity<OutfitResponse> updateOutfit(
            @RequestParam(name = "outfitId") String outfitId,
            @RequestParam("outfitImageFile") @NotNull(message = "Outfit image file is required") MultipartFile outfitImageFile,
            @RequestParam("clothingItems") String clothingItemsJson,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<OutfitClothingItemDTO> clothingItems;
        try {
            clothingItems = objectMapper.readValue(
                    clothingItemsJson,
                    new TypeReference<>() {
                    }
            );
        } catch (JsonProcessingException e) {
            throw new InternalServerException("Invalid clothing items format: " + e.getMessage());
        }

        log.info("Received UpdateOutfit request: outfitId={}, originalImageFileSize={}, clothing items in outfit={}",
                outfitId, outfitImageFile.getSize(), clothingItems.size());

        UpdateOutfitRequest updateOutfitRequest = UpdateOutfitRequest.builder()
                .outfitId(outfitId)
                .outfitImageFile(outfitImageFile)
                .clothingItems(clothingItems)
                .user(userPrincipal.user())
                .build();

        OutfitResponse response = outfitService.updateOutfit(updateOutfitRequest);

        log.info("Successfully updated outfit with id: {}", response.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
