package com.fitted.service.ai.chat;

import com.fitted.service.model.ClothingItem;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Log4j2
public class ClosetContextBuilder {

    public String buildContext(List<ClothingItem> items) {
        log.info("Building closet context with {} items", items.size());

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
