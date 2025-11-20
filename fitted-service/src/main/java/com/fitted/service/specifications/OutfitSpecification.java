package com.fitted.service.specifications;

import com.fitted.service.dto.search.Filter;
import com.fitted.service.dto.search.Search;
import com.fitted.service.model.Outfit;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public class OutfitSpecification {

    private static final List<String> SEARCHABLE_ATTRIBUTES = List.of();
    private static final List<String> SEARCHABLE_ARRAY_ATTRIBUTES = List.of("tags");
    private static final SpecificationBuilder<Outfit> OUTFIT_SPEC_BUILDER = new SpecificationBuilder<>(
            SEARCHABLE_ATTRIBUTES, SEARCHABLE_ARRAY_ATTRIBUTES
    );

    public static Specification<Outfit> buildOutfitSpec(Filter filter, Search search, UUID userId) {
        return OUTFIT_SPEC_BUILDER.build(filter, search, userId);
    }
}
