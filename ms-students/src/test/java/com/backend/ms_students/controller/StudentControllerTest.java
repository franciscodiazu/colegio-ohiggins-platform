package com.backend.ms_students.controller;

import com.backend.ms_students.dto.StudentRequestDto;
import com.backend.ms_students.dto.StudentUpdateDto;
import com.backend.ms_students.exception.EntidadNoEncontradaException;
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
    private StudentRequestDto studentDto;

    private static final String BASE_URL = "/api/v1/estudiantes";

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);
        student.setRut("12345678-9");
        student.setName("Juan Pérez");
        student.setGrade("5°A");

        studentDto = new StudentRequestDto();
        studentDto.setRut("11111111-1");
        studentDto.setName("Juan Pérez");
        studentDto.setGrade("5°A");
    }

    // ── GET /api/v1/estudiantes ──────────────────────────────

    @Test
    void getAllStudents_debeRetornar200ConListaDeEstudiantes() throws Exception {
        Student student2 = new Student();
        student2.setId(2L);
        student2.setRut("98765432-1");
        student2.setName("María López");
        student2.setGrade("6°B");

        List<Student> lista = Arrays.asList(student, student2);
        when(studentService.getAllStudents()).thenReturn(lista);

        mockMvc.perform(get(BASE_URL))
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
        when(studentService.getAllStudents()).thenReturn(List.of());

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createStudent_debeRetornar201ConEstudianteCreado() throws Exception {
        when(studentService.registrar(any(StudentRequestDto.class))).thenReturn(student);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Juan Pérez"))
                .andExpect(jsonPath("$.rut").value("12345678-9"))
                .andExpect(jsonPath("$.grade").value("5°A"));

        verify(studentService, times(1)).registrar(any(StudentRequestDto.class));
    }

    @Test
    void createStudent_debeInvocarServiceUnaVez() throws Exception {
        when(studentService.registrar(any(StudentRequestDto.class))).thenReturn(student);

        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentDto)));

        verify(studentService, times(1)).registrar(any(StudentRequestDto.class));
    }

    @Test
    void getStudentById_cuandoExiste_debeRetornar200() throws Exception {
        when(studentService.obtenerPorId(1L)).thenReturn(student);

        mockMvc.perform(get(BASE_URL + "/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Juan Pérez"))
                .andExpect(jsonPath("$.rut").value("12345678-9"));

        verify(studentService, times(1)).obtenerPorId(1L);
    }

    @Test
    void getStudentById_cuandoNoExiste_debeRetornar404() throws Exception {
        when(studentService.obtenerPorId(99L))
                .thenThrow(new EntidadNoEncontradaException("Estudiante no encontrado: 99"));

        mockMvc.perform(get(BASE_URL + "/99"))
                .andExpect(status().isNotFound());

        verify(studentService, times(1)).obtenerPorId(99L);
    }

    @Test
    void updateStudent_cuandoExiste_debeRetornar200ConDatosActualizados() throws Exception {
        StudentUpdateDto dto = new StudentUpdateDto();
        dto.setRut("11111111-1");
        dto.setName("Juan Actualizado");
        dto.setGrade("6°A");

        Student actualizado = new Student();
        actualizado.setId(1L);
        actualizado.setRut("11111111-1");
        actualizado.setName("Juan Actualizado");
        actualizado.setGrade("6°A");

        when(studentService.updateStudent(eq(1L), any(StudentUpdateDto.class)))
                .thenReturn(Optional.of(actualizado));

        mockMvc.perform(put(BASE_URL + "/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Juan Actualizado"))
                .andExpect(jsonPath("$.rut").value("11111111-1"))
                .andExpect(jsonPath("$.grade").value("6°A"));

        verify(studentService, times(1)).updateStudent(eq(1L), any(StudentUpdateDto.class));
    }

    @Test
    void updateStudent_cuandoNoExiste_debeRetornar404() throws Exception {
        StudentUpdateDto dto = new StudentUpdateDto();
        dto.setRut("99999999-9");
        dto.setName("No Existe");
        dto.setGrade("0°Z");

        when(studentService.updateStudent(eq(99L), any(StudentUpdateDto.class)))
                .thenReturn(Optional.empty());

        mockMvc.perform(put(BASE_URL + "/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());

        verify(studentService, times(1)).updateStudent(eq(99L), any(StudentUpdateDto.class));
    }
}