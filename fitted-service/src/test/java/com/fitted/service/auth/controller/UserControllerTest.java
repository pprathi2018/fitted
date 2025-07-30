package com.fitted.service.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitted.service.auth.dto.LoginRequest;
import com.fitted.service.auth.dto.RefreshTokenRequest;
import com.fitted.service.auth.dto.SignUpRequest;
import com.fitted.service.auth.service.FittedUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static com.fitted.service.auth.utils.AuthTestDataUtils.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private FittedUserService fittedUserService;

    @InjectMocks
    private UserController userController;

    @Test
    void signup_Success() {
        // Given
        SignUpRequest request = createSignUpRequest();
        when(fittedUserService.signup(any(SignUpRequest.class))).thenReturn(createAuthResponse());

        // When
        ResponseEntity<?> response = userController.signup(request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(createAuthResponse());
    }

    @Test
    void login_Success() {
        // Given
        LoginRequest request = createLoginRequest();
        when(fittedUserService.login(any(LoginRequest.class))).thenReturn(createAuthResponse());

        // When
        ResponseEntity<?> response = userController.login(request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(createAuthResponse());
    }

    @Test
    void refresh_Success() {
        // Given
        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken(TEST_REFRESH_TOKEN)
                .build();
        when(fittedUserService.refreshToken(TEST_REFRESH_TOKEN)).thenReturn(createAuthResponse());

        // When
        ResponseEntity<?> response = userController.refresh(request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(createAuthResponse());
    }

    @Test
    void logout_Success() {
        // Given
        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken(TEST_REFRESH_TOKEN)
                .build();
        doNothing().when(fittedUserService).logout(TEST_REFRESH_TOKEN);

        // When
        ResponseEntity<Void> response = userController.logout(request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}