package com.backend.ms_attendance.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ControladorAsistenciaResilienceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RestTemplate restTemplate;

    @Test
    void crearAsistencia_cuandoStudentsNoDisponible_retorna503ConMensajeControlado() throws Exception {
        Long estudianteId = 123L;

        when(restTemplate.getForEntity(anyString(), eq(Object.class)))
            .thenThrow(new ResourceAccessException("Connection timeout"));

        String payload = """
            {
              "estudiante_id": 123,
              "fecha_registro": "2026-05-15",
              "tipo_registro": "PRESENTE",
              "notas": "Prueba resiliencia"
            }
            """;

        mockMvc.perform(post("/api/v1/asistencia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.mensaje").value(
                "Validación temporalmente no disponible. Intente nuevamente más tarde."
            ));
    }
}
