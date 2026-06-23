package com.backend.backend_bff.controller;

import com.backend.backend_bff.service.SystemStatusService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SystemStatusController.class)
class SystemStatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SystemStatusService systemStatusService;

    @Test
    void getStatus_cuandoTodoUp_debeRetornar200() throws Exception {
        Map<String, Object> statusOk = Map.of(
            "service", "backend-bff",
            "status", "UP",
            "services", Map.of(
                "ms-students", "UP",
                "ms-attendance", "UP"
            )
        );
        when(systemStatusService.getSystemStatus()).thenReturn(statusOk);

        mockMvc.perform(get("/api/bff/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("backend-bff"))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.services.ms-students").value("UP"))
                .andExpect(jsonPath("$.services.ms-attendance").value("UP"));
    }

    @Test
    void getStatus_cuandoServiciosDegradados_debeRetornar200() throws Exception {
        Map<String, Object> statusDegraded = Map.of(
            "service", "backend-bff",
            "status", "DEGRADED",
            "services", Map.of(
                "ms-students", "DOWN",
                "ms-attendance", "UP"
            )
        );
        when(systemStatusService.getSystemStatus()).thenReturn(statusDegraded);

        mockMvc.perform(get("/api/bff/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DEGRADED"))
                .andExpect(jsonPath("$.services.ms-students").value("DOWN"))
                .andExpect(jsonPath("$.services.ms-attendance").value("UP"));
    }
}
