package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroPresenteAsistencia;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component("PRESENTE")
public class PresenteFactory implements AsistenciaFactory {

    @Override
    public RegistroAsistencia crearRegistro(AsistenciaRequestDto dto) {
        log.debug("Creando RegistroPresenteAsistencia desde dto: {}", dto);

        if (dto.getEstudianteId() == null || dto.getFechaRegistro() == null) {
            throw new IllegalArgumentException(
                "estudianteId y fechaRegistro son obligatorios para crear RegistroPresenteAsistencia"
            );
        }

        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia();
        registro.setEstudianteId(dto.getEstudianteId());
        registro.setFechaRegistro(dto.getFechaRegistro());
        registro.setNotas(dto.getNotas());

        if (!registro.esValido()) {
            throw new IllegalArgumentException(
                "RegistroPresenteAsistencia creado es inválido. Verifique los datos."
            );
        }

        log.info("RegistroPresenteAsistencia creado exitosamente para estudiante: {}",
            dto.getEstudianteId());
        return registro;
    }

    @Override
    public String obtenerTipoRegistro() {
        return "PRESENTE";
    }
}

