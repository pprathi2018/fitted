package com.fitted.service.ai.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Log4j2
public class ChatResponseParser {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Pattern CODE_FENCE_PATTERN = Pattern.compile("```(?:json)?\\s*(\\{.*?})\\s*```", Pattern.DOTALL);

    public ParsedChatResponse parse(String rawResponse, Set<UUID> validItemIds) {
        String json = extractJson(rawResponse);

        if (json == null) {
            log.warn("No JSON found in LLM response, returning raw text");
            return new ParsedChatResponse(rawResponse, List.of());
        }

        try {
            JsonNode root = objectMapper.readTree(json);
            String message = root.has("message") ? root.get("message").asText() : rawResponse;

            List<RecommendedItem> recommendedItems = new ArrayList<>();
            if (root.has("recommendedItems") && root.get("recommendedItems").isArray()) {
                for (JsonNode itemNode : root.get("recommendedItems")) {
                    String idStr = itemNode.has("clothingItemId") ? itemNode.get("clothingItemId").asText() : null;
                    String reason = itemNode.has("reason") ? itemNode.get("reason").asText() : null;

                    if (idStr != null) {
                        try {
                            UUID itemId = UUID.fromString(idStr);
                            if (validItemIds.contains(itemId)) {
                                recommendedItems.add(new RecommendedItem(itemId, reason));
                            } else {
                                log.warn("Dropping hallucinated item ID: {}", idStr);
                            }
                        } catch (IllegalArgumentException e) {
                            log.warn("Dropping invalid item ID format: {}", idStr);
                        }
                    }
                }
            }

            return new ParsedChatResponse(message, recommendedItems);
        } catch (Exception e) {
            log.warn("Failed to parse JSON from LLM response, returning raw text", e);
            return new ParsedChatResponse(rawResponse, List.of());
        }
    }

    private String extractJson(String response) {
        if (response == null || response.isBlank()) {
            return null;
        }

        String trimmed = response.trim();

        // Try parsing as-is first
        if (trimmed.startsWith("{")) {
            return trimmed;
        }

        // Try extracting from markdown code fences
        Matcher matcher = CODE_FENCE_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }

    public record ParsedChatResponse(String message, List<RecommendedItem> recommendedItems) {}

    public record RecommendedItem(UUID clothingItemId, String reason) {}
}
