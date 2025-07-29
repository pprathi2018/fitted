package com.fitted.service.auth.controller;

import com.fitted.service.auth.dto.AuthResponse;
import com.fitted.service.auth.dto.LoginRequest;
import com.fitted.service.auth.dto.RefreshTokenRequest;
import com.fitted.service.auth.dto.SignUpRequest;
import com.fitted.service.auth.service.FittedUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
public class UserController {

    @Autowired
    private final FittedUserService fittedUserService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignUpRequest request) {
        log.info("Sign up request received for email: {}", request.getEmail());
        AuthResponse authResponse = fittedUserService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Log in request received for email: {}", request.getEmail());
        AuthResponse authResponse = fittedUserService.login(request);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Refresh token request received");
        AuthResponse authResponse = fittedUserService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Logout request received");
        fittedUserService.logout(request.getRefreshToken());
        return ResponseEntity.status(HttpStatusCode.valueOf(200)).build();
    }


}
