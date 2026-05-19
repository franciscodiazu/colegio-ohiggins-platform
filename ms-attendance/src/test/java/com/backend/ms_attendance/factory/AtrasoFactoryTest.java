package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAtraso;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Tests de AtrasoFactory")
public class AtrasoFactoryTest {

    private AtrasoFactory factory = new AtrasoFactory();

    @Test
    @DisplayName("Factory crea RegistroAtraso con hora > 08:00")
    void testCrearAtraso_ConHoraValida() {
        // GIVEN
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(1001L);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("ATRASO");
        dto.setHoraLlegada(LocalTime.of(8, 15));  // 15 minutos tarde

        // WHEN
        RegistroAtraso registro = (RegistroAtraso) factory.crearRegistro(dto);

        // THEN
        assertNotNull(registro);
        assertEquals(1001L, registro.getEstudianteId());
        assertEquals(LocalTime.of(8, 15), registro.getHoraLlegada());
    }

    @Test
    @DisplayName("Factory obtiene tipo 'ATRASO'")
    void testObtenerTipoRegistro() {
        // WHEN
        String tipo = factory.obtenerTipoRegistro();

        // THEN
        assertEquals("ATRASO", tipo);
    }

    @Test
    @DisplayName("DTO inválido para ATRASO sin hora")
    void testCrearAtraso_SinHora() {
        // GIVEN
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(1001L);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("ATRASO");
        dto.setHoraLlegada(null);  // Requerida para atraso

        // WHEN & THEN
        assertThrows(IllegalArgumentException.class, () -> factory.crearRegistro(dto));
    }
}

