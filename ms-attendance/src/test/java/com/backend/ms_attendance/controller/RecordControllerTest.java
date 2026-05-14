package com.backend.ms_attendance.controller;

import com.backend.ms_attendance.model.Attendance;
import com.backend.ms_attendance.model.Observation;
import com.backend.ms_attendance.repository.AttendanceRepository;
import com.backend.ms_attendance.repository.ObservationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RecordController.class)
class RecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AttendanceRepository attendanceRepository;

    @MockBean
    private ObservationRepository observationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Attendance attendance;
    private Observation observation;

    @BeforeEach
    void setUp() {
        attendance = new Attendance();
        attendance.setId(1L);
        attendance.setStudentId(10L);
        attendance.setDate(LocalDate.of(2025, 5, 14));
        attendance.setPresent(true);

        observation = new Observation();
        observation.setId(1L);
        observation.setStudentId(10L);
        observation.setDescription("Participa activamente en clases.");
        observation.setType("Positiva");
        observation.setCreatedAt(LocalDateTime.of(2025, 5, 14, 9, 0));
    }

    // ── POST /api/attendance/mark ────────────────────────────

    @Test
    void markAttendance_debeRetornar200ConAsistenciaRegistrada() throws Exception {
        // Arrange
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/mark")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(attendance)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.studentId").value(10))
                .andExpect(jsonPath("$.present").value(true));

        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void markAttendance_conAsistenciaFalse_debeRegistrarInasistencia() throws Exception {
        // Arrange
        Attendance inasistencia = new Attendance();
        inasistencia.setId(2L);
        inasistencia.setStudentId(10L);
        inasistencia.setDate(LocalDate.of(2025, 5, 14));
        inasistencia.setPresent(false);

        when(attendanceRepository.save(any(Attendance.class))).thenReturn(inasistencia);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/mark")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inasistencia)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.present").value(false))
                .andExpect(jsonPath("$.studentId").value(10));

        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void markAttendance_debeInvocarRepositoryUnaVez() throws Exception {
        // Arrange
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);

        // Act
        mockMvc.perform(post("/api/attendance/mark")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(attendance)));

        // Assert
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
        verify(observationRepository, never()).save(any());
    }

    // ── POST /api/attendance/observation ────────────────────

    @Test
    void addObservation_debeRetornar200ConObservacionCreada() throws Exception {
        // Arrange
        when(observationRepository.save(any(Observation.class))).thenReturn(observation);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/observation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(observation)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.studentId").value(10))
                .andExpect(jsonPath("$.type").value("Positiva"))
                .andExpect(jsonPath("$.description").value("Participa activamente en clases."));

        verify(observationRepository, times(1)).save(any(Observation.class));
    }

    @Test
    void addObservation_tipoNegativa_debeGuardarCorrectamente() throws Exception {
        // Arrange
        Observation obsNegativa = new Observation();
        obsNegativa.setId(2L);
        obsNegativa.setStudentId(10L);
        obsNegativa.setDescription("No entregó la tarea.");
        obsNegativa.setType("Negativa");
        obsNegativa.setCreatedAt(LocalDateTime.of(2025, 5, 14, 10, 0));

        when(observationRepository.save(any(Observation.class))).thenReturn(obsNegativa);

        // Act & Assert
        mockMvc.perform(post("/api/attendance/observation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(obsNegativa)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("Negativa"))
                .andExpect(jsonPath("$.description").value("No entregó la tarea."));

        verify(observationRepository, times(1)).save(any(Observation.class));
    }

    @Test
    void addObservation_debeInvocarSoloObservationRepository() throws Exception {
        // Arrange
        when(observationRepository.save(any(Observation.class))).thenReturn(observation);

        // Act
        mockMvc.perform(post("/api/attendance/observation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(observation)));

        // Assert
        verify(observationRepository, times(1)).save(any(Observation.class));
        verify(attendanceRepository, never()).save(any());
    }

    // ── GET /api/attendance/student/{studentId} ──────────────

    @Test
    void getStudentObservations_cuandoExisten_debeRetornar200ConLista() throws Exception {
        // Arrange
        Observation obs2 = new Observation();
        obs2.setId(2L);
        obs2.setStudentId(10L);
        obs2.setDescription("Llegó tarde a clases.");
        obs2.setType("Negativa");
        obs2.setCreatedAt(LocalDateTime.of(2025, 5, 14, 8, 15));

        List<Observation> observaciones = Arrays.asList(observation, obs2);
        when(observationRepository.findByStudentId(10L)).thenReturn(observaciones);

        // Act & Assert
        mockMvc.perform(get("/api/attendance/student/10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].type").value("Positiva"))
                .andExpect(jsonPath("$[1].type").value("Negativa"))
                .andExpect(jsonPath("$[0].studentId").value(10))
                .andExpect(jsonPath("$[1].description").value("Llegó tarde a clases."));

        verify(observationRepository, times(1)).findByStudentId(10L);
    }

    @Test
    void getStudentObservations_cuandoNoHay_debeRetornar200ConListaVacia() throws Exception {
        // Arrange
        when(observationRepository.findByStudentId(99L)).thenReturn(List.of());

        // Act & Assert
        mockMvc.perform(get("/api/attendance/student/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(observationRepository, times(1)).findByStudentId(99L);
    }

    @Test
    void getStudentObservations_debeInvocarFindByStudentIdConIdCorrecto() throws Exception {
        // Arrange
        when(observationRepository.findByStudentId(10L)).thenReturn(List.of(observation));

        // Act
        mockMvc.perform(get("/api/attendance/student/10"));

        // Assert
        verify(observationRepository, times(1)).findByStudentId(10L);
        verify(observationRepository, never()).findByStudentId(99L);
    }
}