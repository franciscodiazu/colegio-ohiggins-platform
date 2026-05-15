package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAsistencia;

public interface AsistenciaFactory {

    RegistroAsistencia crearRegistro(AsistenciaRequestDto dto);

    String obtenerTipoRegistro();
}

