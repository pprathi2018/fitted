package com.fitted.service.dto.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterItem {
    private String attribute;
    // only one of value or valueList should be provided
    private String value;
    private List<String> valueList;
}
