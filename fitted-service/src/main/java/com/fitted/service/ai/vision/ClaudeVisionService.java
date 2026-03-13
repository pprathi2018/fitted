package com.fitted.service.ai.vision;

import com.anthropic.client.AnthropicClient;
import com.anthropic.models.messages.*;
import com.fitted.service.ai.config.AIProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ClaudeVisionService implements VisionAIService {

    private final AnthropicClient anthropicClient;
    private final AIProperties aiProperties;

    static final String NOT_A_CLOTHING_ITEM = "NOT_A_CLOTHING_ITEM";

    private static final String DESCRIPTION_PROMPT = """
            You are a fashion expert analyzing clothing items. Given an image, first \
            determine if it is a clothing item or accessory (shoes, hats, bags, jewelry, \
            scarves, belts, etc. count as valid items). If the image is clearly NOT a \
            clothing item or fashion accessory, respond with exactly: NOT_A_CLOTHING_ITEM

            If it IS a clothing item or accessory, provide a detailed description \
            covering the following aspects:

            - Colors: primary and secondary colors
            - Pattern: solid, striped, plaid, floral, graphic, etc.
            - Material: your best guess — cotton, denim, polyester, leather, wool, etc.
            - Style: slim fit, regular, oversized, cropped, etc.
            - Formality: casual, smart casual, business casual, business, formal
            - Seasons: spring, summer, fall, winter — list all applicable
            - Subcategory: specific item type, e.g., "crew neck t-shirt", "chino shorts"
            - Details: notable features like logos, distressing, pockets, hood, etc.

            Write this as a single flowing paragraph, not as a list. Do not include \
            any headers, titles, or markdown formatting. Be concise but thorough. \
            Focus on visual attributes that would help in outfit matching.""";

    @Override
    public String generateDescription(byte[] imageBytes) {
        log.info("Generating AI description for clothing item image ({} bytes)", imageBytes.length);

        String encodedImage = Base64.getEncoder().encodeToString(imageBytes);
        Base64ImageSource.MediaType mediaType = detectMediaType(imageBytes);

        List<ContentBlockParam> content = List.of(
                ContentBlockParam.ofImage(
                        ImageBlockParam.builder()
                                .source(Base64ImageSource.builder()
                                        .mediaType(mediaType)
                                        .data(encodedImage)
                                        .build())
                                .build()
                ),
                ContentBlockParam.ofText(
                        TextBlockParam.builder()
                                .text(DESCRIPTION_PROMPT)
                                .build()
                )
        );

        MessageCreateParams params = MessageCreateParams.builder()
                .model(aiProperties.getAnthropic().getVisionModel())
                .maxTokens(500)
                .addUserMessageOfBlockParams(content)
                .build();

        Message response = anthropicClient.messages().create(params);

        String description = response.content().stream()
                .flatMap(block -> block.text().stream())
                .map(TextBlock::text)
                .findFirst()
                .orElse("");

        if (description.strip().equals(NOT_A_CLOTHING_ITEM)) {
            log.warn("Image was not recognized as a clothing item");
            return null;
        }

        log.info("AI description generated successfully ({} chars)", description.length());
        return description;
    }

    private Base64ImageSource.MediaType detectMediaType(byte[] imageBytes) {
        if (imageBytes.length >= 3
                && imageBytes[0] == (byte) 0xFF
                && imageBytes[1] == (byte) 0xD8
                && imageBytes[2] == (byte) 0xFF) {
            return Base64ImageSource.MediaType.IMAGE_JPEG;
        }
        // Default to PNG — background-removed images are always PNG
        return Base64ImageSource.MediaType.IMAGE_PNG;
    }
}
