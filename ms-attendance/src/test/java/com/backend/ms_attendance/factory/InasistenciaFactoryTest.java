package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroInasistencia;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("Tests de InasistenciaFactory")
class InasistenciaFactoryTest {

    private final InasistenciaFactory factory = new InasistenciaFactory();

    @Test
    @DisplayName("Factory crea RegistroInasistencia con justificación implícita en false")
    void testCrearInasistencia_ConJustificacionPorDefecto() {
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(2001L);
        dto.setFechaRegistro(LocalDate.of(2026, 5, 15));
        dto.setNotas("Ausente sin aviso");

        RegistroAsistencia registro = factory.crearRegistro(dto);

        assertNotNull(registro);
        RegistroInasistencia inasistencia = (RegistroInasistencia) registro;
        assertEquals(2001L, inasistencia.getEstudianteId());
        assertEquals(LocalDate.of(2026, 5, 15), inasistencia.getFechaRegistro());
        assertFalse(inasistencia.getEsJustificada());
    }

    @Test
    @DisplayName("Factory crea RegistroInasistencia justificada")
    void testCrearInasistencia_Justificada() {
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(2001L);
        dto.setFechaRegistro(LocalDate.of(2026, 5, 15));
        dto.setEsJustificada(true);
        dto.setRazonJustificacion("Consulta médica");

        RegistroInasistencia registro = (RegistroInasistencia) factory.crearRegistro(dto);

        assertEquals(true, registro.getEsJustificada());
        assertEquals("Consulta médica", registro.getRazonJustificacion());
    }

    @Test
    @DisplayName("Factory rechaza DTO sin estudianteId")
    void testCrearInasistencia_SinEstudianteId() {
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setFechaRegistro(LocalDate.of(2026, 5, 15));

        assertThrows(IllegalArgumentException.class, () -> factory.crearRegistro(dto));
    }

    @Test
    @DisplayName("Factory rechaza DTO sin fechaRegistro")
    void testCrearInasistencia_SinFechaRegistro() {
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(2001L);

        assertThrows(IllegalArgumentException.class, () -> factory.crearRegistro(dto));
    }

    @Test
    @DisplayName("Factory obtiene tipo INASISTENCIA")
    void testObtenerTipoRegistro() {
        assertEquals("INASISTENCIA", factory.obtenerTipoRegistro());
    }
}