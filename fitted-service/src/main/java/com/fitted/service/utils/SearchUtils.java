package com.fitted.service.utils;

import com.fitted.service.dto.search.SortOrder;

import java.util.Objects;

public class SearchUtils {

    public static String getSortByFromSearchRequest(com.fitted.service.dto.search.Sort sortRequest) {
        return Objects.nonNull(sortRequest) ?
                Objects.nonNull(sortRequest.getSortBy()) ?
                        sortRequest.getSortBy() :
                        "createdAt" :
                "createdAt";
    }

    public static SortOrder getSortOrderFromSearchRequest(com.fitted.service.dto.search.Sort sortRequest) {
        return Objects.nonNull(sortRequest) ?
                Objects.nonNull(sortRequest.getSortOrder()) ?
                        sortRequest.getSortOrder() :
                        SortOrder.DESCENDING :
                SortOrder.DESCENDING;
    }
}
