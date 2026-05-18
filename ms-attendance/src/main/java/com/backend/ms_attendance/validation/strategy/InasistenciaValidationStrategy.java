package com.backend.ms_attendance.validation.strategy;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * InasistenciaValidationStrategy - Validación específica para registros de tipo INASISTENCIA
 *
 * RESPONSABILIDADES:
 * ✓ Validar que estudianteId no sea nulo
 * ✓ Validar que fechaRegistro no sea nula
 * ✓ Validar que fechaRegistro no sea en el futuro
 * ✓ Si esJustificada es true, razonJustificacion debe estar presente
 */
@Slf4j
@Component
public class InasistenciaValidationStrategy implements ValidationStrategy {

    @Override
    public void validate(AsistenciaRequestDto dto) throws IllegalArgumentException {
        log.debug("Aplicando estrategia de validación: {}", getNombre());

        if (dto.getEstudianteId() == null || dto.getEstudianteId() <= 0) {
            throw new IllegalArgumentException("Validación INASISTENCIA: estudianteId debe ser un número positivo");
        }

        if (dto.getFechaRegistro() == null) {
            throw new IllegalArgumentException("Validación INASISTENCIA: fechaRegistro es obligatoria");
        }

        if (dto.getFechaRegistro().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Validación INASISTENCIA: no se puede registrar inasistencia en el futuro");
        }

        // Validación condicional: si está justificada, debe haber razón
        if (Boolean.TRUE.equals(dto.getEsJustificada())) {
            if (dto.getRazonJustificacion() == null || dto.getRazonJustificacion().isBlank()) {
                throw new IllegalArgumentException(
                    "Validación INASISTENCIA: cuando esJustificada es true, razonJustificacion es obligatoria"
                );
            }
        }

        log.debug("Validación INASISTENCIA completada exitosamente para estudiante {}", dto.getEstudianteId());
    }

    @Override
    public String getNombre() {
        return "INASISTENCIA_VALIDATION";
    }
}

