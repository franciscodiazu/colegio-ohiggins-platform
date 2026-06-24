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
@RequestMapping("/api/v1/estudiantes")
@Tag(name = "Estudiantes", description = "Gestión del alumnado - Colegio Bernardo O'Higgins")
public class StudentController {

    @Autowired
    private StudentService service;

    @PostMapping({"", "/"})
    @Operation(summary = "Crear estudiante", description = "Registra un nuevo alumno con validación de DTO")
    public ResponseEntity<?> crear(@Valid @RequestBody StudentRequestDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RespuestaError(e.getMessage()));
        }
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Student>> listarTodos() {
        return ResponseEntity.ok(service.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> actualizar(@PathVariable Long id, @RequestBody Student details) {
        Student actualizado = service.updateStudent(id, details)
            .orElseThrow(() -> new com.backend.ms_students.exception.EntidadNoEncontradaException("Estudiante no encontrado: " + id));
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar estudiante", description = "Elimina un alumno por su ID (solo ADMIN)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    public static record RespuestaError(String mensaje) {}
}