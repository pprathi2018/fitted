package com.fitted.service.repository;

import com.fitted.service.model.ClothingItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.Nullable;

import java.util.Optional;
import java.util.UUID;

public interface ClothingItemRepository extends JpaRepository<ClothingItem, UUID>, JpaSpecificationExecutor<ClothingItem> {
    Optional<ClothingItem> findByIdAndUserId(UUID id, UUID userId);

    @Override
    Page<ClothingItem> findAll(@Nullable Specification<ClothingItem> spec, Pageable pageable);
}
