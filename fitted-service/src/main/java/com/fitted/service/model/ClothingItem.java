package com.fitted.service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "clothing_items")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClothingItem {
    @Id
    private UUID id;
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;
    @NotNull(message = "Type is required")
    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private ClothingType type;
    @Column(name="original_image_url", nullable = false)
    private String originalImageUrl;
    @Column(name="modified_image_url")
    private String modifiedImageUrl;
    private String color;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}