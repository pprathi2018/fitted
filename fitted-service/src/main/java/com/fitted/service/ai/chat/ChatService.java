package com.fitted.service.ai.chat;

import com.fitted.service.ai.chat.model.ChatMessage;
import com.fitted.service.ai.chat.model.ChatSession;
import com.fitted.service.dto.chat.ChatResponse;
import com.fitted.service.dto.chat.RecommendedItemDTO;
import com.fitted.service.exception.ResourceNotFoundException;
import com.fitted.service.exception.ValidationException;
import com.fitted.service.model.ClothingItem;
import com.fitted.service.repository.ClothingItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatService {

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are "Fitted AI Stylist," a personal fashion assistant. The user has a \
            virtual closet of clothing items listed below. Your job is to recommend \
            outfits from ONLY these items.

            OUTFIT COMPOSITION RULES:
            - Every outfit MUST include either: (a) a top + a bottom, OR (b) a dress
            - Outfits MAY additionally include: outerwear, shoes, accessories
            - Consider the user's request context (weather, occasion, formality)
            - If the closet lacks items for the request, acknowledge this honestly

            RESPONSE FORMAT:
            You must respond with valid JSON in this exact structure:
            {
              "message": "Your conversational response explaining your recommendation",
              "recommendedItems": [
                {
                  "clothingItemId": "uuid-here",
                  "reason": "Brief reason why this item was chosen"
                }
              ]
            }

            IMPORTANT:
            - Only recommend items from the closet list below
            - Use the exact item IDs provided
            - If the user wants to adjust the outfit, modify your previous recommendation
            - If you want to ask a follow-up question, use an empty recommendedItems array
            - Be conversational and friendly
            - Do not wrap the JSON in markdown code fences

            USER'S CLOSET:
            %s""";

    private final ChatSessionManager chatSessionManager;
    private final ClosetContextBuilder closetContextBuilder;
    private final ChatLLMService chatLLMService;
    private final ChatResponseParser chatResponseParser;
    private final ClothingItemRepository clothingItemRepository;

    public ChatSession createSession(UUID userId) {
        return chatSessionManager.createSession(userId);
    }

    public ChatResponse sendMessage(String sessionId, String message, UUID userId) {
        ChatSession session = chatSessionManager.getSession(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found or expired"));

        if (chatSessionManager.hasReachedMessageLimit(sessionId)) {
            throw new ValidationException("Message limit reached for this session. Please start a new session.");
        }

        chatSessionManager.addMessage(sessionId, ChatMessage.user(message));

        List<ClothingItem> userItems = clothingItemRepository.findByUserId(userId);
        Set<UUID> validItemIds = userItems.stream()
                .map(ClothingItem::getId)
                .collect(Collectors.toSet());
        Map<UUID, ClothingItem> itemMap = userItems.stream()
                .collect(Collectors.toMap(ClothingItem::getId, item -> item));

        String closetContext = closetContextBuilder.buildContext(userItems);
        String systemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, closetContext);

        String rawResponse = chatLLMService.sendMessage(systemPrompt, session.getConversationHistory());

        chatSessionManager.addMessage(sessionId, ChatMessage.assistant(rawResponse));

        ChatResponseParser.ParsedChatResponse parsed = chatResponseParser.parse(rawResponse, validItemIds);

        List<RecommendedItemDTO> recommendedItems = parsed.recommendedItems().stream()
                .map(rec -> {
                    ClothingItem item = itemMap.get(rec.clothingItemId());
                    return RecommendedItemDTO.builder()
                            .id(item.getId())
                            .name(item.getName())
                            .type(item.getType().name())
                            .imageUrl(item.getModifiedImageUrl())
                            .reason(rec.reason())
                            .build();
                })
                .toList();

        return ChatResponse.builder()
                .sessionId(sessionId)
                .message(parsed.message())
                .recommendedItems(recommendedItems)
                .build();
    }
}
