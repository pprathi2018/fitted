package com.fitted.service.repository;

import com.fitted.service.model.OutfitClothingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OutfitClothingItemRepository extends JpaRepository<OutfitClothingItem, UUID>, JpaSpecificationExecutor<OutfitClothingItem> {
    @Query("SELECT oci FROM OutfitClothingItem oci " +
            "LEFT JOIN FETCH oci.clothingItem " +
            "WHERE oci.outfitId = :outfitId")
    List<OutfitClothingItem> findByOutfitIdWithClothingItems(@Param("outfitId") UUID outfitId);
}
