package com.fitted.service.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ai")
@Getter
@Setter
public class AIProperties {

    private Anthropic anthropic = new Anthropic();
    private Embedding embedding = new Embedding();
    private Enrichment enrichment = new Enrichment();
    private Chat chat = new Chat();

    @Getter
    @Setter
    public static class Anthropic {
        private String apiKey;
        private String visionModel = "claude-haiku-4-5-20251001";
        private String chatModel = "claude-sonnet-4-6";
    }

    @Getter
    @Setter
    public static class Embedding {
        private String endpoint;
        private String modelName = "clip-vit-base-patch32";
        private int dimensions = 512;
    }

    @Getter
    @Setter
    public static class Enrichment {
        private boolean enabled = true;
    }

    @Getter
    @Setter
    public static class Chat {
        private int maxMessagesPerSession = 20;
        private int sessionTimeoutMinutes = 30;
        private int maxMessageLength = 1000;
    }
}
