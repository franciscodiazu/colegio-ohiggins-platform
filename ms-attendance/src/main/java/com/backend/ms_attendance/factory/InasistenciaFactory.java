package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroInasistencia;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component("INASISTENCIA")
public class InasistenciaFactory implements AsistenciaFactory {

    @Override
    public RegistroAsistencia crearRegistro(AsistenciaRequestDto dto) {
        log.debug("Creando RegistroInasistencia desde dto: {}", dto);

        if (dto.getEstudianteId() == null || dto.getFechaRegistro() == null) {
            throw new IllegalArgumentException(
                "estudianteId y fechaRegistro son obligatorios para crear RegistroInasistencia"
            );
        }

        Boolean esJustificada = dto.getEsJustificada() != null ? dto.getEsJustificada() : false;
        String razonJustificacion = dto.getRazonJustificacion();

        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEstudianteId(dto.getEstudianteId());
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

