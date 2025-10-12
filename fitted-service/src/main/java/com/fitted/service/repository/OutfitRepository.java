package com.fitted.service.repository;

import com.fitted.service.model.Outfit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.Nullable;

import java.util.Optional;
import java.util.UUID;

public interface OutfitRepository extends JpaRepository<Outfit, UUID>, JpaSpecificationExecutor<Outfit> {
    Optional<Outfit> findByIdAndUserId(UUID id, UUID userId);

    @Override
    Page<Outfit> findAll(@Nullable Specification<Outfit> spec, Pageable pageable);
}
