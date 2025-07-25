package com.fitted.service.repository;

import com.fitted.service.model.ClothingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClothingItemRepository extends JpaRepository<ClothingItem, UUID> {

}
