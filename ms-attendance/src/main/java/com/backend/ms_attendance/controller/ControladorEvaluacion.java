package com.backend.ms_attendance.controller;

import com.backend.ms_attendance.dto.CalificacionRequestDto;
import com.backend.ms_attendance.dto.CalificacionResponseDto;
import com.backend.ms_attendance.dto.EvaluacionRequestDto;
import com.backend.ms_attendance.dto.EvaluacionResponseDto;
import com.backend.ms_attendance.model.Calificacion;
import com.backend.ms_attendance.model.Evaluacion;
import com.backend.ms_attendance.service.ServicioEvaluacion;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/evaluaciones")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080", "http://frontend:8080"})
public class ControladorEvaluacion {

    private final ServicioEvaluacion servicioEvaluacion;

    public ControladorEvaluacion(ServicioEvaluacion servicioEvaluacion) {
        this.servicioEvaluacion = servicioEvaluacion;
    }

    @GetMapping
    public ResponseEntity<List<EvaluacionResponseDto>> listarEvaluaciones() {
        log.info("GET /api/v1/evaluaciones");
        List<EvaluacionResponseDto> result = servicioEvaluacion.listarEvaluaciones().stream()
            .map(ControladorEvaluacion::toResponseDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<EvaluacionResponseDto> crearEvaluacion(@Valid @RequestBody EvaluacionRequestDto dto) {
        log.info("POST /api/v1/evaluaciones - {} {}", dto.getNombre(), dto.getCurso());
        Evaluacion creada = servicioEvaluacion.crearEvaluacion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDto(creada));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionResponseDto> obtenerEvaluacion(@PathVariable Long id) {
        log.info("GET /api/v1/evaluaciones/{}", id);
        return ResponseEntity.ok(toResponseDto(servicioEvaluacion.obtenerEvaluacion(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluacionResponseDto> actualizarEvaluacion(@PathVariable Long id,
                                                                       @Valid @RequestBody EvaluacionRequestDto dto) {
        log.info("PUT /api/v1/evaluaciones/{}", id);
        Evaluacion actualizada = servicioEvaluacion.actualizarEvaluacion(id, dto);
        return ResponseEntity.ok(toResponseDto(actualizada));
    }

    @GetMapping("/curso/{curso}")
    public ResponseEntity<List<EvaluacionResponseDto>> listarEvaluacionesPorCurso(@PathVariable String curso) {
        log.info("GET /api/v1/evaluaciones/curso/{}", curso);
        List<EvaluacionResponseDto> result = servicioEvaluacion.listarEvaluacionesPorCurso(curso).stream()
            .map(ControladorEvaluacion::toResponseDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/calificaciones")
    public ResponseEntity<List<CalificacionResponseDto>> listarCalificaciones() {
        log.info("GET /api/v1/evaluaciones/calificaciones");
        List<CalificacionResponseDto> result = servicioEvaluacion.listarCalificaciones().stream()
            .map(ControladorEvaluacion::toCalificacionResponseDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/calificaciones")
    public ResponseEntity<CalificacionResponseDto> crearCalificacion(@Valid @RequestBody CalificacionRequestDto dto) {
        log.info("POST /api/v1/evaluaciones/calificaciones - eval={}, estudiante={}",
            dto.getEvaluacionId(), dto.getEstudianteId());
        Calificacion creada = servicioEvaluacion.crearCalificacion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(toCalificacionResponseDto(creada));
    }

    @GetMapping("/calificaciones/estudiante/{estudianteId}")
    public ResponseEntity<List<CalificacionResponseDto>> listarCalificacionesPorEstudiante(@PathVariable Long estudianteId) {
        log.info("GET /api/v1/evaluaciones/calificaciones/estudiante/{}", estudianteId);
        List<CalificacionResponseDto> result = servicioEvaluacion.listarCalificacionesPorEstudiante(estudianteId).stream()
            .map(ControladorEvaluacion::toCalificacionResponseDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/calificaciones/evaluacion/{evaluacionId}")
    public ResponseEntity<List<CalificacionResponseDto>> listarCalificacionesPorEvaluacion(@PathVariable Long evaluacionId) {
        log.info("GET /api/v1/evaluaciones/calificaciones/evaluacion/{}", evaluacionId);
        List<CalificacionResponseDto> result = servicioEvaluacion.listarCalificacionesPorEvaluacion(evaluacionId).stream()
            .map(ControladorEvaluacion::toCalificacionResponseDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    private static EvaluacionResponseDto toResponseDto(Evaluacion e) {
        return EvaluacionResponseDto.builder()
            .id(e.getId())
            .nombre(e.getNombre())
            .curso(e.getCurso())
            .fecha(e.getFecha())
            .ponderacion(e.getPonderacion())
            .descripcion(e.getDescripcion())
            .creadoEn(e.getCreadoEn())
            .actualizadoEn(e.getActualizadoEn())
            .build();
    }

    private static CalificacionResponseDto toCalificacionResponseDto(Calificacion c) {
        return CalificacionResponseDto.builder()
            .id(c.getId())
            .evaluationId(c.getEvaluacion() != null ? c.getEvaluacion().getId() : null)
            .studentId(c.getEstudianteId())
            .nota(c.getNota())
            .observacion(c.getObservacion())
            .creadoEn(c.getCreadoEn())
            .actualizadoEn(c.getActualizadoEn())
            .build();
    }
}
