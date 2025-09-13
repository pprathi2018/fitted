package com.fitted.service.dto;

import com.fitted.service.dto.search.Filter;
import com.fitted.service.dto.search.Search;
import com.fitted.service.dto.search.Sort;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchClothingItemRequest {
    private Search search;
    private Filter filter;
    private Sort sort;
    private int page = 0;
    private int maxSize = 50;
}

