package com.backend.ms_attendance.validation.strategy;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * AtrasoValidationStrategy - Validación específica para registros de tipo ATRASO
 *
 * RESPONSABILIDADES:
 * ✓ Validar que estudianteId no sea nulo
 * ✓ Validar que fechaRegistro no sea nula
 * ✓ Validar que horaLlegada no sea nula (diferencia con PRESENTE)
 * ✓ Validar que horaEsperada no sea nula (para calcular minutos de atraso)
 * ✓ Validar que horaLlegada sea posterior a horaEsperada
 */
@Slf4j
@Component
public class AtrasoValidationStrategy implements ValidationStrategy {

    @Override
    public void validate(AsistenciaRequestDto dto) throws IllegalArgumentException {
        log.debug("Aplicando estrategia de validación: {}", getNombre());

        if (dto.getEstudianteId() == null || dto.getEstudianteId() <= 0) {
            throw new IllegalArgumentException("Validación ATRASO: estudianteId debe ser un número positivo");
        }

        if (dto.getFechaRegistro() == null) {
            throw new IllegalArgumentException("Validación ATRASO: fechaRegistro es obligatoria");
        }

        if (dto.getFechaRegistro().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Validación ATRASO: no se puede registrar atraso en el futuro");
        }

        if (dto.getHoraLlegada() == null) {
            throw new IllegalArgumentException("Validación ATRASO: horaLlegada es obligatoria para registro de tipo ATRASO");
        }

        if (dto.getHoraEsperada() == null) {
            throw new IllegalArgumentException("Validación ATRASO: horaEsperada es obligatoria para calcular minutos de atraso");
        }

        if (dto.getHoraLlegada().isBefore(dto.getHoraEsperada())) {
            throw new IllegalArgumentException(
                "Validación ATRASO: horaLlegada no puede ser anterior a horaEsperada"
            );
        }

        log.debug("Validación ATRASO completada exitosamente para estudiante {}", dto.getEstudianteId());
    }

    @Override
    public String getNombre() {
        return "ATRASO_VALIDATION";
    }
}

