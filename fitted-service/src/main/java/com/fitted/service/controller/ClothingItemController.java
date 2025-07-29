package com.fitted.service.controller;

import com.fitted.service.auth.model.UserPrincipal;
import com.fitted.service.dto.ClothingItemResponse;
import com.fitted.service.dto.CreateClothingItemRequest;
import com.fitted.service.model.ClothingType;
import com.fitted.service.service.ClothingItemService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Log4j2
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class ClothingItemController {

    @Autowired
    private ClothingItemService clothingItemService;

    @PostMapping(value = "/clothing-items", consumes = "multipart/form-data")
    public ResponseEntity<ClothingItemResponse> saveClothingItem(
            @RequestParam("name") @NotBlank(message = "Name is required") String name,
            @RequestParam("type") @NotNull(message = "Type is required") ClothingType type,
            @RequestParam("originalImageFile") @NotNull(message = "Original image file is required") MultipartFile originalImageFile,
            @RequestParam(value = "modifiedImageFile", required = false) MultipartFile modifiedImageFile,
            @RequestParam(value = "color", required = false) String color,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Received PostClothingItem request: name={}, type={}, originalImageFileSize={}, modifiedImageFileSize={}",
                name, type, originalImageFile.getSize(), modifiedImageFile.getSize());

        CreateClothingItemRequest request = CreateClothingItemRequest.builder()
                .name(name)
                .type(type)
                .originalImageFile(originalImageFile)
                .modifiedImageFile(modifiedImageFile)
                .color(color)
                .user(userPrincipal.user())
                .build();

        ClothingItemResponse response = clothingItemService.saveClothingItem(request);

        log.info("Successfully saved clothing item with name: {}, id: {}", response.getName(), response.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
