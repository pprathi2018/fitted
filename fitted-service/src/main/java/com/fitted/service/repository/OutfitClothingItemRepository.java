package com.fitted.service.repository;

import com.fitted.service.model.OutfitClothingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface OutfitClothingItemRepository extends JpaRepository<OutfitClothingItem, UUID>, JpaSpecificationExecutor<OutfitClothingItem> {
}
