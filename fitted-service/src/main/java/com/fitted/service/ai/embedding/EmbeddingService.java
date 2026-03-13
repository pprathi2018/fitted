package com.fitted.service.ai.embedding;

public interface EmbeddingService {

    /**
     * Generates a vector embedding of a clothing item image.
     *
     * @param imageBytes the background-removed clothing item image as bytes
     * @return a float array representing the embedding vector
     */
    float[] generateEmbedding(byte[] imageBytes);
}
