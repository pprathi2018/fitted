package com.fitted.service.ai.chat;

import com.fitted.service.ai.chat.model.ChatMessage;

import java.util.List;

public interface ChatLLMService {

    /**
     * Sends a conversation to the chat LLM and returns the raw response.
     *
     * @param systemPrompt the system prompt including outfit rules and closet context
     * @param conversationHistory the ordered list of prior messages in this session
     * @return the LLM's raw text response
     */
    String sendMessage(String systemPrompt, List<ChatMessage> conversationHistory);
}
