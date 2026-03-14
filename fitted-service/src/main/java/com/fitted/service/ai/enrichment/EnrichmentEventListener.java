package com.fitted.service.ai.enrichment;

import com.fitted.service.ai.embedding.EmbeddingService;
import com.fitted.service.ai.vision.VisionAIService;
import com.fitted.service.model.ClothingItem;
import com.fitted.service.model.ClothingItemEmbedding;
import com.fitted.service.model.EnrichmentStatus;
import com.fitted.service.repository.ClothingItemEmbeddingRepository;
import com.fitted.service.repository.ClothingItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@RequiredArgsConstructor
@Log4j2
public class EnrichmentEventListener {

    private final VisionAIService visionAIService;
    private final EmbeddingService embeddingService;
    private final ClothingItemRepository clothingItemRepository;
    private final ClothingItemEmbeddingRepository clothingItemEmbeddingRepository;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Async("enrichment-executor")
    @TransactionalEventListener
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void handleClothingItemCreated(ClothingItemCreatedEvent event) {
        UUID clothingItemId = event.getClothingItemId();
        log.info("Starting enrichment for clothing item: {}", clothingItemId);

        ClothingItem clothingItem = clothingItemRepository.findById(clothingItemId).orElse(null);
        if (clothingItem == null) {
            log.warn("Clothing item not found for enrichment: {}", clothingItemId);
            return;
        }

        clothingItem.setEnrichmentStatus(EnrichmentStatus.PENDING);
        clothingItemRepository.save(clothingItem);

        try {
            byte[] imageBytes = downloadImage(event.getModifiedImageUrl());

            String description = visionAIService.generateDescription(imageBytes);
            if (description != null) {
                clothingItem.setAiDescription(description);
                log.info("AI description generated for clothing item: {}", clothingItemId);
            } else {
                log.warn("Image not recognized as clothing item: {}", clothingItemId);
            }

            float[] embedding = embeddingService.generateEmbedding(imageBytes);
            ClothingItemEmbedding clothingItemEmbedding = ClothingItemEmbedding.builder()
                    .clothingItemId(clothingItemId)
                    .userId(clothingItem.getUser().getId())
                    .embedding(embedding)
                    .build();
            clothingItemEmbeddingRepository.save(clothingItemEmbedding);
            log.info("Embedding saved for clothing item: {}", clothingItemId);

            clothingItem.setEnrichmentStatus(EnrichmentStatus.COMPLETED);
            log.info("Enrichment completed for clothing item: {}", clothingItemId);
        } catch (Exception e) {
            clothingItem.setEnrichmentStatus(EnrichmentStatus.FAILED);
            log.error("Enrichment failed for clothing item: {}", clothingItemId, e);
        }

        clothingItemRepository.save(clothingItem);
    }

    private byte[] downloadImage(String imageUrl) throws IOException, InterruptedException {
        log.info("Downloading image from: {}", imageUrl);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(imageUrl))
                .GET()
                .build();

        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

        if (response.statusCode() != 200) {
            throw new IOException("Failed to download image, status: " + response.statusCode());
        }

        log.info("Downloaded image: {} bytes", response.body().length);
        return response.body();
    }
}
