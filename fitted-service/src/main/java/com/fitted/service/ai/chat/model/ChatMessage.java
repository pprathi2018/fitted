package com.fitted.service.ai.chat.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatMessage {
    private final String role;
    private final String content;

    public static ChatMessage user(String content) {
        return new ChatMessage("user", content);
    }

    public static ChatMessage assistant(String content) {
        return new ChatMessage("assistant", content);
    }
}
