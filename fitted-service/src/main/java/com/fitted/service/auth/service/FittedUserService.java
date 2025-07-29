package com.fitted.service.auth.service;

import com.fitted.service.auth.dto.AuthResponse;
import com.fitted.service.auth.dto.LoginRequest;
import com.fitted.service.auth.dto.SignUpRequest;
import com.fitted.service.auth.model.RefreshToken;
import com.fitted.service.auth.model.Users;
import com.fitted.service.auth.properties.JwtProperties;
import com.fitted.service.auth.repository.RefreshTokenRepository;
import com.fitted.service.auth.repository.UserRepository;
import com.fitted.service.auth.security.JwtTokenProvider;
import com.fitted.service.auth.validator.FittedPasswordValidator;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@Log4j2
public class FittedUserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private FittedPasswordValidator passwordValidator;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private JwtTokenProvider tokenProvider;
    @Autowired
    private JwtProperties jwtProperties;
    @Autowired
    private AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse signup(SignUpRequest request) {
        log.info("Processing signup request for email: {}", request.getEmail());
        if (!request.getPassword().equals(request.getPasswordConfirmation())) {
            throw new IllegalArgumentException("Passwords do not match!");
        }

        if (userRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        passwordValidator.validate(request.getPassword());

        Users newUser = Users.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .passwordHash(encoder.encode(request.getPassword()))
                .emailVerified(false)
                .build();
        Users savedUser = userRepository.save(newUser);
        log.info("Created new user with ID: {}", savedUser.getId());

        log.info("Revoking existing refresh tokens and creating new tokens for user with ID: {}", savedUser.getId());
        refreshTokenRepository.revokeAllUsersTokens(newUser.getId());

        return saveNewTokens(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Processing login request for email: {}", request.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        if (authentication.isAuthenticated()) {
            Users user = userRepository.findByEmailIgnoreCase(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException(
                            String.format("User not found with email: %s", request.getEmail())));

            refreshTokenRepository.revokeAllUsersTokens(user.getId());
            return saveNewTokens(user);
        }

        throw new IllegalArgumentException("Login attempt failed.");
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        log.info("Processing logout request");

        String tokenHash = hashToken(refreshTokenStr);

        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            log.info("Revoked refresh token for user");
        });
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        log.info("Processing refresh token request");

        String tokenHash = hashToken(refreshTokenStr);

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            throw new IllegalArgumentException("Refresh token is expired or revoked");
        }

        Users user = userRepository.findById(refreshToken.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        log.info("Refreshed token for user id: {}, email: {}", user.getId(), user.getEmail());

        return saveNewTokens(user);
    }

    private AuthResponse saveNewTokens(Users user) {
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshTokenStr = tokenProvider.generateRefreshToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(refreshTokenStr))
                .expiresAt(LocalDateTime.now().plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000))
                .build();

        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .build())
                .build();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}
