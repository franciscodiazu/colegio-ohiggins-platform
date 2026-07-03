package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroPresenteAsistencia;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Slf4j
@Component("PRESENTE")
public class PresenteFactory implements AsistenciaFactory {

    @Override
    public RegistroAsistencia crearRegistro(AsistenciaRequestDto dto) {
        log.debug("Creando RegistroPresenteAsistencia desde dto: {}", dto);

        if (dto.getEstudianteId() == null || dto.getEstudianteId() <= 0) {
            throw new IllegalArgumentException(
                "estudianteId es obligatorio y debe ser un número positivo para crear RegistroPresenteAsistencia"
            );
        }

        if (dto.getFechaRegistro() == null) {
            throw new IllegalArgumentException(
                "fechaRegistro es obligatoria para crear RegistroPresenteAsistencia"
            );
        }

        if (dto.getFechaRegistro().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                "No se puede registrar asistencia PRESENTE en el futuro"
            );
        }

        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia();
        registro.setEstudianteId(dto.getEstudianteId());
        registro.setClaseId(dto.getClaseId());
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

