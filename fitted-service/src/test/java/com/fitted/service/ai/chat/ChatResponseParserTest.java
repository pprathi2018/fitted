package com.fitted.service.ai.chat;

import com.fitted.service.ai.chat.ChatResponseParser.ParsedChatResponse;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChatResponseParserTest {

    private final ChatResponseParser parser = new ChatResponseParser();

    private final UUID VALID_ID_1 = UUID.randomUUID();
    private final UUID VALID_ID_2 = UUID.randomUUID();
    private final Set<UUID> VALID_IDS = Set.of(VALID_ID_1, VALID_ID_2);

    @Test
    void parse_ValidJson_ReturnsMessageAndItems() {
        String response = """
                {
                  "message": "Here's a great outfit!",
                  "recommendedItems": [
                    {"clothingItemId": "%s", "reason": "Goes well with jeans"},
                    {"clothingItemId": "%s", "reason": "Classic pairing"}
                  ]
                }
                """.formatted(VALID_ID_1, VALID_ID_2);

        ParsedChatResponse result = parser.parse(response, VALID_IDS);

        assertEquals("Here's a great outfit!", result.message());
        assertEquals(2, result.recommendedItems().size());
        assertEquals(VALID_ID_1, result.recommendedItems().get(0).clothingItemId());
        assertEquals("Goes well with jeans", result.recommendedItems().get(0).reason());
    }

    @Test
    void parse_JsonInCodeFence_ExtractsCorrectly() {
        String response = """
                ```json
                {
                  "message": "Try this outfit!",
                  "recommendedItems": [
                    {"clothingItemId": "%s", "reason": "Perfect for casual"}
                  ]
                }
                ```
                """.formatted(VALID_ID_1);

        ParsedChatResponse result = parser.parse(response, VALID_IDS);

        assertEquals("Try this outfit!", result.message());
        assertEquals(1, result.recommendedItems().size());
    }

    @Test
    void parse_HallucinatedItemId_DropsInvalidItem() {
        UUID fakeId = UUID.randomUUID();
        String response = """
                {
                  "message": "Here you go!",
                  "recommendedItems": [
                    {"clothingItemId": "%s", "reason": "Real item"},
                    {"clothingItemId": "%s", "reason": "Hallucinated item"}
                  ]
                }
                """.formatted(VALID_ID_1, fakeId);

        ParsedChatResponse result = parser.parse(response, VALID_IDS);

        assertEquals(1, result.recommendedItems().size());
        assertEquals(VALID_ID_1, result.recommendedItems().get(0).clothingItemId());
    }

    @Test
    void parse_NoJson_ReturnsRawText() {
        String response = "I'd recommend pairing a white shirt with dark jeans for a classic look.";

        ParsedChatResponse result = parser.parse(response, VALID_IDS);

        assertEquals(response, result.message());
        assertTrue(result.recommendedItems().isEmpty());
    }

    @Test
    void parse_InvalidJson_ReturnsRawText() {
        String response = "{ invalid json here }";

        ParsedChatResponse result = parser.parse(response, VALID_IDS);

        assertEquals(response, result.message());
        assertTrue(result.recommendedItems().isEmpty());
    }

    @Test
    void parse_EmptyRecommendedItems_ReturnsEmptyList() {
        String response = """
                {
                  "message": "Your closet doesn't have formal items.",
                  "recommendedItems": []
                }
                """;

        ParsedChatResponse result = parser.parse(response, VALID_IDS);

        assertEquals("Your closet doesn't have formal items.", result.message());
        assertTrue(result.recommendedItems().isEmpty());
    }
}
