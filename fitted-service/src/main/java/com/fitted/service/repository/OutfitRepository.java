package com.fitted.service.repository;

import com.fitted.service.model.Outfit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface OutfitRepository extends JpaRepository<Outfit, UUID>, JpaSpecificationExecutor<Outfit> {
}
