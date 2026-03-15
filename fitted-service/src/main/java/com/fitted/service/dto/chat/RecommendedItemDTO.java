package com.fitted.service.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class RecommendedItemDTO {
    private UUID id;
    private String name;
    private String type;
    private String imageUrl;
    private String reason;
}
