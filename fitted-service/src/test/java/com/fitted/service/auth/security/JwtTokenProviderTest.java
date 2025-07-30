package com.fitted.service.auth.security;

import com.fitted.service.auth.properties.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.crypto.SecretKey;
import java.util.UUID;

import static com.fitted.service.auth.utils.AuthTestDataUtils.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @Mock
    private JwtProperties jwtProperties;

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        // Setup will be done in individual tests to avoid unnecessary stubbing
    }

    @Test
    void generateAccessToken_Success() {
        // Given
        when(jwtProperties.getSecret()).thenReturn(TEST_JWT_SECRET);
        when(jwtProperties.getAccessTokenExpiration()).thenReturn(ACCESS_TOKEN_EXPIRATION);

        // When
        String token = jwtTokenProvider.generateAccessToken(TEST_USER_ID, TEST_EMAIL);

        // Then
        assertThat(token).isNotEmpty();

        // Verify token can be parsed
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_JWT_SECRET));
        var claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertThat(claims.getSubject()).isEqualTo(TEST_USER_ID.toString());
        assertThat(claims.get("email", String.class)).isEqualTo(TEST_EMAIL);
    }

    @Test
    void generateRefreshToken_Success() {
        // When
        String refreshToken = jwtTokenProvider.generateRefreshToken();

        // Then
        assertThat(refreshToken).matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
    }

    @Test
    void getUserIdFromToken_Success() {
        // Given
        when(jwtProperties.getSecret()).thenReturn(TEST_JWT_SECRET);
        when(jwtProperties.getAccessTokenExpiration()).thenReturn(ACCESS_TOKEN_EXPIRATION);
        String token = jwtTokenProvider.generateAccessToken(TEST_USER_ID, TEST_EMAIL);

        // When
        UUID extractedUserId = jwtTokenProvider.getUserIdFromToken(token);

        // Then
        assertThat(extractedUserId).isEqualTo(TEST_USER_ID);
    }

    @Test
    void validateToken_ValidToken_ReturnsTrue() {
        // Given
        when(jwtProperties.getSecret()).thenReturn(TEST_JWT_SECRET);
        when(jwtProperties.getAccessTokenExpiration()).thenReturn(ACCESS_TOKEN_EXPIRATION);
        String token = jwtTokenProvider.generateAccessToken(TEST_USER_ID, TEST_EMAIL);

        // When
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void validateToken_InvalidToken_ReturnsFalse() {
        // Given
        when(jwtProperties.getSecret()).thenReturn(TEST_JWT_SECRET);

        // When
        boolean isValid = jwtTokenProvider.validateToken("invalid.jwt.token");

        // Then
        assertThat(isValid).isFalse();
    }
}