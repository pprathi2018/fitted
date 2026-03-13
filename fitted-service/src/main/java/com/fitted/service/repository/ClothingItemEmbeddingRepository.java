package com.fitted.service.repository;

import com.fitted.service.model.ClothingItemEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ClothingItemEmbeddingRepository extends JpaRepository<ClothingItemEmbedding, UUID> {
    Optional<ClothingItemEmbedding> findByClothingItemId(UUID clothingItemId);
}
