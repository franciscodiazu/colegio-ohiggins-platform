package com.backend.ms_attendance.controller;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import com.backend.ms_attendance.model.RegistroPresenteAsistencia;
import com.backend.ms_attendance.service.ServicioAsistencia;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests de ControladorAsistencia - HTTP Level")
public class ControladorAsistenciaTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ServicioAsistencia servicioAsistencia;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/asistencia retorna 201 CREATED")
    void testCreateAttendance_Success() throws Exception {
        // GIVEN
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(1001L);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        // WHEN
        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia(1001L, LocalDate.now());
        registro.setId(1L);
        when(servicioAsistencia.crearAsistencia(any(AsistenciaRequestDto.class)))
            .thenReturn(registro);

        // THEN
        mockMvc.perform(post("/api/v1/asistencia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andDo(print())
            .andExpect(status().isCreated());

        verify(servicioAsistencia, times(1)).crearAsistencia(any());
    }

    @Test
    @DisplayName("POST /api/v1/asistencia con ID 999 retorna 404")
    void testCreateAttendance_StudentNotFound() throws Exception {
        // GIVEN
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(999L);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        when(servicioAsistencia.crearAsistencia(any(AsistenciaRequestDto.class)))
            .thenThrow(new EntidadNoEncontradaException("Estudiante no encontrado"));

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/asistencia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andDo(print())
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/asistencia con ms-students caído retorna 503")
    void testCreateAttendance_ServiceUnavailable() throws Exception {
        // GIVEN
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(1001L);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        when(servicioAsistencia.crearAsistencia(any(AsistenciaRequestDto.class)))
            .thenThrow(new ServicioNoDisponibleException("Servicio no disponible"));

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/asistencia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andDo(print())
            .andExpect(status().isServiceUnavailable());
    }

    @Test
    @DisplayName("GET /api/v1/asistencia/estudiante/{id} retorna 200 OK")
    void testListAttendanceByStudent_Success() throws Exception {
        // WHEN & THEN
        mockMvc.perform(get("/api/v1/asistencia/estudiante/1001")
                .accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/v1/asistencia con payload inválido retorna 400")
    void testCreateAttendance_InvalidPayload() throws Exception {
        // GIVEN - payload sin estudianteId
        String invalidPayload = "{\"fecha_registro\": \"2026-05-15\"}";

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/asistencia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload))
            .andDo(print())
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("✅ GET /api/v1/asistencia/estudiante/{id}/atrasos retorna 200")
    void testGetAtrasos_Success() throws Exception {
        // WHEN & THEN
        mockMvc.perform(get("/api/v1/asistencia/estudiante/1001/atrasos?umbral=15")
                .accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/asistencia/estudiante/{id}/estadisticas retorna 200")
    void testGetEstadisticas_Success() throws Exception {
        // WHEN & THEN
        mockMvc.perform(get("/api/v1/asistencia/estudiante/1001/estadisticas")
                .accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().isOk());
    }
}
