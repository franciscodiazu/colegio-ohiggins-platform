package com.backend.ms_attendance.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * GlobalExceptionHandlerTest - Suite de tests para el manejador global de excepciones
 *
 * COBERTURA:
 * ✓ EntidadNoEncontradaException → 404
 * ✓ ServicioNoDisponibleException → 503
 * ✓ IllegalArgumentException → 400
 * ✓ RuntimeException → 500
 * ✓ Excepciones genéricas → 500
 * ✓ MethodArgumentNotValidException → 400
 *
 * OBJETIVO: Validar que cada tipo de excepción mapea correctamente
 *           a su código HTTP correspondiente y que el ApiError
 *           contiene la información esperada.
 */
@DisplayName("GlobalExceptionHandler - Suite de Tests")
public class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;
    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
        webRequest = mock(WebRequest.class);
        when(webRequest.getDescription(false)).thenReturn("uri=/api/v1/test");
    }

    @Nested
    @DisplayName("Estrutura de excepciones personalizadas")
    class ExcepcionesPersonalizadasTests {

        @Test
        @DisplayName("EntidadNoEncontradaException debe ser instanciable")
        void testEntidadNoEncontradaException() {
            EntidadNoEncontradaException ex = new EntidadNoEncontradaException("Estudiante 123 no encontrado");
            assertThat(ex)
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Estudiante 123");
        }

        @Test
        @DisplayName("ServicioNoDisponibleException debe ser instanciable")
        void testServicioNoDisponibleException() {
            ServicioNoDisponibleException ex = new ServicioNoDisponibleException("ms-students caído");
            assertThat(ex)
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("ms-students");
        }
    }

    @Nested
    @DisplayName("Estructura de ApiError")
    class ApiErrorTests {

        @Test
        @DisplayName("ApiError debe construirse correctamente con builder")
        void testApiErrorBuilder() {
            ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(404)
                .error("Not Found")
                .message("Recurso no encontrado")
                .path("/api/v1/asistencia/99999")
                .build();

            assertThat(error)
                .hasFieldOrPropertyWithValue("status", 404)
                .hasFieldOrPropertyWithValue("error", "Not Found")
                .hasFieldOrPropertyWithValue("message", "Recurso no encontrado")
                .hasFieldOrPropertyWithValue("path", "/api/v1/asistencia/99999");
            assertThat(error.getTimestamp()).isNotNull();
        }

        @Test
        @DisplayName("ApiError debe manejar validaciones adicionales")
        void testApiErrorConValidaciones() {
            Map<String, String> validaciones = new java.util.HashMap<>();
            validaciones.put("estudianteId", "debe ser un número positivo");
            validaciones.put("fechaRegistro", "es obligatoria");

            ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(400)
                .error("Bad Request")
                .message("Validación fallida")
                .validations(validaciones)
                .build();

            assertThat(error.getValidations())
                .isNotEmpty()
                .containsKeys("estudianteId", "fechaRegistro");
            assertThat(error.getTimestamp()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Manejo de excepciones por GlobalExceptionHandler")
    class HandlerMethodTests {

        @Test
        @DisplayName("manejarEntidadNoEncontrada debe retornar 404 NOT_FOUND")
        void testManejarEntidadNoEncontrada() {
            EntidadNoEncontradaException ex = new EntidadNoEncontradaException("Estudiante no encontrado");
            ResponseEntity<ApiError> response = globalExceptionHandler.manejarEntidadNoEncontrada(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
            assertThat(response.getBody().getError()).isEqualTo("Entidad No Encontrada");
            assertThat(response.getBody().getMessage()).isEqualTo("Estudiante no encontrado");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarServicioNoDisponible debe retornar 503 SERVICE_UNAVAILABLE")
        void testManejarServicioNoDisponible() {
            ServicioNoDisponibleException ex = new ServicioNoDisponibleException("Servicio externo caído");
            ResponseEntity<ApiError> response = globalExceptionHandler.manejarServicioNoDisponible(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE.value());
            assertThat(response.getBody().getError()).isEqualTo("Servicio No Disponible");
            assertThat(response.getBody().getMessage()).isEqualTo("Servicio externo caído");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarArgumentoIlegal debe retornar 400 BAD_REQUEST")
        void testManejarArgumentoIlegal() {
            IllegalArgumentException ex = new IllegalArgumentException("Argumento inválido: tipo de asistencia");
            ResponseEntity<ApiError> response = globalExceptionHandler.manejarArgumentoIlegal(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
            assertThat(response.getBody().getError()).isEqualTo("Argumento Inválido");
            assertThat(response.getBody().getMessage()).isEqualTo("Argumento inválido: tipo de asistencia");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarValidacionDto debe retornar 400 BAD_REQUEST con detalles de errores")
        void testManejarValidacionDto() {
            BindingResult bindingResult = mock(BindingResult.class);
            FieldError fieldError = new FieldError("asistenciaRequest", "estudianteId", "estudianteId es obligatorio");
            when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));

            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);
            ResponseEntity<ApiError> response = globalExceptionHandler.manejarValidacionDto(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
            assertThat(response.getBody().getError()).isEqualTo("Validación de DTO Fallida");
            assertThat(response.getBody().getMessage()).isEqualTo("Los datos proporcionados no cumplen con las reglas de validación");
            assertThat(response.getBody().getValidations()).containsEntry("estudianteId", "estudianteId es obligatorio");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarExcepcionGeneral debe retornar 500 INTERNAL_SERVER_ERROR para excepciones genéricas")
        void testManejarExcepcionGeneral() {
            Exception ex = new Exception("Algo salió muy mal");
            ResponseEntity<ApiError> response = globalExceptionHandler.manejarExcepcionGeneral(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
            assertThat(response.getBody().getError()).isEqualTo("Error Interno del Servidor");
            assertThat(response.getBody().getMessage()).isEqualTo("Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarRuntimeException debe retornar 500 INTERNAL_SERVER_ERROR para RuntimeException")
        void testManejarRuntimeException() {
            RuntimeException ex = new RuntimeException("Error en tiempo de ejecución de la base de datos");
            ResponseEntity<ApiError> response = globalExceptionHandler.manejarRuntimeException(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
            assertThat(response.getBody().getError()).isEqualTo("Error en Tiempo de Ejecución");
            assertThat(response.getBody().getMessage()).isEqualTo("Se produjo un error durante el procesamiento de su solicitud.");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }
    }
}
