package com.fitted.service.ai.chat;

import com.fitted.service.model.ClothingItem;
import com.fitted.service.repository.ClothingItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class ClosetContextBuilder {

    private final ClothingItemRepository clothingItemRepository;

    public String buildContext(UUID userId) {
        List<ClothingItem> items = clothingItemRepository.findByUserId(userId);
        log.info("Building closet context for user {} with {} items", userId, items.size());

        if (items.isEmpty()) {
            return "The user's closet is empty. They have no clothing items yet.";
        }

        StringBuilder context = new StringBuilder();
        context.append("The user has ").append(items.size()).append(" items in their closet:\n\n");

        for (ClothingItem item : items) {
            context.append(formatItem(item)).append("\n\n");
        }

        return context.toString().trim();
    }

    private String formatItem(ClothingItem item) {
        StringBuilder entry = new StringBuilder();
        entry.append("[Item ID: ").append(item.getId()).append("] ");
        entry.append("\"").append(item.getName()).append("\" | ");
        entry.append("Type: ").append(item.getType()).append(" | ");
        entry.append("Color: ").append(item.getColor() != null ? item.getColor() : "unspecified");

        if (item.getAiDescription() != null && !item.getAiDescription().isBlank()) {
            entry.append("\n").append(item.getAiDescription());
        } else {
            entry.append("\n(No detailed description available)");
        }

        return entry.toString();
    }
}
