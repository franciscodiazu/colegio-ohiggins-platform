package com.backend.ms_attendance.controller;

import com.backend.ms_attendance.dto.ClaseRequestDto;
import com.backend.ms_attendance.dto.ClaseResponseDto;
import com.backend.ms_attendance.model.Clase;
import com.backend.ms_attendance.service.ServicioClase;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/clases")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080", "http://frontend:8080"})
public class ControladorClase {

    private final ServicioClase servicioClase;

    public ControladorClase(ServicioClase servicioClase) {
        this.servicioClase = servicioClase;
    }

    @GetMapping
    public ResponseEntity<List<ClaseResponseDto>> listarClases() {
        log.info("GET /api/v1/clases - Listar clases");
        List<ClaseResponseDto> clases = servicioClase.listarClases().stream()
            .map(ControladorClase::toResponseDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(clases);
    }

    @PostMapping
    public ResponseEntity<ClaseResponseDto> crearClase(@Valid @RequestBody ClaseRequestDto dto) {
        log.info("POST /api/v1/clases - Crear clase {} {} {}", dto.getCurso(), dto.getAsignatura(), dto.getFecha());
        Clase creada = servicioClase.crearClase(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDto(creada));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaseResponseDto> obtenerClase(@PathVariable Long id) {
        log.info("GET /api/v1/clases/{}", id);
        return ResponseEntity.ok(toResponseDto(servicioClase.obtenerClase(id)));
    }

    private static ClaseResponseDto toResponseDto(Clase clase) {
        return ClaseResponseDto.builder()
            .id(clase.getId())
            .fecha(clase.getFecha())
            .curso(clase.getCurso())
            .asignatura(clase.getAsignatura())
            .bloque(clase.getBloque())
            .build();
    }
}
