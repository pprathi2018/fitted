package com.fitted.service.auth.validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FittedPasswordValidatorTest {

    private FittedPasswordValidator validator;

    @BeforeEach
    void setUp() {
        validator = new FittedPasswordValidator();
    }

    @Test
    void validate_ValidPassword_Success() {
        // When & Then - Should not throw
        validator.validate("ValidPass123");
    }

    @Test
    void validate_TooShort_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> validator.validate("Short1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Password must be 8 or more characters in length.");
    }

    @Test
    void validate_TooLong_ThrowsException() {
        // When & Then
        String longPassword = "a".repeat(129);
        assertThatThrownBy(() -> validator.validate(longPassword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Password must be no more than 128 characters in length.");
    }

    @Test
    void validate_WithWhitespace_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> validator.validate("Pass word 123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Password contains a whitespace character.");
    }

    @Test
    void isValidPassword_ValidPassword_ReturnsTrue() {
        // When
        boolean isValid = validator.isValidPassword("ValidPass123");

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void isValidPassword_InvalidPassword_ReturnsFalse() {
        // When
        boolean isValid = validator.isValidPassword("short");

        // Then
        assertThat(isValid).isFalse();
    }
}