package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroInasistencia;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Slf4j
@Component("INASISTENCIA")
public class InasistenciaFactory implements AsistenciaFactory {

    @Override
    public RegistroAsistencia crearRegistro(AsistenciaRequestDto dto) {
        log.debug("Creando RegistroInasistencia desde dto: {}", dto);

        if (dto.getEstudianteId() == null || dto.getEstudianteId() <= 0) {
            throw new IllegalArgumentException(
                "estudianteId es obligatorio y debe ser un número positivo para crear RegistroInasistencia"
            );
        }

        if (dto.getFechaRegistro() == null) {
            throw new IllegalArgumentException(
                "fechaRegistro es obligatoria para crear RegistroInasistencia"
            );
        }

        if (dto.getFechaRegistro().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                "No se puede registrar inasistencia en el futuro"
            );
        }

        if (Boolean.TRUE.equals(dto.getEsJustificada()) &&
            (dto.getRazonJustificacion() == null || dto.getRazonJustificacion().isBlank())) {
            throw new IllegalArgumentException(
                "Si la inasistencia es justificada, debe proporcionar una razón"
            );
        }

        Boolean esJustificada = dto.getEsJustificada() != null ? dto.getEsJustificada() : false;
        String razonJustificacion = dto.getRazonJustificacion();

        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEstudianteId(dto.getEstudianteId());
        registro.setClaseId(dto.getClaseId());
        registro.setFechaRegistro(dto.getFechaRegistro());
        registro.setNotas(dto.getNotas());
        registro.setEsJustificada(esJustificada);
        registro.setRazonJustificacion(razonJustificacion);

        if (!registro.esValido()) {
            throw new IllegalArgumentException(
                "RegistroInasistencia creado es inválido. Verifique los datos."
            );
        }

        log.info("RegistroInasistencia creado exitosamente para estudiante: {} (Justificada: {})",
            dto.getEstudianteId(), esJustificada);
        return registro;
    }

    @Override
    public String obtenerTipoRegistro() {
        return "INASISTENCIA";
    }
}

