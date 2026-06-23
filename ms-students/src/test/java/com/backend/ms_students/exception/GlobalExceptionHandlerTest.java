package com.backend.ms_students.exception;

import com.backend.ms_students.controller.StudentController;
import com.backend.ms_students.dto.StudentRequestDto;
import com.backend.ms_students.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StudentController.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StudentService studentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void handleValidationExceptions_cuandoDtoInvalido_debeRetornar400() throws Exception {
        StudentRequestDto dtoInvalido = new StudentRequestDto();
        dtoInvalido.setRut("");
        dtoInvalido.setName("");
        dtoInvalido.setGrade("");

        mockMvc.perform(post("/api/v1/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validación Fallida"))
                .andExpect(jsonPath("$.validations.rut").value("El RUT es obligatorio"))
                .andExpect(jsonPath("$.validations.name").value("El nombre es obligatorio"))
                .andExpect(jsonPath("$.validations.grade").value("El grado es obligatorio"));
    }

    @Test
    void handleAll_cuandoErrorInesperado_debeRetornar500() throws Exception {
        when(studentService.getAllStudents()).thenThrow(new RuntimeException("Error simulado"));

        mockMvc.perform(get("/api/v1/estudiantes"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Error Interno"))
                .andExpect(jsonPath("$.message").value("Ocurrió un error inesperado en el sistema"));
    }
}
