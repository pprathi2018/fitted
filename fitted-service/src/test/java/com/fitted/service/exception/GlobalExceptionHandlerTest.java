package com.fitted.service.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @Test
    void handleResourceNotFound_ReturnsNotFound() {
        // Arrange
        ResourceNotFoundException exception = new ResourceNotFoundException("Resource not found");

        // Act
        ResponseEntity<String> response = globalExceptionHandler.handleResourceNotFound(exception);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Resource not found", response.getBody());
    }

    @Test
    void handleValidation_ReturnsBadRequest() {
        // Arrange
        ValidationException exception = new ValidationException("Validation failed");

        // Act
        ResponseEntity<String> response = globalExceptionHandler.handleValidation(exception);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody());
    }

    @Test
    void handleMaxUploadSizeExceeded_ReturnsBadRequest() {
        // Arrange
        MaxUploadSizeExceededException exception = new MaxUploadSizeExceededException(1000L);

        // Act
        ResponseEntity<String> response = globalExceptionHandler.handleMaxUploadSizeExceeded(exception);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Uploaded image breached the size limit of 5 GB", response.getBody());
    }

    @Test
    void handleInternalServer_ReturnsInternalServerError() {
        // Arrange
        InternalServerException exception = new InternalServerException("Internal error");

        // Act
        ResponseEntity<String> response = globalExceptionHandler.handleInternalServer(exception);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Internal server error", response.getBody());
    }

    @Test
    void handleGeneral_ReturnsInternalServerError() {
        // Arrange
        Exception exception = new Exception("Unexpected error");

        // Act
        ResponseEntity<String> response = globalExceptionHandler.handleGeneral(exception);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Internal server error", response.getBody());
    }
}