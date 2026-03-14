package com.fitted.service.ai.chat;

import com.fitted.service.ai.chat.model.ChatMessage;
import com.fitted.service.ai.chat.model.ChatSession;
import com.fitted.service.ai.config.AIProperties;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Log4j2
public class ChatSessionManager {

    // Map of sessionId to user session
    private final Map<String, ChatSession> sessions = new ConcurrentHashMap<>();
    private final AIProperties aiProperties;

    public ChatSessionManager(AIProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    public ChatSession createSession(UUID userId) {
        ChatSession session = new ChatSession(userId);
        sessions.put(session.getSessionId(), session);
        log.info("Created chat session: {} for user: {}", session.getSessionId(), userId);
        return session;
    }

    public Optional<ChatSession> getSession(String sessionId, UUID userId) {
        ChatSession session = sessions.get(sessionId);
        if (session == null) {
            return Optional.empty();
        }
        if (!session.getUserId().equals(userId)) {
            log.warn("User {} attempted to access session {} owned by user {}", userId, sessionId, session.getUserId());
            return Optional.empty();
        }
        return Optional.of(session);
    }

    public void addMessage(String sessionId, ChatMessage message) {
        ChatSession session = sessions.get(sessionId);
        if (session != null) {
            session.addMessage(message);
        }
    }

    public boolean hasReachedMessageLimit(String sessionId) {
        ChatSession session = sessions.get(sessionId);
        if (session == null) {
            return false;
        }
        return session.getConversationHistory().size() >= aiProperties.getChat().getMaxMessagesPerSession();
    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void evictExpiredSessions() {
        int timeoutMinutes = aiProperties.getChat().getSessionTimeoutMinutes();
        Instant cutoff = Instant.now().minus(timeoutMinutes, ChronoUnit.MINUTES);
        int before = sessions.size();

        sessions.values().removeIf(session -> session.getLastActivityAt().isBefore(cutoff));

        int evicted = before - sessions.size();
        if (evicted > 0) {
            log.info("Evicted {} expired chat sessions", evicted);
        }
    }

    // visible for testing
    int getActiveSessionCount() {
        return sessions.size();
    }
}
