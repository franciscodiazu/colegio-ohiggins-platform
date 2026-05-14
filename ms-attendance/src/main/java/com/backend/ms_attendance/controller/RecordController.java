package com.backend.ms_attendance.controller;

import com.backend.ms_attendance.model.Attendance;
import com.backend.ms_attendance.model.Observation;
import com.backend.ms_attendance.repository.AttendanceRepository;
import com.backend.ms_attendance.repository.ObservationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Asistencia y Observaciones", description = "Registro de asistencia y observaciones de estudiantes")
public class RecordController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ObservationRepository observationRepository;

    @Operation(summary = "Registrar asistencia",
               description = "Registra la asistencia o inasistencia de un estudiante para una fecha específica.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Asistencia registrada correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping("/mark")
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Operation(summary = "Agregar observación",
               description = "Registra una observación (positiva o negativa) sobre un estudiante.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Observación registrada correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping("/observation")
    public Observation addObservation(@RequestBody Observation observation) {
        return observationRepository.save(observation);
    }

    @Operation(summary = "Obtener observaciones de un estudiante",
               description = "Retorna todas las observaciones registradas para un estudiante específico.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Observaciones obtenidas correctamente"),
        @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    @GetMapping("/student/{studentId}")
    public List<Observation> getStudentObservations(
            @Parameter(description = "ID del estudiante") @PathVariable Long studentId) {
        return observationRepository.findByStudentId(studentId);
    }
}