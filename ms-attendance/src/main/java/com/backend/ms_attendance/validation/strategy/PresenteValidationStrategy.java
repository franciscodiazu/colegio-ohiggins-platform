package com.backend.ms_attendance.validation.strategy;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * PresenteValidationStrategy - Validación específica para registros de tipo PRESENTE
 *
 * RESPONSABILIDADES:
 * ✓ Validar que estudianteId no sea nulo
 * ✓ Validar que fechaRegistro no sea nula
 * ✓ Validar que fechaRegistro no sea en el futuro
 * ✓ No requiere horaLlegada (campo tipo PRESENTE)
 */
@Slf4j
@Component
public class PresenteValidationStrategy implements ValidationStrategy {

    @Override
    public void validate(AsistenciaRequestDto dto) throws IllegalArgumentException {
        log.debug("Aplicando estrategia de validación: {}", getNombre());

        if (dto.getEstudianteId() == null || dto.getEstudianteId() <= 0) {
            throw new IllegalArgumentException("Validación PRESENTE: estudianteId debe ser un número positivo");
        }

        if (dto.getFechaRegistro() == null) {
            throw new IllegalArgumentException("Validación PRESENTE: fechaRegistro es obligatoria");
        }

        if (dto.getFechaRegistro().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Validación PRESENTE: no se puede registrar asistencia en el futuro");
        }

        log.debug("Validación PRESENTE completada exitosamente para estudiante {}", dto.getEstudianteId());
    }

    @Override
    public String getNombre() {
        return "PRESENTE_VALIDATION";
    }
}

