package com.fitted.service.controller;

import com.fitted.service.ai.chat.ChatService;
import com.fitted.service.ai.chat.model.ChatSession;
import com.fitted.service.auth.model.UserPrincipal;
import com.fitted.service.dto.chat.ChatMessageRequest;
import com.fitted.service.dto.chat.ChatResponse;
import com.fitted.service.dto.chat.NewSessionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Log4j2
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/new")
    public ResponseEntity<NewSessionResponse> createSession(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Creating new chat session for user: {}", userPrincipal.user().getId());
        ChatSession session = chatService.createSession(userPrincipal.user().getId());
        return ResponseEntity.ok(new NewSessionResponse(session.getSessionId()));
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Chat message received for session: {}", request.getSessionId());
        ChatResponse response = chatService.sendMessage(
                request.getSessionId(),
                request.getMessage(),
                userPrincipal.user().getId()
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> endSession(
            @PathVariable String sessionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Ending chat session: {}", sessionId);
        chatService.endSession(sessionId, userPrincipal.user().getId());
        return ResponseEntity.noContent().build();
    }
}
