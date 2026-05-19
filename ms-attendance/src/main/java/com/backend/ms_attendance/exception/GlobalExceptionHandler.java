package com.backend.ms_attendance.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler - Manejador centralizado de excepciones
 *
 * Patrones implementados:
 * - Centralized Exception Handling: Un único punto de manejo}
 * - Logging Estructurado: Incluye contexto completo sin exponer detalles internos
 * - Error Response Consistent: Respuestas unificadas en formato JSON
 *
 * Responsabilidades:
 * - Mapear excepciones de negocio a códigos HTTP apropiados (404, 503, 400, 500)
 * - Generar respuestas de error clara y consistentes
 * - Loguear eventos críticos para auditoría e debugging
 * - Proteger información sensible en producción
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja EntidadNoEncontradaException (404)
     * Se dispara cuando un estudiante referenciado no existe en ms-students
     */
    @ExceptionHandler(EntidadNoEncontradaException.class)
    public ResponseEntity<ErrorResponse> manejarEntidadNoEncontrada(
        EntidadNoEncontradaException ex,
        WebRequest request
    ) {
        log.warn("Entidad no encontrada: {} [URI: {}]",
            ex.getMessage(), request.getDescription(false));

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Entidad No Encontrada")
            .mensaje(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    /**
     * Maneja ServicioNoDisponibleException (503)
     * Se dispara cuando ms-students no está accesible, timeout, o caído
     */
    @ExceptionHandler(ServicioNoDisponibleException.class)
    public ResponseEntity<ErrorResponse> manejarServicioNoDisponible(
        ServicioNoDisponibleException ex,
        WebRequest request
    ) {
        log.error("Servicio no disponible: {} [URI: {}]",
            ex.getMessage(), request.getDescription(false));

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.SERVICE_UNAVAILABLE.value())
            .error("Servicio No Disponible")
            .mensaje("El servicio de validación está temporalmente no disponible. Intente más tarde.")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.SERVICE_UNAVAILABLE);
    }

    /**
     * Maneja IllegalArgumentException (400)
     * Se dispara por:
     * - DTO inválido para el tipo de registro
     * - Factory no encontrada para el tipo
     * - Validaciones de negocio fallidas
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> manejarArgumentoIlegal(
        IllegalArgumentException ex,
        WebRequest request
    ) {
        log.warn("Argumento inválido: {} [URI: {}]",
            ex.getMessage(), request.getDescription(false));

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Argumento Inválido")
            .mensaje(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja MethodArgumentNotValidException (400)
     * Se dispara cuando las anotaciones @Valid del DTO fallan
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarValidacionDto(
        MethodArgumentNotValidException ex,
        WebRequest request
    ) {
        Map<String, String> erroresValidacion = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String nombreCampo = ((FieldError) error).getField();
            String mensaje = error.getDefaultMessage();
            erroresValidacion.put(nombreCampo, mensaje);
        });

        log.warn("Validación de DTO fallida: {} campos inválidos [URI: {}]",
            erroresValidacion.size(), request.getDescription(false));

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validación de DTO Fallida")
            .mensaje("Los datos proporcionados no cumplen con las reglas de validación")
            .detalles(erroresValidacion)
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja excepciones genéricas no previstas (500)
     * Proporciona un catch-all para cualquier excepción no controlada
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> manejarExcepcionGeneral(
        Exception ex,
        WebRequest request
    ) {
        log.error("Excepción no controlada: {}", ex.getMessage(), ex);

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Error Interno del Servidor")
            .mensaje("Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Maneja RuntimeException (500)
     * Excepciones de tiempo de ejecución que indican problemas graves
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> manejarRuntimeException(
        RuntimeException ex,
        WebRequest request
    ) {
        log.error("RuntimeException: {} [URI: {}]",
            ex.getMessage(), request.getDescription(false), ex);

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Error en Tiempo de Ejecución")
            .mensaje("Se produjo un error durante el procesamiento de su solicitud.")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

