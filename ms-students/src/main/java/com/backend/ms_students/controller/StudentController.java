package com.backend.ms_students.controller;

import com.backend.ms_students.model.Student;
import com.backend.ms_students.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students") // Coincide con la ruta configurada en el BFF
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    // Obtener todos los estudiantes
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Registrar un nuevo estudiante (Validación tecnológica)
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student savedStudent = studentRepository.save(student);
        return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
    }

    // Buscar por ID (Útil para el perfil del alumno)
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(student -> new ResponseEntity<>(student, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}