package com.fitted.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchClothingItemResponse {
    private List<ClothingItemResponse> items;
    private long totalCount;
    private boolean hasNext;
}
