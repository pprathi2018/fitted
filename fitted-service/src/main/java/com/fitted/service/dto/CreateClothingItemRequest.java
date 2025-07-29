package com.fitted.service.dto;

import com.fitted.service.auth.model.Users;
import com.fitted.service.model.ClothingType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateClothingItemRequest {
    @NotBlank(message = "Name is required.")
    private String name;
    @NotNull(message = "Type is required")
    private ClothingType type;
    @NotNull(message = "Original image file is required.")
    private MultipartFile originalImageFile;
    private MultipartFile modifiedImageFile;
    private String color;
    private Users user;
}
