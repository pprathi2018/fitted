package com.fitted.service.dto;

import com.fitted.service.auth.model.Users;
import com.fitted.service.dto.outfit.OutfitClothingItemDTO;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CreateOutfitRequest {
    @NotNull(message = "Outfit image file is required.")
    private MultipartFile outfitImageFile;
    @NotNull(message = "At least one clothing item is required in outfit.")
    private List<OutfitClothingItemDTO> clothingItems;
    private List<String> tags;
    private Users user;
}
