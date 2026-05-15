package com.backend.ms_students.controller;

import com.backend.ms_students.dto.StudentRequestDto;
import com.backend.ms_students.model.Student;
import com.backend.ms_students.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@Tag(name = "Estudiantes", description = "Gestión del alumnado - Colegio Bernardo O'Higgins")
public class StudentController {

    @Autowired
    private StudentService service;

    @PostMapping(path = "/api/v1/estudiantes")
    @Operation(summary = "Crear estudiante", description = "Registra un nuevo alumno con validación de DTO")
    public ResponseEntity<?> crear(@Valid @RequestBody StudentRequestDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RespuestaError(e.getMessage()));
        }
    }

    @GetMapping(path = "/api/v1/estudiantes/{id}")
    public ResponseEntity<Student> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // Legacy endpoints (absolute paths) for compatibility with tests and BFF
    @GetMapping(path = "/api/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(service.getAllStudents());
    }

    @PostMapping(path = "/api/students")
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student saved = service.createStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping(path = "/api/students/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        Optional<Student> s = service.getStudentById(id);
        if (s.isPresent()) {
            return ResponseEntity.ok(s.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new RespuestaError("Estudiante no encontrado"));
    }

    @PutMapping(path = "/api/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student dto) {
        dto.setId(id);
        Optional<Student> updated = service.updateStudent(id, dto);
        if (updated.isPresent()) {
            return ResponseEntity.ok(updated.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new RespuestaError("Estudiante no encontrado para actualizar"));
    }

    public static record RespuestaError(String mensaje) {}
}