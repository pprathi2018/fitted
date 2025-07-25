package com.fitted.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fitted.service.model.ClothingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingItemResponse {
    private UUID id;
    private String name;
    private ClothingType type;
    @JsonProperty("original_image_url")
    private String originalImageUrl;
    @JsonProperty("modified_image_url")
    private String modifiedImageUrl;
    private String color;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}