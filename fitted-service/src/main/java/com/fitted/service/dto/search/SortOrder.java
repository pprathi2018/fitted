package com.fitted.service.dto.search;

import lombok.Getter;

@Getter
public enum SortOrder {
    ASCENDING("ASCENDING"),
    DESCENDING("DESCENDING");

    private final String value;

    SortOrder(String value) {
        this.value = value;
    }
}
