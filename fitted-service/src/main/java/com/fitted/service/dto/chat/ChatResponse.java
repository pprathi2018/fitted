package com.fitted.service.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ChatResponse {
    private String sessionId;
    private String message;
    private List<RecommendedItemDTO> recommendedItems;
}
