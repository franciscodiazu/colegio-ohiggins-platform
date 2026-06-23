package com.backend.backend_bff.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SystemStatusService {

    private final RestTemplate restTemplate;
    private final String studentsUrl;
    private final String attendanceUrl;

    public SystemStatusService(
            RestTemplate restTemplate,
            @Value("${ms.students.url:http://localhost:8081}") String studentsUrl,
            @Value("${ms.attendance.url:http://localhost:8082}") String attendanceUrl
    ) {
        this.restTemplate = restTemplate;
        this.studentsUrl = studentsUrl;
        this.attendanceUrl = attendanceUrl;
    }

    public Map<String, Object> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "backend-bff");

        Map<String, Object> services = new HashMap<>();
        services.put("ms-students", checkService(studentsUrl + "/actuator/health"));
        services.put("ms-attendance", checkService(attendanceUrl + "/actuator/health"));

        boolean allUp = services.values().stream()
                .allMatch(v -> "UP".equals(v));

        status.put("status", allUp ? "UP" : "DEGRADED");
        status.put("services", services);
        return status;
    }

    private String checkService(String url) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response != null ? (String) response.get("status") : "DOWN";
        } catch (ResourceAccessException e) {
            return "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }
}
