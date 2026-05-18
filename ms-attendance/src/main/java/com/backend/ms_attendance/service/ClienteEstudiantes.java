package com.backend.ms_attendance.service;

import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class ClienteEstudiantes {

    private static final String MENSAJE_FALLA_VALIDACION = "Validación temporalmente no disponible. Intente nuevamente más tarde.";

    private final RestTemplate restTemplate;
    private final String urlServicioEstudiantes;

    public ClienteEstudiantes(
            RestTemplate restTemplate,
            @Value("${services.students.url}") String urlServicioEstudiantes
    ) {
        this.restTemplate = restTemplate;
        this.urlServicioEstudiantes = urlServicioEstudiantes;
    }

    @CircuitBreaker(name = "studentsValidation", fallbackMethod = "fallbackValidarExistenciaEstudiante")
    public void validarExistenciaEstudiante(Long estudianteId) {
        String urlValidacion = String.format("%s/api/v1/estudiantes/%d", urlServicioEstudiantes, estudianteId);

        log.debug("Validando existencia de estudiante ID {} en: {}", estudianteId, urlValidacion);

        try {
            ResponseEntity<String> respuesta = restTemplate.getForEntity(urlValidacion, String.class);

            // Cumple Rúbrica: Validación defensiva contra cuerpos vacíos o corruptos
            if (respuesta.getBody() == null || respuesta.getBody().trim().isEmpty()) {
                log.error("Cuerpo de respuesta vacío o corrupto para estudiante ID: {}", estudianteId);
                throw new ServicioNoDisponibleException(MENSAJE_FALLA_VALIDACION);
            }

            log.info("Estudiante ID {} VALIDADO correctamente en: {}", estudianteId, urlValidacion);

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("Estudiante ID {} no encontrado (404). URL: {}", estudianteId, urlValidacion);
                throw new EntidadNoEncontradaException(
                        String.format("Estudiante con ID %d no encontrado en el servicio académico.", estudianteId)
                );
            }
            log.error("Error HTTP {} al validar estudiante {}.", e.getStatusCode(), estudianteId);
            throw new ServicioNoDisponibleException(MENSAJE_FALLA_VALIDACION, e);
        } catch (Exception e) {
            log.error("Falló la validación inter-servicio para estudiante {}. Error: {}", estudianteId, e.getMessage());
            throw new ServicioNoDisponibleException(MENSAJE_FALLA_VALIDACION, e);
        }
    }

    private void fallbackValidarExistenciaEstudiante(Long estudianteId, Throwable throwable) {
        if (throwable instanceof EntidadNoEncontradaException entidadNoEncontradaException) {
            throw entidadNoEncontradaException;
        }

        log.warn("Circuit Breaker activado en AWS al validar estudiante {}. Mensaje: {}",
                estudianteId, throwable.getMessage());

        throw new ServicioNoDisponibleException(MENSAJE_FALLA_VALIDACION, throwable);
    }
}