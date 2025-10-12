package com.fitted.service.specifications;

import com.fitted.service.dto.search.Filter;
import com.fitted.service.dto.search.Search;
import com.fitted.service.model.ClothingItem;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public class ClothingItemSpecification {

    private static final List<String> SEARCHABLE_ATTRIBUTES = List.of("name");
    private static final SpecificationBuilder<ClothingItem> CLOTHING_SPEC_BUILDER = new SpecificationBuilder<>(SEARCHABLE_ATTRIBUTES);

    public static Specification<ClothingItem> buildClothingItemSpec(Filter filter, Search search, UUID userId) {
        return CLOTHING_SPEC_BUILDER.build(filter, search, userId);
    }
}
