package com.fitted.service.ai.config;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class AIConfig {

    private final AIProperties aiProperties;

    @Bean
    public AnthropicClient anthropicClient() {
        return AnthropicOkHttpClient.builder()
                .apiKey(aiProperties.getAnthropic().getApiKey())
                .build();
    }
}
