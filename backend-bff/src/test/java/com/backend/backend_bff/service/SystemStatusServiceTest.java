package com.backend.backend_bff.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemStatusServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private SystemStatusService systemStatusService;

    private Map<String, Object> healthUp;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(systemStatusService, "studentsUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(systemStatusService, "attendanceUrl", "http://localhost:8082");
        healthUp = Map.of("status", "UP");
    }

    @Test
    void getSystemStatus_cuandoAmbosUp_debeRetornarUP() {
        when(restTemplate.getForObject("http://localhost:8081/actuator/health", Map.class))
                .thenReturn(healthUp);
        when(restTemplate.getForObject("http://localhost:8082/actuator/health", Map.class))
                .thenReturn(healthUp);

        Map<String, Object> result = systemStatusService.getSystemStatus();

        assertEquals("UP", result.get("status"));
        assertEquals("backend-bff", result.get("service"));

        @SuppressWarnings("unchecked")
        Map<String, Object> services = (Map<String, Object>) result.get("services");
        assertEquals("UP", services.get("ms-students"));
        assertEquals("UP", services.get("ms-attendance"));
    }

    @Test
    void getSystemStatus_cuandoStudentsDown_debeRetornarDEGRADED() {
        when(restTemplate.getForObject("http://localhost:8081/actuator/health", Map.class))
                .thenThrow(new ResourceAccessException("Connection refused"));
        when(restTemplate.getForObject("http://localhost:8082/actuator/health", Map.class))
                .thenReturn(healthUp);

        Map<String, Object> result = systemStatusService.getSystemStatus();

        assertEquals("DEGRADED", result.get("status"));

        @SuppressWarnings("unchecked")
        Map<String, Object> services = (Map<String, Object>) result.get("services");
        assertEquals("DOWN", services.get("ms-students"));
        assertEquals("UP", services.get("ms-attendance"));
    }

    @Test
    void getSystemStatus_cuandoAttendanceDown_debeRetornarDEGRADED() {
        when(restTemplate.getForObject("http://localhost:8081/actuator/health", Map.class))
                .thenReturn(healthUp);
        when(restTemplate.getForObject("http://localhost:8082/actuator/health", Map.class))
                .thenThrow(new ResourceAccessException("Connection refused"));

        Map<String, Object> result = systemStatusService.getSystemStatus();

        assertEquals("DEGRADED", result.get("status"));

        @SuppressWarnings("unchecked")
        Map<String, Object> services = (Map<String, Object>) result.get("services");
        assertEquals("UP", services.get("ms-students"));
        assertEquals("DOWN", services.get("ms-attendance"));
    }

    @Test
    void getSystemStatus_cuandoAmbosDown_debeRetornarDEGRADED() {
        when(restTemplate.getForObject("http://localhost:8081/actuator/health", Map.class))
                .thenThrow(new ResourceAccessException("Connection refused"));
        when(restTemplate.getForObject("http://localhost:8082/actuator/health", Map.class))
                .thenThrow(new ResourceAccessException("Connection refused"));

        Map<String, Object> result = systemStatusService.getSystemStatus();

        assertEquals("DEGRADED", result.get("status"));

        @SuppressWarnings("unchecked")
        Map<String, Object> services = (Map<String, Object>) result.get("services");
        assertEquals("DOWN", services.get("ms-students"));
        assertEquals("DOWN", services.get("ms-attendance"));
    }

    @Test
    void getSystemStatus_cuandoStudentsTimeout_debeRetornarDOWN() {
        when(restTemplate.getForObject("http://localhost:8081/actuator/health", Map.class))
                .thenThrow(new ResourceAccessException("Read timed out"));
        when(restTemplate.getForObject("http://localhost:8082/actuator/health", Map.class))
                .thenReturn(healthUp);

        Map<String, Object> result = systemStatusService.getSystemStatus();

        assertEquals("DEGRADED", result.get("status"));

        @SuppressWarnings("unchecked")
        Map<String, Object> services = (Map<String, Object>) result.get("services");
        assertEquals("DOWN", services.get("ms-students"));
        assertEquals("UP", services.get("ms-attendance"));
    }

    @Test
    void getSystemStatus_cuandoStudentsRetornaNull_debeRetornarDOWN() {
        when(restTemplate.getForObject("http://localhost:8081/actuator/health", Map.class))
                .thenReturn(null);
        when(restTemplate.getForObject("http://localhost:8082/actuator/health", Map.class))
                .thenReturn(healthUp);

        Map<String, Object> result = systemStatusService.getSystemStatus();

        assertEquals("DEGRADED", result.get("status"));

        @SuppressWarnings("unchecked")
        Map<String, Object> services = (Map<String, Object>) result.get("services");
        assertEquals("DOWN", services.get("ms-students"));
        assertEquals("UP", services.get("ms-attendance"));
    }
}
