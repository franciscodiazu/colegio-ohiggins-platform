package com.backend.ms_students.controller;

import com.backend.ms_students.dto.StudentRequestDto;
import com.backend.ms_students.dto.StudentResponseDto;
import com.backend.ms_students.dto.StudentUpdateDto;
import com.backend.ms_students.model.Student;
import com.backend.ms_students.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/estudiantes")
@Tag(name = "Estudiantes", description = "Gestion del alumnado - Colegio Bernardo O'Higgins")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @PostMapping({"", "/"})
    @Operation(summary = "Crear estudiante", description = "Registra un nuevo alumno con validacion de DTO")
    public ResponseEntity<StudentResponseDto> crear(@Valid @RequestBody StudentRequestDto dto) {
        log.info("POST /api/v1/estudiantes - Crear estudiante");
        Student creado = service.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDto(creado));
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<StudentResponseDto>> listarTodos() {
        List<StudentResponseDto> result = service.getAllStudents().stream()
            .map(StudentController::toResponseDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDto> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(toResponseDto(service.obtenerPorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponseDto> actualizar(@PathVariable Long id, @Valid @RequestBody StudentUpdateDto dto) {
        Student actualizado = service.updateStudent(id, dto)
            .orElseThrow(() -> new com.backend.ms_students.exception.EntidadNoEncontradaException("Estudiante no encontrado: " + id));
        return ResponseEntity.ok(toResponseDto(actualizado));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar estudiante", description = "Elimina un alumno por su ID (solo ADMIN)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    private static StudentResponseDto toResponseDto(Student s) {
        return StudentResponseDto.builder()
            .id(s.getId())
            .rut(s.getRut())
            .name(s.getName())
            .grade(s.getGrade())
            .email(s.getEmail())
            .phone(s.getPhone())
            .creadoEn(s.getCreadoEn())
            .actualizadoEn(s.getActualizadoEn())
            .build();
    }
}
