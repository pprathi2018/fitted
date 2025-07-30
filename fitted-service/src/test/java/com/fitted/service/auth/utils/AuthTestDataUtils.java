package com.fitted.service.auth.utils;

import com.fitted.service.auth.dto.AuthResponse;
import com.fitted.service.auth.dto.LoginRequest;
import com.fitted.service.auth.dto.SignUpRequest;
import com.fitted.service.auth.model.RefreshToken;
import com.fitted.service.auth.model.Users;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuthTestDataUtils {

    public static final UUID TEST_USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    public static final String TEST_EMAIL = "test@example.com";
    public static final String TEST_PASSWORD = "SecurePass123!";
    public static final String TEST_FIRST_NAME = "John";
    public static final String TEST_LAST_NAME = "Doe";
    public static final String TEST_ACCESS_TOKEN = "eyJhbGciOiJIUzUxMiJ9.test.token";
    public static final String TEST_REFRESH_TOKEN = "550e8400-e29b-41d4-a716-446655440000";
    public static final String TEST_TOKEN_HASH = "hashedToken123";
    public static final String TEST_PASSWORD_HASH = "$2a$12$xyzhashedpassword";

    // 512-bit key for HS512 testing
    public static final String TEST_JWT_SECRET = "404e635266556a586e327235753878214125442a472d4b6150645367566b59703373367639792442264529482b4d6251655468576d5a7134743777217a25432a";
    public static final Long ACCESS_TOKEN_EXPIRATION = 900000L; // 15 minutes
    public static final Long REFRESH_TOKEN_EXPIRATION = 604800000L; // 7 days

    public static Users createTestUser() {
        return Users.builder()
                .id(TEST_USER_ID)
                .email(TEST_EMAIL)
                .firstName(TEST_FIRST_NAME)
                .lastName(TEST_LAST_NAME)
                .passwordHash(TEST_PASSWORD_HASH)
                .emailVerified(false)
                .build();
    }

    public static SignUpRequest createSignUpRequest() {
        return SignUpRequest.builder()
                .email(TEST_EMAIL)
                .firstName(TEST_FIRST_NAME)
                .lastName(TEST_LAST_NAME)
                .password(TEST_PASSWORD)
                .passwordConfirmation(TEST_PASSWORD)
                .build();
    }

    public static LoginRequest createLoginRequest() {
        return LoginRequest.builder()
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .build();
    }

    public static AuthResponse createAuthResponse() {
        return AuthResponse.builder()
                .accessToken(TEST_ACCESS_TOKEN)
                .refreshToken(TEST_REFRESH_TOKEN)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(TEST_USER_ID.toString())
                        .email(TEST_EMAIL)
                        .firstName(TEST_FIRST_NAME)
                        .lastName(TEST_LAST_NAME)
                        .build())
                .build();
    }

    public static RefreshToken createValidRefreshToken(Users user) {
        return RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(user)
                .tokenHash(TEST_TOKEN_HASH)
                .revoked(false)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
    }

    public static RefreshToken createExpiredRefreshToken(Users user) {
        return RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(user)
                .tokenHash(TEST_TOKEN_HASH)
                .revoked(false)
                .expiresAt(LocalDateTime.now().minusDays(1))
                .build();
    }
}