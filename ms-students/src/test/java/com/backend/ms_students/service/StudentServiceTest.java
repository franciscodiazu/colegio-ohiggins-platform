package com.backend.ms_students.service;

import com.backend.ms_students.model.Student;
import com.backend.ms_students.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    private Student student;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);
        student.setRut("12345678-9");
        student.setName("Juan Pérez");
        student.setGrade("5°A");
    }

    // ── getAllStudents ────────────────────────────────────────

    @Test
    void getAllStudents_debeRetornarListaDeEstudiantes() {
        // Arrange
        Student student2 = new Student();
        student2.setId(2L);
        student2.setRut("98765432-1");
        student2.setName("María López");
        student2.setGrade("6°B");

        when(studentRepository.findAll()).thenReturn(Arrays.asList(student, student2));

        // Act
        List<Student> resultado = studentService.getAllStudents();

        // Assert
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals("Juan Pérez", resultado.get(0).getName());
        assertEquals("María López", resultado.get(1).getName());
        verify(studentRepository, times(1)).findAll();
    }

    @Test
    void getAllStudents_cuandoNoHayEstudiantes_debeRetornarListaVacia() {
        // Arrange
        when(studentRepository.findAll()).thenReturn(List.of());

        // Act
        List<Student> resultado = studentService.getAllStudents();

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
        verify(studentRepository, times(1)).findAll();
    }

    // ── createStudent ────────────────────────────────────────

    @Test
    void createStudent_debeGuardarYRetornarEstudiante() {
        // Arrange
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        // Act
        Student resultado = studentService.createStudent(student);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("12345678-9", resultado.getRut());
        assertEquals("Juan Pérez", resultado.getName());
        assertEquals("5°A", resultado.getGrade());
        verify(studentRepository, times(1)).save(student);
    }

    @Test
    void createStudent_debeInvocarSaveUnaVez() {
        // Arrange
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        // Act
        studentService.createStudent(student);

        // Assert
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    // ── getStudentById ───────────────────────────────────────

    @Test
    void getStudentById_cuandoExiste_debeRetornarEstudiante() {
        // Arrange
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // Act
        Optional<Student> resultado = studentService.getStudentById(1L);

        // Assert
        assertTrue(resultado.isPresent());
        assertEquals("Juan Pérez", resultado.get().getName());
        assertEquals("12345678-9", resultado.get().getRut());
        verify(studentRepository, times(1)).findById(1L);
    }

    @Test
    void getStudentById_cuandoNoExiste_debeRetornarVacio() {
        // Arrange
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        // Act
        Optional<Student> resultado = studentService.getStudentById(99L);

        // Assert
        assertFalse(resultado.isPresent());
        verify(studentRepository, times(1)).findById(99L);
    }

    // ── updateStudent ────────────────────────────────────────

    @Test
    void updateStudent_cuandoExiste_debeActualizarYRetornarEstudiante() {
        // Arrange
        Student detallesActualizados = new Student();
        detallesActualizados.setRut("11111111-1");
        detallesActualizados.setName("Juan Pérez Actualizado");
        detallesActualizados.setGrade("6°A");

        Student estudianteActualizado = new Student();
        estudianteActualizado.setId(1L);
        estudianteActualizado.setRut("11111111-1");
        estudianteActualizado.setName("Juan Pérez Actualizado");
        estudianteActualizado.setGrade("6°A");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(estudianteActualizado);

        // Act
        Optional<Student> resultado = studentService.updateStudent(1L, detallesActualizados);

        // Assert
        assertTrue(resultado.isPresent());
        assertEquals("Juan Pérez Actualizado", resultado.get().getName());
        assertEquals("11111111-1", resultado.get().getRut());
        assertEquals("6°A", resultado.get().getGrade());
        verify(studentRepository, times(1)).findById(1L);
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void updateStudent_cuandoNoExiste_debeRetornarVacio() {
        // Arrange
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        // Act
        Optional<Student> resultado = studentService.updateStudent(99L, student);

        // Assert
        assertFalse(resultado.isPresent());
        verify(studentRepository, times(1)).findById(99L);
        verify(studentRepository, never()).save(any(Student.class));
    }
}