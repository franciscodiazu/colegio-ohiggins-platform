package com.backend.ms_students.service;

import com.backend.ms_students.dto.StudentRequestDto;
import com.backend.ms_students.exception.EntidadNoEncontradaException;
import com.backend.ms_students.factory.StudentFactory;
import com.backend.ms_students.model.Student;
import com.backend.ms_students.repository.StudentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
public class StudentService {

    private final StudentRepository repository;
    private final Map<String, StudentFactory> factories;

    public StudentService(StudentRepository repository, Map<String, StudentFactory> factories) {
        this.repository = repository;
        this.factories = factories;
    }

    public Student registrar(StudentRequestDto dto) {
        log.info("Registrando estudiante RUT: {}", dto.getRut());
        Student student = factories.get("REGULAR").crearEstudiante(dto);
        return repository.save(student);
    }

    public Student obtenerPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntidadNoEncontradaException("Estudiante no encontrado: " + id));
    }

    // Métodos compatibles con tests y endpoints legacy
    public List<Student> getAllStudents() {
        return repository.findAll();
    }

    public Student createStudent(Student student) {
        return repository.save(student);
    }

    public Optional<Student> getStudentById(Long id) {
        return repository.findById(id);
    }

    public Optional<Student> updateStudent(Long id, Student details) {
        return repository.findById(id).map(existing -> {
            existing.setRut(details.getRut());
            existing.setName(details.getName());
            existing.setGrade(details.getGrade());
            return repository.save(existing);
        });
    }
}