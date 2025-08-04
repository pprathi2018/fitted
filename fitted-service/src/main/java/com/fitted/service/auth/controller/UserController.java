package com.fitted.service.auth.controller;

import com.fitted.service.auth.dto.AuthResponse;
import com.fitted.service.auth.dto.LoginRequest;
import com.fitted.service.auth.dto.RefreshTokenRequest;
import com.fitted.service.auth.dto.SignUpRequest;
import com.fitted.service.auth.model.UserPrincipal;
import com.fitted.service.auth.service.FittedUserService;
import com.fitted.service.auth.utils.CookieUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
public class UserController {

    @Autowired
    private final FittedUserService fittedUserService;

    @Autowired
    private final CookieUtils cookieUtils;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignUpRequest request) {
        log.info("Sign up request received for email: {}", request.getEmail());
        AuthResponse authResponse = fittedUserService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createAccessTokenCookie(authResponse.getAccessToken()))
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createRefreshTokenCookie(authResponse.getRefreshToken()))
                .body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Log in request received for email: {}", request.getEmail());
        AuthResponse authResponse = fittedUserService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createAccessTokenCookie(authResponse.getAccessToken()))
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createRefreshTokenCookie(authResponse.getRefreshToken()))
                .body(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshTokenFromCookie,
            @Valid @RequestBody(required = false) RefreshTokenRequest request) {
        log.info("Refresh token request received");
        String refreshToken = Objects.nonNull(refreshTokenFromCookie) ? refreshTokenFromCookie :
                Objects.nonNull(request) && Objects.nonNull(request.getRefreshToken()) ? request.getRefreshToken() :
                null;

        if (Objects.isNull(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AuthResponse authResponse = fittedUserService.refreshToken(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createAccessTokenCookie(authResponse.getAccessToken()))
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createRefreshTokenCookie(authResponse.getRefreshToken()))
                .body(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshTokenFromCookie,
            @Valid @RequestBody(required = false) RefreshTokenRequest request) {
        log.info("Logout request received");
        String refreshToken = Objects.nonNull(refreshTokenFromCookie) ? refreshTokenFromCookie : request.getRefreshToken();
        fittedUserService.logout(refreshToken);
        return ResponseEntity.status(HttpStatusCode.valueOf(200))
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createLogoutCookie("accessToken"))
                .header(HttpHeaders.SET_COOKIE, cookieUtils.createLogoutCookie("refreshToken"))
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserInfo> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Get current user request received");

        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
                .id(userPrincipal.user().getId().toString())
                .email(userPrincipal.user().getEmail())
                .firstName(userPrincipal.user().getFirstName())
                .lastName(userPrincipal.user().getLastName())
                .build();

        log.info("Returned current user: {}", userInfo.getEmail());

        return ResponseEntity.ok(userInfo);
    }
}
