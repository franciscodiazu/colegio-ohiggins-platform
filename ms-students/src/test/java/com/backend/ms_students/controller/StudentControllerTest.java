package com.backend.ms_students.controller;

import com.backend.ms_students.model.Student;
import com.backend.ms_students.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentController.class)
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StudentService studentService;

    @Autowired
    private ObjectMapper objectMapper;

    private Student student;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);
        student.setRut("12345678-9");
        student.setName("Juan Pérez");
        student.setGrade("5°A");
    }

    // ── GET /api/students ────────────────────────────────────

    @Test
    void getAllStudents_debeRetornar200ConListaDeEstudiantes() throws Exception {
        // Arrange
        Student student2 = new Student();
        student2.setId(2L);
        student2.setRut("98765432-1");
        student2.setName("María López");
        student2.setGrade("6°B");

        List<Student> lista = Arrays.asList(student, student2);
        when(studentService.getAllStudents()).thenReturn(lista);

        // Act & Assert
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Juan Pérez"))
                .andExpect(jsonPath("$[0].rut").value("12345678-9"))
                .andExpect(jsonPath("$[1].name").value("María López"));

        verify(studentService, times(1)).getAllStudents();
    }

    @Test
    void getAllStudents_cuandoListaVacia_debeRetornar200ConArregloVacio() throws Exception {
        // Arrange
        when(studentService.getAllStudents()).thenReturn(List.of());

        // Act & Assert
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ── POST /api/students ───────────────────────────────────

    @Test
    void createStudent_debeRetornar201ConEstudianteCreado() throws Exception {
        // Arrange
        when(studentService.createStudent(any(Student.class))).thenReturn(student);

        // Act & Assert
        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(student)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Juan Pérez"))
                .andExpect(jsonPath("$.rut").value("12345678-9"))
                .andExpect(jsonPath("$.grade").value("5°A"));

        verify(studentService, times(1)).createStudent(any(Student.class));
    }

    @Test
    void createStudent_debeInvocarServiceUnaVez() throws Exception {
        // Arrange
        when(studentService.createStudent(any(Student.class))).thenReturn(student);

        // Act
        mockMvc.perform(post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(student)));

        // Assert
        verify(studentService, times(1)).createStudent(any(Student.class));
    }

    // ── GET /api/students/{id} ───────────────────────────────

    @Test
    void getStudentById_cuandoExiste_debeRetornar200() throws Exception {
        // Arrange
        when(studentService.getStudentById(1L)).thenReturn(Optional.of(student));

        // Act & Assert
        mockMvc.perform(get("/api/students/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Juan Pérez"))
                .andExpect(jsonPath("$.rut").value("12345678-9"));

        verify(studentService, times(1)).getStudentById(1L);
    }

    @Test
    void getStudentById_cuandoNoExiste_debeRetornar404() throws Exception {
        // Arrange
        when(studentService.getStudentById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/students/99"))
                .andExpect(status().isNotFound());

        verify(studentService, times(1)).getStudentById(99L);
    }

    // ── PUT /api/students/{id} ───────────────────────────────

    @Test
    void updateStudent_cuandoExiste_debeRetornar200ConDatosActualizados() throws Exception {
        // Arrange
        Student actualizado = new Student();
        actualizado.setId(1L);
        actualizado.setRut("11111111-1");
        actualizado.setName("Juan Actualizado");
        actualizado.setGrade("6°A");

        when(studentService.updateStudent(eq(1L), any(Student.class)))
                .thenReturn(Optional.of(actualizado));

        // Act & Assert
        mockMvc.perform(put("/api/students/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Juan Actualizado"))
                .andExpect(jsonPath("$.rut").value("11111111-1"))
                .andExpect(jsonPath("$.grade").value("6°A"));

        verify(studentService, times(1)).updateStudent(eq(1L), any(Student.class));
    }

    @Test
    void updateStudent_cuandoNoExiste_debeRetornar404() throws Exception {
        // Arrange
        when(studentService.updateStudent(eq(99L), any(Student.class)))
                .thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put("/api/students/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(student)))
                .andExpect(status().isNotFound());

        verify(studentService, times(1)).updateStudent(eq(99L), any(Student.class));
    }
}