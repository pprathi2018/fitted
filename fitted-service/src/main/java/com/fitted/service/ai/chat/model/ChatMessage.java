package com.fitted.service.ai.chat.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatMessage {
    public static final String USER_ROLE = "user";
    public static final String ASSISTANT_ROLE = "assistant";

    private final String role;
    private final String content;

    public static ChatMessage user(String content) {
        return new ChatMessage(USER_ROLE, content);
    }

    public static ChatMessage assistant(String content) {
        return new ChatMessage(ASSISTANT_ROLE, content);
    }
}
