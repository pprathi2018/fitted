package com.fitted.service.ai.chat;

import com.fitted.service.model.ClothingItem;
import com.fitted.service.model.ClothingType;
import com.fitted.service.model.EnrichmentStatus;
import com.fitted.service.repository.ClothingItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClosetContextBuilderTest {

    @Mock
    private ClothingItemRepository clothingItemRepository;

    @InjectMocks
    private ClosetContextBuilder closetContextBuilder;

    @Test
    void buildContext_EmptyCloset_ReturnsEmptyMessage() {
        UUID userId = UUID.randomUUID();
        when(clothingItemRepository.findByUserId(userId)).thenReturn(List.of());

        String context = closetContextBuilder.buildContext(userId);

        assertEquals("The user's closet is empty. They have no clothing items yet.", context);
    }

    @Test
    void buildContext_WithEnrichedItems_IncludesAiDescription() {
        UUID userId = UUID.randomUUID();
        ClothingItem item = ClothingItem.builder()
                .id(UUID.randomUUID())
                .name("Blue Denim Jacket")
                .type(ClothingType.OUTERWEAR)
                .color("Blue")
                .aiDescription("A medium-wash blue denim trucker jacket with brass buttons.")
                .enrichmentStatus(EnrichmentStatus.COMPLETED)
                .build();

        when(clothingItemRepository.findByUserId(userId)).thenReturn(List.of(item));

        String context = closetContextBuilder.buildContext(userId);

        assertTrue(context.contains("[Item ID: " + item.getId() + "]"));
        assertTrue(context.contains("\"Blue Denim Jacket\""));
        assertTrue(context.contains("Type: OUTERWEAR"));
        assertTrue(context.contains("Color: Blue"));
        assertTrue(context.contains("A medium-wash blue denim trucker jacket"));
    }

    @Test
    void buildContext_WithoutAiDescription_ShowsFallback() {
        UUID userId = UUID.randomUUID();
        ClothingItem item = ClothingItem.builder()
                .id(UUID.randomUUID())
                .name("White Sneakers")
                .type(ClothingType.SHOES)
                .color("White")
                .enrichmentStatus(EnrichmentStatus.NONE)
                .build();

        when(clothingItemRepository.findByUserId(userId)).thenReturn(List.of(item));

        String context = closetContextBuilder.buildContext(userId);

        assertTrue(context.contains("\"White Sneakers\""));
        assertTrue(context.contains("(No detailed description available)"));
        assertFalse(context.contains("AI Description:"));
    }

    @Test
    void buildContext_MultipleItems_IncludesCount() {
        UUID userId = UUID.randomUUID();
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

        when(clothingItemRepository.findByUserId(userId)).thenReturn(List.of(item1, item2));

        String context = closetContextBuilder.buildContext(userId);

        assertTrue(context.startsWith("The user has 2 items in their closet:"));
        assertTrue(context.contains("\"Blue Shirt\""));
        assertTrue(context.contains("\"Black Pants\""));
    }
}
