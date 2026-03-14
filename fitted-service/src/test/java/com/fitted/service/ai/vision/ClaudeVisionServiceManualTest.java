package com.fitted.service.ai.vision;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Manual integration test for ClaudeVisionService.
 * Only runs when ANTHROPIC_API_KEY env variable is set.
 */
class ClaudeVisionServiceManualTest {

    @Test
    @EnabledIfEnvironmentVariable(named = "ANTHROPIC_API_KEY", matches = ".+")
    void testGenerateDescription_withJpegImage() throws Exception {
        AnthropicClient client = AnthropicOkHttpClient.builder()
                .apiKey(System.getenv("ANTHROPIC_API_KEY"))
                .build();

        com.fitted.service.ai.config.AIProperties props = new com.fitted.service.ai.config.AIProperties();
        ClaudeVisionService visionService = new ClaudeVisionService(client, props);

        Path path = Path.of("C:/Users/prane/Fitted/fitted-background-removal/inputs/KithShirt.jpg");
        assertTrue(Files.exists(path), "Test image not found");

        byte[] imageBytes = Files.readAllBytes(path);
        System.out.println("Image: " + path.getFileName() + " (" + imageBytes.length + " bytes)");

        String description = visionService.generateDescription(imageBytes);

        System.out.println(description);

        assertNotNull(description);
        assertFalse(description.isBlank());
    }
}
