package com.fitted.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fitted.service.dto.outfit.OutfitClothingItemDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitResponse {
    private UUID id;
    @JsonProperty("outfit_image_url")
    private String outfitImageUrl;
    private List<OutfitClothingItemDTO> clothingItems;
    private LocalDateTime createdAt;
    private List<String> tags;
    private String userId;
}
