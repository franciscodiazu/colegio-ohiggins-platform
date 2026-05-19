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
 *           a su código HTTP correspondiente y que el ErrorResponse
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
    @DisplayName("Estructura de ErrorResponse")
    class ErrorResponseTests {

        @Test
        @DisplayName("ErrorResponse debe construirse correctamente con builder")
        void testErrorResponseBuilder() {
            ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(404)
                .error("Not Found")
                .mensaje("Recurso no encontrado")
                .path("/api/v1/asistencia/99999")
                .build();

            assertThat(error)
                .hasFieldOrPropertyWithValue("status", 404)
                .hasFieldOrPropertyWithValue("error", "Not Found")
                .hasFieldOrPropertyWithValue("mensaje", "Recurso no encontrado")
                .hasFieldOrPropertyWithValue("path", "/api/v1/asistencia/99999");
            assertThat(error.getTimestamp()).isNotNull();
        }

        @Test
        @DisplayName("ErrorResponse debe manejar detalles adicionales")
        void testErrorResponseConDetalles() {
            Map<String, String> detalles = new java.util.HashMap<>();
            detalles.put("estudianteId", "debe ser un número positivo");
            detalles.put("fechaRegistro", "es obligatoria");

            ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(400)
                .error("Bad Request")
                .mensaje("Validación fallida")
                .detalles(detalles)
                .build();

            assertThat(error.getDetalles())
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
            ResponseEntity<ErrorResponse> response = globalExceptionHandler.manejarEntidadNoEncontrada(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
            assertThat(response.getBody().getError()).isEqualTo("Entidad No Encontrada");
            assertThat(response.getBody().getMensaje()).isEqualTo("Estudiante no encontrado");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarServicioNoDisponible debe retornar 503 SERVICE_UNAVAILABLE")
        void testManejarServicioNoDisponible() {
            ServicioNoDisponibleException ex = new ServicioNoDisponibleException("Servicio externo caído");
            ResponseEntity<ErrorResponse> response = globalExceptionHandler.manejarServicioNoDisponible(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE.value());
            assertThat(response.getBody().getError()).isEqualTo("Servicio No Disponible");
            assertThat(response.getBody().getMensaje()).isEqualTo("El servicio de validación está temporalmente no disponible. Intente más tarde.");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarArgumentoIlegal debe retornar 400 BAD_REQUEST")
        void testManejarArgumentoIlegal() {
            IllegalArgumentException ex = new IllegalArgumentException("Argumento inválido: tipo de asistencia");
            ResponseEntity<ErrorResponse> response = globalExceptionHandler.manejarArgumentoIlegal(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
            assertThat(response.getBody().getError()).isEqualTo("Argumento Inválido");
            assertThat(response.getBody().getMensaje()).isEqualTo("Argumento inválido: tipo de asistencia");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarValidacionDto debe retornar 400 BAD_REQUEST con detalles de errores")
        void testManejarValidacionDto() {
            BindingResult bindingResult = mock(BindingResult.class);
            FieldError fieldError = new FieldError("asistenciaRequest", "estudianteId", "estudianteId es obligatorio");
            when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));

            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);
            ResponseEntity<ErrorResponse> response = globalExceptionHandler.manejarValidacionDto(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
            assertThat(response.getBody().getError()).isEqualTo("Validación de DTO Fallida");
            assertThat(response.getBody().getMensaje()).isEqualTo("Los datos proporcionados no cumplen con las reglas de validación");
            assertThat(response.getBody().getDetalles()).containsEntry("estudianteId", "estudianteId es obligatorio");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarExcepcionGeneral debe retornar 500 INTERNAL_SERVER_ERROR para excepciones genéricas")
        void testManejarExcepcionGeneral() {
            Exception ex = new Exception("Algo salió muy mal");
            ResponseEntity<ErrorResponse> response = globalExceptionHandler.manejarExcepcionGeneral(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
            assertThat(response.getBody().getError()).isEqualTo("Error Interno del Servidor");
            assertThat(response.getBody().getMensaje()).isEqualTo("Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }

        @Test
        @DisplayName("manejarRuntimeException debe retornar 500 INTERNAL_SERVER_ERROR para RuntimeException")
        void testManejarRuntimeException() {
            RuntimeException ex = new RuntimeException("Error en tiempo de ejecución de la base de datos");
            ResponseEntity<ErrorResponse> response = globalExceptionHandler.manejarRuntimeException(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
            assertThat(response.getBody().getError()).isEqualTo("Error en Tiempo de Ejecución");
            assertThat(response.getBody().getMensaje()).isEqualTo("Se produjo un error durante el procesamiento de su solicitud.");
            assertThat(response.getBody().getPath()).isEqualTo("/api/v1/test");
        }
    }
}
