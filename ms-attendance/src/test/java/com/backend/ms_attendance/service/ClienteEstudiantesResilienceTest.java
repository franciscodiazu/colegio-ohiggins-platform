package com.backend.ms_attendance.service;

import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.SocketTimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * ClienteEstudiantesResilienceTest - Tests para validar resiliencia y manejo de errores
 *
 * COBERTURA DE ERRORES:
 * ✓ Estudiante no encontrado (404 → EntidadNoEncontradaException)
 * ✓ Timeout en la conexión (→ ServicioNoDisponibleException)
 * ✓ Servicio caído (→ ServicioNoDisponibleException)
 * ✓ Errores de conexión (→ ServicioNoDisponibleException)
 * ✓ Cuerpo de respuesta vacío/corrupto (→ ServicioNoDisponibleException)
 * ✓ Circuit Breaker activado (fallback)
 *
 * OBJETIVO: Validar que ClienteEstudiantes maneja correctamente todos los
 *           escenarios de fallo de ms-students y que el Circuit Breaker funciona.
 */
@SpringBootTest
@DisplayName("ClienteEstudiantes - Tests de Resiliencia")
public class ClienteEstudiantesResilienceTest {

    @Autowired
    private ClienteEstudiantes clienteEstudiantes;

    @MockitoBean
    private RestTemplate restTemplate;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    // Propiedad dinámica para el URL del servicio de estudiantes
    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("services.students.url", () -> "http://localhost:8081");
    }

    @BeforeEach
    void setUp() {
        // Resetear el Circuit Breaker antes de cada test para asegurar un estado limpio
        circuitBreakerRegistry.circuitBreaker("studentsValidation").reset();
    }

    @Nested
    @DisplayName("Casos de éxito y error - Verificación de manejo de excepciones")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Debe validar la existencia del estudiante exitosamente (HTTP 200)")
        void debeValidarExistenciaEstudianteExitosamente() {
            // Arrange
            Long estudianteId = 1L;
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenReturn(new ResponseEntity<>("{\"id\":1, \"nombre\":\"Test\"}", HttpStatus.OK));

            // Act & Assert
            assertDoesNotThrow(() -> clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("Debe lanzar EntidadNoEncontradaException para HTTP 404")
        void debeLanzarEntidadNoEncontradaExceptionPara404() {
            // Arrange
            Long estudianteId = 2L;
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found"));

            // Act & Assert
            EntidadNoEncontradaException thrown = assertThrows(EntidadNoEncontradaException.class, () ->
                    clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            assertThat(thrown.getMessage()).contains("Estudiante con ID 2 no encontrado");
            verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("Debe lanzar ServicioNoDisponibleException para HTTP 500")
        void debeLanzarServicioNoDisponibleExceptionPara500() {
            // Arrange
            Long estudianteId = 3L;
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenThrow(new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));

            // Act & Assert
            ServicioNoDisponibleException thrown = assertThrows(ServicioNoDisponibleException.class, () ->
                    clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            assertThat(thrown.getMessage()).contains("Validación temporalmente no disponible");
            verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("Debe lanzar ServicioNoDisponibleException para ResourceAccessException (problema de conexión)")
        void debeLanzarServicioNoDisponibleExceptionParaResourceAccessException() {
            // Arrange
            Long estudianteId = 4L;
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenThrow(new ResourceAccessException("I/O error on GET request", new SocketTimeoutException()));

            // Act & Assert
            ServicioNoDisponibleException thrown = assertThrows(ServicioNoDisponibleException.class, () ->
                    clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            assertThat(thrown.getMessage()).contains("Validación temporalmente no disponible");
            verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("Debe lanzar ServicioNoDisponibleException si el cuerpo de la respuesta es nulo")
        void debeLanzarServicioNoDisponibleExceptionSiCuerpoRespuestaEsNulo() {
            // Arrange
            Long estudianteId = 5L;
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenReturn(new ResponseEntity<>(null, HttpStatus.OK));

            // Act & Assert
            ServicioNoDisponibleException thrown = assertThrows(ServicioNoDisponibleException.class, () ->
                    clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            assertThat(thrown.getMessage()).contains("Validación temporalmente no disponible");
            verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("Debe lanzar ServicioNoDisponibleException si el cuerpo de la respuesta está vacío")
        void debeLanzarServicioNoDisponibleExceptionSiCuerpoRespuestaEstaVacio() {
            // Arrange
            Long estudianteId = 6L;
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenReturn(new ResponseEntity<>("", HttpStatus.OK));

            // Act & Assert
            ServicioNoDisponibleException thrown = assertThrows(ServicioNoDisponibleException.class, () ->
                    clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            assertThat(thrown.getMessage()).contains("Validación temporalmente no disponible");
            verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        }
    }

    @Nested
    @DisplayName("Circuit Breaker - Comportamiento del Fallback")
    class CircuitBreakerTests {

        @Test
        @DisplayName("El fallback debe re-lanzar EntidadNoEncontradaException")
        void fallbackDebeRelanzarEntidadNoEncontradaException() {
            // Arrange
            Long estudianteId = 7L;
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));

            // Act & Assert
            assertThrows(EntidadNoEncontradaException.class, () ->
                    clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("El fallback debe lanzar ServicioNoDisponibleException para otras excepciones")
        void fallbackDebeLanzarServicioNoDisponibleExceptionParaOtrasExcepciones() {
            // Arrange
            Long estudianteId = 8L;
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("Error inesperado"));

            // Act & Assert
            ServicioNoDisponibleException thrown = assertThrows(ServicioNoDisponibleException.class, () ->
                    clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            assertThat(thrown.getMessage()).contains("Validación temporalmente no disponible");
            verify(restTemplate, times(1)).getForEntity(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("El Circuit Breaker debe abrirse después de fallos consecutivos y usar fallback")
        void circuitBreakerDebeAbrirseYUsarFallback() {
            // Arrange
            Long estudianteId = 9L;
            // Simular fallos para abrir el Circuit Breaker (por defecto 5 fallos)
            when(restTemplate.getForEntity(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("Fallo 1"))
                    .thenThrow(new RuntimeException("Fallo 2"))
                    .thenThrow(new RuntimeException("Fallo 3"))
                    .thenThrow(new RuntimeException("Fallo 4"))
                    .thenThrow(new RuntimeException("Fallo 5"))
                    .thenReturn(new ResponseEntity<>("{\"id\":9, \"nombre\":\"Test\"}", HttpStatus.OK)); // Este no debería ser llamado

            // Act & Assert - 5 fallos para abrir el CB
            for (int i = 0; i < 5; i++) {
                assertThrows(ServicioNoDisponibleException.class, () ->
                        clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
            }

            // El sexto intento debería activar el Circuit Breaker y no llamar a restTemplate
            assertThrows(ServicioNoDisponibleException.class, () ->
                    clienteEstudiantes.validarExistenciaEstudiante(estudianteId));

            verify(restTemplate, times(5)).getForEntity(anyString(), eq(String.class)); // Solo 5 llamadas al restTemplate
        }
    }
}
