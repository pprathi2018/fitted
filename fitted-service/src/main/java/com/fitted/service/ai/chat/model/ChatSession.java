package com.fitted.service.ai.chat.model;

import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Getter
public class ChatSession {
    private final String sessionId;
    private final UUID userId;
    private final List<ChatMessage> conversationHistory;
    private final Instant createdAt;
    private Instant lastActivityAt;

    public ChatSession(UUID userId) {
        this.sessionId = UUID.randomUUID().toString();
        this.userId = userId;
        this.conversationHistory = new ArrayList<>();
        this.createdAt = Instant.now();
        this.lastActivityAt = Instant.now();
    }

    public void addMessage(ChatMessage message) {
        conversationHistory.add(message);
        lastActivityAt = Instant.now();
    }

    public List<ChatMessage> getConversationHistory() {
        return Collections.unmodifiableList(conversationHistory);
    }
}
