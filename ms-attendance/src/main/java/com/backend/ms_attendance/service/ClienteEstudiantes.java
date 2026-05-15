package com.backend.ms_attendance.service;

import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class ClienteEstudiantes {

    private static final String MENSAJE_FALLA_VALIDACION =
        "Validación temporalmente no disponible. Intente nuevamente más tarde.";

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
        String urlValidacion = String.format("%s/api/v1/estudiantes/%d",
            urlServicioEstudiantes, estudianteId);

        log.debug("Validando existencia de estudiante ID {} en: {}",
            estudianteId, urlValidacion);

        try {
            ResponseEntity<Object> respuesta = restTemplate.getForEntity(urlValidacion, Object.class);

            if (respuesta.getStatusCode() != HttpStatus.OK) {
                log.error(
                    "Estudiante {} no validado. Status HTTP: {} en URL: {}",
                    estudianteId, respuesta.getStatusCode(), urlValidacion
                );
                throw new EntidadNoEncontradaException(
                    String.format(
                        "Estudiante con ID %d no encontrado en el servicio académico.",
                        estudianteId
                    )
                );
            }

            log.info("Estudiante ID {} VALIDADO correctamente en: {}",
                estudianteId, urlValidacion);

        } catch (RestClientResponseException e) {
            log.error(
                "Error HTTP {} al validar estudiante {}. URL consultada: {}. Mensaje: {}",
                e.getRawStatusCode(), estudianteId, urlValidacion, e.getMessage(), e
            );

            if (e.getRawStatusCode() == 404) {
                throw new EntidadNoEncontradaException(
                    String.format(
                        "Estudiante con ID %d no encontrado en el servicio académico.",
                        estudianteId
                    )
                );
            }

            throw new ServicioNoDisponibleException(MENSAJE_FALLA_VALIDACION, e);
        } catch (RestClientException e) {
            log.error(
                "Falló la validación inter-servicio para estudiante {}. " +
                "URL consultada: {}. Tipo de error: {}. Mensaje: {}",
                estudianteId, urlValidacion, e.getClass().getSimpleName(), e.getMessage(), e
            );
            throw new ServicioNoDisponibleException(MENSAJE_FALLA_VALIDACION, e);
        }
    }

    private void fallbackValidarExistenciaEstudiante(Long estudianteId, Throwable throwable) {
        if (throwable instanceof EntidadNoEncontradaException entidadNoEncontradaException) {
            throw entidadNoEncontradaException;
        }

        log.warn(
            "Circuit Breaker activado al validar estudiante {}. Tipo: {}. Mensaje: {}",
            estudianteId,
            throwable.getClass().getSimpleName(),
            throwable.getMessage()
        );

        throw new ServicioNoDisponibleException(MENSAJE_FALLA_VALIDACION, throwable);
    }
}
