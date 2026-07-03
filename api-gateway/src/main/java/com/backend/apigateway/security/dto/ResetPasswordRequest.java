package com.backend.apigateway.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "El correo es obligatorio")
    private String username;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    private String newPassword;
}
