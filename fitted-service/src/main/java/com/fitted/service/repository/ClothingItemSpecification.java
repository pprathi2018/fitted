package com.fitted.service.repository;

import com.fitted.service.dto.search.Filter;
import com.fitted.service.dto.search.FilterItem;
import com.fitted.service.dto.search.Search;
import com.fitted.service.model.ClothingItem;
import jakarta.persistence.criteria.Predicate;
import lombok.NonNull;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ClothingItemSpecification {

    private static final List<String> SEARCHABLE_ATTRIBUTES = List.of("name");

    public static Specification<ClothingItem> buildClothingItemSpec(Filter filter, Search search) {
        List<Specification<ClothingItem>> specs = new ArrayList<>();

        if (Objects.nonNull(search)) {
            specs.add(getSpecFromSearch(search));
        }

        if (Objects.nonNull(filter)) {
            List<FilterItem> filterItems = filter.getFilters();
            if (Objects.nonNull(filterItems)) {
                filterItems.forEach(filterItem -> {
                    if (Objects.nonNull(filterItem.getValueList())) {
                        specs.add(getSpecFromFilterValueList(filterItem.getAttribute(), filterItem.getValueList()));
                    }
                    if (Objects.nonNull(filterItem.getValue())) {
                        specs.add(getSpecFromFilterValue(filterItem.getAttribute(), filterItem.getValue()));
                    }
                });
            }
        }
        return Specification.allOf(specs);
    }

    private static Specification<ClothingItem> getSpecFromFilterValue(String attribute, String value) {
        return (root, query, cb) -> {
            if (Objects.isNull(value) || value.isEmpty()) {
                return cb.conjunction();
            }
            return cb.equal(
                    cb.upper(root.get(attribute).as(String.class)),
                    value.toUpperCase()
            );
        };
    }

    private static Specification<ClothingItem> getSpecFromFilterValueList(String attribute, List<String> values) {
        return (root, query, cb) ->
        {
            if (CollectionUtils.isEmpty(values)) {
                return cb.conjunction();
            }
            return cb.in(root.get(attribute)).value(values);
        };
    }

    private static Specification<ClothingItem> getSpecFromSearch(@NonNull Search search) {
        List<String> searchAttributes = Objects.nonNull(search.getSearchIn()) ? search.getSearchIn() : SEARCHABLE_ATTRIBUTES;
        String searchText = Objects.nonNull(search.getSearchText()) ? search.getSearchText() : "";
        return (root, query, cb) -> {
            List<Predicate> searchPredicates = searchAttributes.stream().map(searchAttribute ->
                    cb.like(root.get(searchAttribute), likePattern(searchText))).toList();
            return cb.or(searchPredicates.toArray(new Predicate[0]));
        };
    }

    private static String likePattern(String value) {
        return "%" + value + "%";
    }

}
