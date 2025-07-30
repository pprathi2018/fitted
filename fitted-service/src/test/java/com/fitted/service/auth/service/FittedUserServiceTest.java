package com.fitted.service.auth.service;

import com.fitted.service.auth.dto.AuthResponse;
import com.fitted.service.auth.model.RefreshToken;
import com.fitted.service.auth.model.Users;
import com.fitted.service.auth.properties.JwtProperties;
import com.fitted.service.auth.repository.RefreshTokenRepository;
import com.fitted.service.auth.repository.UserRepository;
import com.fitted.service.auth.security.JwtTokenProvider;
import com.fitted.service.auth.validator.FittedPasswordValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static com.fitted.service.auth.utils.AuthTestDataUtils.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FittedUserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private FittedPasswordValidator passwordValidator;
    @Mock
    private PasswordEncoder encoder;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private JwtProperties jwtProperties;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private FittedUserService userService;

    @Test
    void signup_Success() {
        // Given
        Users testUser = createTestUser();
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(encoder.encode(anyString())).thenReturn(TEST_PASSWORD_HASH);
        when(userRepository.save(any(Users.class))).thenReturn(testUser);
        when(tokenProvider.generateAccessToken(any(UUID.class), anyString())).thenReturn(TEST_ACCESS_TOKEN);
        when(tokenProvider.generateRefreshToken()).thenReturn(TEST_REFRESH_TOKEN);
        when(jwtProperties.getRefreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);

        // When
        AuthResponse response = userService.signup(createSignUpRequest());

        // Then
        assertThat(response.getAccessToken()).isEqualTo(TEST_ACCESS_TOKEN);
        assertThat(response.getRefreshToken()).isEqualTo(TEST_REFRESH_TOKEN);
        verify(passwordValidator).validate(TEST_PASSWORD);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void signup_PasswordMismatch_ThrowsException() {
        // Given
        var request = createSignUpRequest();
        request.setPasswordConfirmation("DifferentPassword");

        // When & Then
        assertThatThrownBy(() -> userService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Passwords do not match!");
    }

    @Test
    void signup_EmailAlreadyExists_ThrowsException() {
        // Given
        when(userRepository.findByEmailIgnoreCase(TEST_EMAIL)).thenReturn(Optional.of(createTestUser()));

        // When & Then
        assertThatThrownBy(() -> userService.signup(createSignUpRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email is already registered!");
    }

    @Test
    void login_Success() {
        // Given
        Users testUser = createTestUser();
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findByEmailIgnoreCase(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateAccessToken(any(UUID.class), anyString())).thenReturn(TEST_ACCESS_TOKEN);
        when(tokenProvider.generateRefreshToken()).thenReturn(TEST_REFRESH_TOKEN);
        when(jwtProperties.getRefreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);

        // When
        AuthResponse response = userService.login(createLoginRequest());

        // Then
        assertThat(response.getAccessToken()).isEqualTo(TEST_ACCESS_TOKEN);
        verify(refreshTokenRepository).revokeAllUsersTokens(TEST_USER_ID);
    }

    @Test
    void refreshToken_Success() {
        // Given
        Users testUser = createTestUser();
        RefreshToken refreshToken = createValidRefreshToken(testUser);

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(refreshToken));
        when(userRepository.findById(TEST_USER_ID)).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateAccessToken(any(UUID.class), anyString())).thenReturn(TEST_ACCESS_TOKEN);
        when(tokenProvider.generateRefreshToken()).thenReturn(TEST_REFRESH_TOKEN);
        when(jwtProperties.getRefreshTokenExpiration()).thenReturn(REFRESH_TOKEN_EXPIRATION);

        // When
        AuthResponse response = userService.refreshToken("any-token");

        // Then
        assertThat(response.getAccessToken()).isEqualTo(TEST_ACCESS_TOKEN);
        assertThat(refreshToken.getRevoked()).isTrue();
    }

    @Test
    void refreshToken_InvalidToken_ThrowsException() {
        // Given
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.refreshToken("invalid-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid refresh token");
    }

    @Test
    void logout_Success() {
        // Given
        RefreshToken refreshToken = mock(RefreshToken.class);
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(refreshToken));

        // When
        userService.logout("any-token");

        // Then
        verify(refreshToken).setRevoked(true);
        verify(refreshTokenRepository).save(refreshToken);
    }
}