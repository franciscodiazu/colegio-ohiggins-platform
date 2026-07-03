package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroAtraso;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalTime;

@Slf4j
@Component("ATRASO")
public class AtrasoFactory implements AsistenciaFactory {

    private static final LocalTime HORA_ESPERADA_DEFECTO = LocalTime.of(8, 0);

    @Override
    public RegistroAsistencia crearRegistro(AsistenciaRequestDto dto) {
        log.debug("Creando RegistroAtraso desde dto: {}", dto);

        if (dto.getEstudianteId() == null || dto.getEstudianteId() <= 0) {
            throw new IllegalArgumentException(
                "estudianteId es obligatorio y debe ser un número positivo para crear RegistroAtraso"
            );
        }

        if (dto.getFechaRegistro() == null) {
            throw new IllegalArgumentException(
                "fechaRegistro es obligatoria para crear RegistroAtraso"
            );
        }

        if (dto.getFechaRegistro().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                "No se puede registrar atraso en el futuro"
            );
        }

        if (dto.getHoraLlegada() == null) {
            throw new IllegalArgumentException(
                "horaLlegada es obligatoria para crear RegistroAtraso"
            );
        }

        LocalTime horaLlegada = dto.getHoraLlegada();
        LocalTime horaEsperada = dto.getHoraEsperada() != null
            ? dto.getHoraEsperada()
            : HORA_ESPERADA_DEFECTO;

        if (!horaLlegada.isAfter(horaEsperada)) {
            throw new IllegalArgumentException(
                String.format(
                    "Hora de llegada (%s) debe ser posterior a hora esperada (%s) para un registro ATRASO",
                    horaLlegada, horaEsperada
                )
            );
        }

        RegistroAtraso registro = new RegistroAtraso();
        registro.setEstudianteId(dto.getEstudianteId());
        registro.setClaseId(dto.getClaseId());
        registro.setFechaRegistro(dto.getFechaRegistro());
        registro.setNotas(dto.getNotas());
        registro.setHoraLlegada(horaLlegada);
        registro.setHoraEsperada(horaEsperada);
        registro.calcularMinutosAtraso();

        if (!registro.esValido()) {
            throw new IllegalArgumentException(
                "RegistroAtraso creado es inválido. Verifique los datos."
            );
        }

        log.info("RegistroAtraso creado exitosamente para estudiante: {} (Minutos de retraso: {})",
            dto.getEstudianteId(), registro.getMinutosAtraso());
        return registro;
    }

    @Override
    public String obtenerTipoRegistro() {
        return "ATRASO";
    }
}

