package com.fitted.service.dto;

import com.fitted.service.auth.model.Users;
import com.fitted.service.dto.outfit.OutfitClothingItemDTO;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOutfitRequest extends CreateOutfitRequest {
    @NotNull private String outfitId;

    @Builder(builderMethodName = "updateOutfitRequestBuilder")
    public UpdateOutfitRequest(String outfitId, MultipartFile outfitImageFile,
                               List<OutfitClothingItemDTO> clothingItems, Users user) {
        super(outfitImageFile, clothingItems, user);
        this.outfitId = outfitId;
    }
}
