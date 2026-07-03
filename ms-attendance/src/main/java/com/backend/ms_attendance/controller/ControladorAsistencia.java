package com.backend.ms_attendance.controller;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.dto.EstadisticasAsistenciaDto;
import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroInasistencia;
import com.backend.ms_attendance.model.RegistroAtraso;
import com.backend.ms_attendance.service.ServicioAsistencia;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/asistencia")
@Tag(name = "Asistencia", description = "APIs para gestion de registros de asistencia de estudiantes")
public class ControladorAsistencia {

    private final ServicioAsistencia servicioAsistencia;

    public ControladorAsistencia(ServicioAsistencia servicioAsistencia) {
        this.servicioAsistencia = servicioAsistencia;
    }

    @PostMapping
    @Operation(summary = "Crear nuevo registro de asistencia")
    public ResponseEntity<RegistroAsistencia> crearRegistro(@Valid @RequestBody AsistenciaRequestDto request) {
        log.info("POST /api/v1/asistencia - estudiante={}, clase={}, tipo={}",
            request.getEstudianteId(), request.getClaseId(), request.getTipoRegistro());
        RegistroAsistencia creado = servicioAsistencia.crearAsistencia(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping
    @Operation(summary = "Listar todos los registros de asistencia")
    public ResponseEntity<List<RegistroAsistencia>> obtenerTodasLasAsistencias() {
        return ResponseEntity.ok(servicioAsistencia.obtenerTodasLasAsistencias());
    }

    @GetMapping("/estudiante/{estudianteId}")
    @Operation(summary = "Obtener registros por estudiante")
    public ResponseEntity<List<RegistroAsistencia>> obtenerAsistenciaEstudiante(@PathVariable Long estudianteId) {
        return ResponseEntity.ok(servicioAsistencia.obtenerAsistenciaEstudiante(estudianteId));
    }

    @GetMapping("/curso/{curso}")
    @Operation(summary = "Obtener registros por curso")
    public ResponseEntity<List<RegistroAsistencia>> obtenerAsistenciaPorCurso(@PathVariable String curso) {
        return ResponseEntity.ok(servicioAsistencia.obtenerAsistenciaPorCurso(curso));
    }

    @GetMapping("/estudiante/{estudianteId}/estadisticas")
    @Operation(summary = "Obtener estadisticas de asistencia por estudiante")
    public ResponseEntity<EstadisticasAsistenciaDto> obtenerEstadisticas(@PathVariable Long estudianteId) {
        return ResponseEntity.ok(servicioAsistencia.obtenerEstadísticasEstudiante(estudianteId));
    }

    @GetMapping("/estudiante/{estudianteId}/atrasos")
    @Operation(summary = "Obtener atrasos por estudiante con umbral")
    public ResponseEntity<List<RegistroAtraso>> obtenerAtrasos(
            @PathVariable Long estudianteId,
            @RequestParam(defaultValue = "15") int umbral) {
        return ResponseEntity.ok(servicioAsistencia.obtenerAtrasosAboveUmbral(estudianteId, umbral));
    }
}
