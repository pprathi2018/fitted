package com.fitted.service.dto;

import com.fitted.service.dto.search.Filter;
import com.fitted.service.dto.search.Search;
import com.fitted.service.dto.search.Sort;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchOutfitsRequest {
    private Search search;
    private Filter filter;
    private Sort sort;

    @Min(0)
    @Builder.Default
    private int page = 0;

    @Min(1)
    @Max(100)
    @Builder.Default
    private int maxSize = 50;
}
