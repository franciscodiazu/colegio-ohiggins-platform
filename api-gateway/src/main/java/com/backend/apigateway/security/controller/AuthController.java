package com.backend.apigateway.security.controller;

import com.backend.apigateway.exception.ApiError;
import com.backend.apigateway.security.dto.LoginRequest;
import com.backend.apigateway.security.dto.LoginResponse;
import com.backend.apigateway.security.dto.RefreshRequest;
import com.backend.apigateway.security.dto.RegisterRequest;
import com.backend.apigateway.security.dto.ResetPasswordRequest;
import com.backend.apigateway.security.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Intento de login para: {}", request.getUsername());
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Login fallido para {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError(LocalDateTime.now(), HttpStatus.UNAUTHORIZED.value(),
                            "No Autorizado", e.getMessage(), null));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequest request) {
        log.info("Solicitud de refresh token");
        try {
            LoginResponse response = authService.refresh(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Refresh fallido: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError(LocalDateTime.now(), HttpStatus.UNAUTHORIZED.value(),
                            "No Autorizado", e.getMessage(), null));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registro de nuevo usuario: {}", request.getUsername());
        try {
            LoginResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.warn("Registro fallido para {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiError(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(),
                            "Registro Fallido", e.getMessage(), null));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Solicitud de reset password para: {}", request.getUsername());
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.OK.value())
                .error("OK")
                .message("Contrasena actualizada correctamente.")
                .build());
        } catch (RuntimeException e) {
            log.warn("Reset password fallido para {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiError(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(),
                            "Error", e.getMessage(), null));
        }
    }
}