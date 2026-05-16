package com.backend.ms_attendance.service;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@DisplayName("Tests de ServicioAsistencia")
public class ServicioAsistenciaTest {

    @Autowired
    private ServicioAsistencia servicioAsistencia;

    @MockBean
    private ClienteEstudiantes clienteEstudiantes;

    @Test
    @DisplayName("❌ Crear asistencia con estudiante inexistente (404)")
    void testCrearAsistencia_EstudianteNoExiste() {
        // GIVEN
        Long estudianteIdInvalido = 999L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteIdInvalido);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        // WHEN
        doThrow(new EntidadNoEncontradaException("Estudiante 999 no encontrado"))
            .when(clienteEstudiantes)
            .validarExistenciaEstudiante(estudianteIdInvalido);

        // THEN
        assertThrows(
            EntidadNoEncontradaException.class,
            () -> servicioAsistencia.crearAsistencia(dto)
        );

        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteIdInvalido);
    }

    @Test
    @DisplayName("Crear asistencia con servicio no disponible (503)")
    void testCrearAsistencia_ServicioNoDisponible() {
        // GIVEN
        Long estudianteId = 1002L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        // WHEN
        doThrow(new ServicioNoDisponibleException("ms-students timeout"))
            .when(clienteEstudiantes)
            .validarExistenciaEstudiante(estudianteId);

        // THEN
        assertThrows(
            ServicioNoDisponibleException.class,
            () -> servicioAsistencia.crearAsistencia(dto)
        );
    }

    @Test
    @DisplayName("Factory no existe para tipo (bloqueante 3)")
    void testCrearAsistencia_FactoryNoExiste() {
        // GIVEN - Factory no registrada en Context
        Long estudianteId = 1001L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("TIPO_INEXISTENTE");

        // WHEN
        doNothing().when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);

        // THEN - Factory no está registrada
        assertThrows(
            IllegalArgumentException.class,
            () -> servicioAsistencia.crearAsistencia(dto)
        );
    }

    @Test
    @DisplayName("Validación de estudiante es prioritaria (bloqueante 1)")
    void testValidacionEsPrimero() {
        // GIVEN
        Long estudianteId = 1001L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        // WHEN
        doThrow(new EntidadNoEncontradaException("No existe"))
            .when(clienteEstudiantes)
            .validarExistenciaEstudiante(estudianteId);

        // THEN - Bloqueante 1 se ejecuta PRIMERO, antes que cualquier otro
        assertThrows(EntidadNoEncontradaException.class, 
            () -> servicioAsistencia.crearAsistencia(dto));

        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
    }
}
