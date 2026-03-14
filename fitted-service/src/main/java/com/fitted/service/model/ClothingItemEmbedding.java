package com.fitted.service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Array;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "clothing_item_embeddings")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClothingItemEmbedding {
    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(name = "clothing_item_id", nullable = false)
    private UUID clothingItemId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Array(length = 512)
    @Column(name = "embedding", nullable = false)
    private float[] embedding;

    @Column(name = "model_name", nullable = false)
    @Builder.Default
    private String modelName = "clip-vit-base-patch32";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
