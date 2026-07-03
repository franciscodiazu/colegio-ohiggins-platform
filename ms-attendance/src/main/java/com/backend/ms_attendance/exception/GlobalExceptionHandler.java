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

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntidadNoEncontradaException.class)
    public ResponseEntity<ApiError> manejarEntidadNoEncontrada(
        EntidadNoEncontradaException ex,
        WebRequest request
    ) {
        log.warn("Entidad no encontrada [{}]: {} [URI: {}]",
            ex.getCode(), ex.getMessage(), request.getDescription(false));

        ApiError error = ApiError.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Entidad No Encontrada")
            .code(ex.getCode())
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ServicioNoDisponibleException.class)
    public ResponseEntity<ApiError> manejarServicioNoDisponible(
        ServicioNoDisponibleException ex,
        WebRequest request
    ) {
        log.error("Servicio no disponible [{}]: {} [URI: {}]",
            ex.getCode(), ex.getMessage(), request.getDescription(false));

        ApiError error = ApiError.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.SERVICE_UNAVAILABLE.value())
            .error("Servicio No Disponible")
            .code(ex.getCode())
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiError> manejarReglaDeNegocio(
        BusinessRuleException ex,
        WebRequest request
    ) {
        log.warn("Regla de negocio [{}]: {} [URI: {}]",
            ex.getCode(), ex.getMessage(), request.getDescription(false));

        ApiError error = ApiError.builder()
            .timestamp(LocalDateTime.now())
            .status(ex.getHttpStatus().value())
            .error("Regla de Negocio")
            .code(ex.getCode())
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, ex.getHttpStatus());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> manejarArgumentoIlegal(
        IllegalArgumentException ex,
        WebRequest request
    ) {
        log.warn("Argumento inválido: {} [URI: {}]",
            ex.getMessage(), request.getDescription(false));

        ApiError error = ApiError.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Argumento Inválido")
            .code("ARG-001")
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> manejarValidacionDto(
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

        ApiError error = ApiError.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validación de DTO Fallida")
            .code("VALID-001")
            .message("Los datos proporcionados no cumplen con las reglas de validación")
            .validations(erroresValidacion)
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> manejarExcepcionGeneral(
        Exception ex,
        WebRequest request
    ) {
        log.error("Excepción no controlada: {}", ex.getMessage(), ex);

        ApiError error = ApiError.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Error Interno del Servidor")
            .code("SYS-001")
            .message("Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> manejarRuntimeException(
        RuntimeException ex,
        WebRequest request
    ) {
        log.error("RuntimeException: {} [URI: {}]",
            ex.getMessage(), request.getDescription(false), ex);

        ApiError error = ApiError.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Error en Tiempo de Ejecución")
            .code("SYS-002")
            .message("Se produjo un error durante el procesamiento de su solicitud.")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
