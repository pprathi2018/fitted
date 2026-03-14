package com.fitted.service.ai.enrichment;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class ClothingItemCreatedEvent extends ApplicationEvent {

    private final UUID clothingItemId;
    private final String modifiedImageUrl;

    public ClothingItemCreatedEvent(Object source, UUID clothingItemId, String modifiedImageUrl) {
        super(source);
        this.clothingItemId = clothingItemId;
        this.modifiedImageUrl = modifiedImageUrl;
    }
}
