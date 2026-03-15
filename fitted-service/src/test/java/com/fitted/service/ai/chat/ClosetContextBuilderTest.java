package com.fitted.service.ai.chat;

import com.fitted.service.model.ClothingItem;
import com.fitted.service.model.ClothingType;
import com.fitted.service.model.EnrichmentStatus;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClosetContextBuilderTest {

    private final ClosetContextBuilder closetContextBuilder = new ClosetContextBuilder();

    @Test
    void buildContext_EmptyCloset_ReturnsEmptyMessage() {
        String context = closetContextBuilder.buildContext(List.of());

        assertEquals("The user's closet is empty. They have no clothing items yet.", context);
    }

    @Test
    void buildContext_WithEnrichedItems_IncludesAiDescription() {
        ClothingItem item = ClothingItem.builder()
                .id(UUID.randomUUID())
                .name("Blue Denim Jacket")
                .type(ClothingType.OUTERWEAR)
                .color("Blue")
                .aiDescription("A medium-wash blue denim trucker jacket with brass buttons.")
                .enrichmentStatus(EnrichmentStatus.COMPLETED)
                .build();

        String context = closetContextBuilder.buildContext(List.of(item));

        assertTrue(context.contains("[Item ID: " + item.getId() + "]"));
        assertTrue(context.contains("\"Blue Denim Jacket\""));
        assertTrue(context.contains("Type: OUTERWEAR"));
        assertTrue(context.contains("Color: Blue"));
        assertTrue(context.contains("A medium-wash blue denim trucker jacket"));
    }

    @Test
    void buildContext_WithoutAiDescription_ShowsFallback() {
        ClothingItem item = ClothingItem.builder()
                .id(UUID.randomUUID())
                .name("White Sneakers")
                .type(ClothingType.SHOES)
                .color("White")
                .enrichmentStatus(EnrichmentStatus.NONE)
                .build();

        String context = closetContextBuilder.buildContext(List.of(item));

        assertTrue(context.contains("\"White Sneakers\""));
        assertTrue(context.contains("(No detailed description available)"));
        assertFalse(context.contains("AI Description:"));
    }

    @Test
    void buildContext_MultipleItems_IncludesCount() {
        ClothingItem item1 = ClothingItem.builder()
                .id(UUID.randomUUID())
                .name("Blue Shirt")
                .type(ClothingType.TOP)
                .color("Blue")
                .aiDescription("A classic blue button-down shirt.")
                .enrichmentStatus(EnrichmentStatus.COMPLETED)
                .build();
        ClothingItem item2 = ClothingItem.builder()
                .id(UUID.randomUUID())
                .name("Black Pants")
                .type(ClothingType.BOTTOM)
                .color("Black")
                .enrichmentStatus(EnrichmentStatus.NONE)
                .build();

        String context = closetContextBuilder.buildContext(List.of(item1, item2));

        assertTrue(context.startsWith("The user has 2 items in their closet:"));
        assertTrue(context.contains("\"Blue Shirt\""));
        assertTrue(context.contains("\"Black Pants\""));
    }
}
