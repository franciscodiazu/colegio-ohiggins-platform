package com.backend.ms_students.controller;

import com.backend.ms_students.dto.StudentRequestDto;
import com.backend.ms_students.model.Student;
import com.backend.ms_students.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    // (Kept below a single set of legacy endpoints with explicit MediaType)

    public static record RespuestaError(String mensaje) {}

    // ------------------ Legacy API (English paths) for compatibility with frontend/tests ------------------

    @GetMapping(path = "/api/students", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(service.getAllStudents());
    }

    @PostMapping(path = "/api/students", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student created = service.createStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping(path = "/api/students/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Optional<Student> s = service.getStudentById(id);
        return s.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping(path = "/api/students/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student details) {
        Optional<Student> updated = service.updateStudent(id, details);
        return updated.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}