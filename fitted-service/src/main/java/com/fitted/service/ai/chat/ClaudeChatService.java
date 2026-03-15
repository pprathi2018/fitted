package com.fitted.service.ai.chat;

import com.anthropic.client.AnthropicClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.TextBlock;
import com.fitted.service.ai.chat.model.ChatMessage;
import com.fitted.service.ai.config.AIProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.fitted.service.ai.chat.model.ChatMessage.USER_ROLE;

@Service
@RequiredArgsConstructor
@Log4j2
public class ClaudeChatService implements ChatLLMService {

    private final AnthropicClient anthropicClient;
    private final AIProperties aiProperties;

    @Override
    public String sendMessage(String systemPrompt, List<ChatMessage> conversationHistory) {
        log.info("Sending chat message to Claude (history size: {})", conversationHistory.size());

        MessageCreateParams.Builder paramsBuilder = MessageCreateParams.builder()
                .model(aiProperties.getAnthropic().getChatModel())
                .maxTokens(1024)
                .system(systemPrompt);

        for (ChatMessage message : conversationHistory) {
            if (USER_ROLE.equals(message.getRole())) {
                paramsBuilder.addUserMessage(message.getContent());
            } else {
                paramsBuilder.addAssistantMessage(message.getContent());
            }
        }

        Message response = anthropicClient.messages().create(paramsBuilder.build());

        String responseText = response.content().stream()
                .flatMap(block -> block.text().stream())
                .map(TextBlock::text)
                .findFirst()
                .orElse("");

        log.info("Chat response received ({} chars)", responseText.length());
        return responseText;
    }
}
