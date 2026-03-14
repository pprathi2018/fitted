package com.fitted.service.ai.chat;

import com.fitted.service.ai.chat.model.ChatMessage;
import com.fitted.service.ai.chat.model.ChatSession;
import com.fitted.service.ai.config.AIProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ChatSessionManagerTest {

    private ChatSessionManager sessionManager;
    private AIProperties aiProperties;

    @BeforeEach
    void setUp() {
        aiProperties = new AIProperties();
        aiProperties.getChat().setMaxMessagesPerSession(5);
        aiProperties.getChat().setSessionTimeoutMinutes(30);
        sessionManager = new ChatSessionManager(aiProperties);
    }

    @Test
    void createSession_ReturnsNewSession() {
        UUID userId = UUID.randomUUID();
        ChatSession session = sessionManager.createSession(userId);

        assertNotNull(session);
        assertNotNull(session.getSessionId());
        assertEquals(userId, session.getUserId());
        assertTrue(session.getConversationHistory().isEmpty());
        assertEquals(1, sessionManager.getActiveSessionCount());
    }

    @Test
    void getSession_ValidOwner_ReturnsSession() {
        UUID userId = UUID.randomUUID();
        ChatSession session = sessionManager.createSession(userId);

        Optional<ChatSession> retrieved = sessionManager.getSession(session.getSessionId(), userId);

        assertTrue(retrieved.isPresent());
        assertEquals(session.getSessionId(), retrieved.get().getSessionId());
    }

    @Test
    void getSession_WrongUser_ReturnsEmpty() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        ChatSession session = sessionManager.createSession(ownerId);

        Optional<ChatSession> retrieved = sessionManager.getSession(session.getSessionId(), otherUserId);

        assertTrue(retrieved.isEmpty());
    }

    @Test
    void getSession_NonExistentId_ReturnsEmpty() {
        UUID userId = UUID.randomUUID();

        Optional<ChatSession> retrieved = sessionManager.getSession("non-existent", userId);

        assertTrue(retrieved.isEmpty());
    }

    @Test
    void addMessage_AddsToHistory() {
        UUID userId = UUID.randomUUID();
        ChatSession session = sessionManager.createSession(userId);

        sessionManager.addMessage(session.getSessionId(), ChatMessage.user("Hello"));
        sessionManager.addMessage(session.getSessionId(), ChatMessage.assistant("Hi there!"));

        ChatSession retrieved = sessionManager.getSession(session.getSessionId(), userId).orElseThrow();
        assertEquals(2, retrieved.getConversationHistory().size());
        assertEquals("user", retrieved.getConversationHistory().get(0).getRole());
        assertEquals("assistant", retrieved.getConversationHistory().get(1).getRole());
    }

    @Test
    void hasReachedMessageLimit_BelowLimit_ReturnsFalse() {
        UUID userId = UUID.randomUUID();
        ChatSession session = sessionManager.createSession(userId);

        sessionManager.addMessage(session.getSessionId(), ChatMessage.user("Hello"));

        assertFalse(sessionManager.hasReachedMessageLimit(session.getSessionId()));
    }

    @Test
    void hasReachedMessageLimit_AtLimit_ReturnsTrue() {
        UUID userId = UUID.randomUUID();
        ChatSession session = sessionManager.createSession(userId);

        for (int i = 0; i < 5; i++) {
            sessionManager.addMessage(session.getSessionId(), ChatMessage.user("Message " + i));
        }

        assertTrue(sessionManager.hasReachedMessageLimit(session.getSessionId()));
    }

    @Test
    void evictExpiredSessions_RemovesOldSessions() throws Exception {
        UUID userId = UUID.randomUUID();
        ChatSession session = sessionManager.createSession(userId);

        // Use reflection to set lastActivityAt to 31 minutes ago
        Field lastActivityField = ChatSession.class.getDeclaredField("lastActivityAt");
        lastActivityField.setAccessible(true);
        lastActivityField.set(session, Instant.now().minus(31, ChronoUnit.MINUTES));

        assertEquals(1, sessionManager.getActiveSessionCount());

        sessionManager.evictExpiredSessions();

        assertEquals(0, sessionManager.getActiveSessionCount());
    }

    @Test
    void evictExpiredSessions_KeepsActiveSessions() {
        UUID userId = UUID.randomUUID();
        sessionManager.createSession(userId);

        sessionManager.evictExpiredSessions();

        assertEquals(1, sessionManager.getActiveSessionCount());
    }

    @Test
    void removeSession_RemovesSession() {
        UUID userId = UUID.randomUUID();
        ChatSession session = sessionManager.createSession(userId);

        sessionManager.removeSession(session.getSessionId());

        assertEquals(0, sessionManager.getActiveSessionCount());
        assertTrue(sessionManager.getSession(session.getSessionId(), userId).isEmpty());
    }
}
