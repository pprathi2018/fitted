package com.fitted.service.ai.enrichment;

import com.fitted.service.ai.config.AIProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class EnrichmentPublisher {

    private final ApplicationEventPublisher eventPublisher;
    private final AIProperties aiProperties;

    public void publishClothingItemCreated(UUID clothingItemId, String modifiedImageUrl) {
        if (!aiProperties.getEnrichment().isEnabled()) {
            log.info("Enrichment is disabled, skipping event for clothing item: {}", clothingItemId);
            return;
        }

        log.info("Publishing enrichment event for clothing item: {}", clothingItemId);
        eventPublisher.publishEvent(
                new ClothingItemCreatedEvent(this, clothingItemId, modifiedImageUrl)
        );
    }
}
