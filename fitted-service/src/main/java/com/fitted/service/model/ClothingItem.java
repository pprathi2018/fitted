package com.fitted.service.model;

import com.fitted.service.auth.model.Users;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}