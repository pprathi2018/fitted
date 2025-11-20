package com.fitted.service.specifications;

import com.fitted.service.dto.search.Filter;
import com.fitted.service.dto.search.Search;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import lombok.NonNull;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class SpecificationBuilder<T> {

    private final List<String> searchableAttributes;
    private final List<String> searchableTextArrayAttributes;

    public SpecificationBuilder(@NonNull List<String> searchableAttributes,
                                @NonNull List<String> searchableTextArrayAttributes) {
        this.searchableAttributes = searchableAttributes;
        this.searchableTextArrayAttributes = searchableTextArrayAttributes;
    }

    public Specification<T> build(Filter filter, Search search, UUID userId) {
        List<Specification<T>> specs = new ArrayList<>();

        specs.add(getUserFilterSpec(userId));

        if (Objects.nonNull(search)) {
            specs.add(getSpecFromSearch(search));
        }

        if (Objects.nonNull(filter) && !CollectionUtils.isEmpty(filter.getFilters())) {
            filter.getFilters().forEach(filterItem -> {
                if (!CollectionUtils.isEmpty(filterItem.getValueList())) {
                    specs.add(getSpecFromFilterValueList(filterItem.getAttribute(), filterItem.getValueList()));
                } else if (Objects.nonNull(filterItem.getValue())) {
                    specs.add(getSpecFromFilterValue(filterItem.getAttribute(), filterItem.getValue()));
                }
            });
        }

        return Specification.allOf(specs);
    }

    private Specification<T> getUserFilterSpec(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    private Specification<T> getSpecFromFilterValue(String attribute, String value) {
        return (root, query, cb) -> {
            if (Objects.isNull(value) || value.isEmpty()) {
                return cb.conjunction();
            }
            Path<String> attributePath = parseAttributePath(root, attribute);
            return cb.equal(
                    cb.upper(attributePath),
                    value.toUpperCase()
            );
        };
    }

    private Specification<T> getSpecFromFilterValueList(String attribute, List<?> values) {
        return (root, query, cb) -> {
            if (CollectionUtils.isEmpty(values)) {
                return cb.conjunction();
            }
            Path<?> attributePath = parseAttributePath(root, attribute);
            return attributePath.in(values);
        };
    }

    private Specification<T> getSpecFromSearch(@NonNull Search search) {
        return (root, query, cb) -> {
            String searchText = Objects.nonNull(search.getSearchText()) ? search.getSearchText().toLowerCase() : "";
            if (searchText.isEmpty()) {
                return cb.conjunction();
            }

            List<String> attributesToSearch = Objects.nonNull(search.getSearchIn())
                    ? search.getSearchIn()
                    : this.searchableAttributes;

            List<String> arrayAttributesToSearch = Objects.nonNull(search.getSearchIn())
                    ? this.searchableTextArrayAttributes.stream()
                    .filter(search.getSearchIn()::contains)
                    .toList()
                    : this.searchableTextArrayAttributes;

            List<Predicate> searchPredicates = attributesToSearch.stream()
                    .map(attribute -> cb.like(cb.lower(root.get(attribute)), likePattern(searchText)))
                    .toList();

            List<Predicate> searchArrayPredicates = arrayAttributesToSearch.stream()
                    .map(attribute -> cb.isTrue(
                            cb.function(
                                    "tag_contains",
                                    Boolean.class,
                                    root.get(attribute),
                                    cb.literal(searchText)
                            )
                    ))
                    .toList();

            List<Predicate> allPredicates = new ArrayList<>();
            allPredicates.addAll(searchPredicates);
            allPredicates.addAll(searchArrayPredicates);

            return cb.or(allPredicates.toArray(new Predicate[0]));
        };
    }

    private static String likePattern(String value) {
        return "%" + value + "%";
    }

    private <Y> Path<Y> parseAttributePath(Path<?> root, String attribute) {
        Path<Y> path = null;
        for (String part : attribute.split("\\.")) {
            if (path == null) {
                path = root.get(part);
            } else {
                path = path.get(part);
            }
        }
        return path;
    }
}