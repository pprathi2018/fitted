package com.fitted.service.ai.vision;

public interface VisionAIService {

    /**
     * Generates a rich text description of a clothing item from its image.
     *
     * @param imageBytes the background-removed clothing item image as bytes
     * @return a detailed text description, or null if the image is not a clothing item
     */
    String generateDescription(byte[] imageBytes);
}
