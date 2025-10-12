package com.fitted.service.dto.outfit;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitClothingItemDTO {
    private UUID clothingItemId;
    private float positionXPercent;
    private float positionYPercent;
    private float widthPercent;
    private float heightPercent;

    @JsonProperty("zIndex")
    private int zIndex;

    // Fields from clothing item entity to include in Get Outfit response
    @JsonProperty("modified_image_url")
    private String modifiedImageUrl;
}
