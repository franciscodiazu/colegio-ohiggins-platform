package com.backend.ms_students.controller;

import com.backend.ms_students.model.Student;
import com.backend.ms_students.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Estudiantes", description = "Gestión de estudiantes del Colegio Bernardo O'Higgins")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Operation(summary = "Obtener todos los estudiantes",
               description = "Retorna la lista completa de estudiantes registrados en el sistema.")
    @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @Operation(summary = "Registrar un nuevo estudiante",
               description = "Crea y guarda un nuevo estudiante en la base de datos.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Estudiante creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student savedStudent = studentService.createStudent(student);
        return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
    }

    @Operation(summary = "Buscar estudiante por ID",
               description = "Retorna los datos de un estudiante específico según su ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estudiante encontrado"),
        @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(
            @Parameter(description = "ID del estudiante") @PathVariable Long id) {
        return studentService.getStudentById(id)
                .map(student -> new ResponseEntity<>(student, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @Operation(summary = "Actualizar estudiante existente",
               description = "Modifica los datos de un estudiante ya registrado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estudiante actualizado correctamente"),
        @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @Parameter(description = "ID del estudiante a actualizar") @PathVariable Long id,
            @RequestBody Student studentDetails) {
        return studentService.updateStudent(id, studentDetails)
                .map(student -> new ResponseEntity<>(student, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}