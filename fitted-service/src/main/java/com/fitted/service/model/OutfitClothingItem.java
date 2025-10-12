package com.fitted.service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "outfit_clothing_items")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OutfitClothingItem {
    @Id
    private UUID id;
    @Column(name = "outfit_id", nullable = false)
    private UUID outfitId;
    @Column(name = "clothing_item_id", nullable = false)
    private UUID clothingItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clothing_item_id", insertable = false, updatable = false)
    private ClothingItem clothingItem;

    @Column(name="position_x_percent")
    private float positionXPercent;
    @Column(name="position_y_percent")
    private float positionYPercent;
    @Column(name="width_percent")
    private float widthPercent;
    @Column(name="height_percent")
    private float heightPercent;
    @Column(name="z_index")
    private int zIndex;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
