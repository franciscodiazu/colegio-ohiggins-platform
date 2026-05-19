package com.backend.ms_attendance.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * ErrorResponse - Estructura unificada para todas las respuestas de error
 *
 * Proporciona:
 * - timestamp: Cuándo ocurrió el error (auditoría)
 * - status: Código HTTP
 * - error: Nombre corto del error
 * - mensaje: Descripción clara para el cliente
 * - detalles: Información adicional (solo cuando es relevante)
 * - path: URI que causó el error (debugging)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String mensaje;
    private Map<String, String> detalles;
    private String path;
}

