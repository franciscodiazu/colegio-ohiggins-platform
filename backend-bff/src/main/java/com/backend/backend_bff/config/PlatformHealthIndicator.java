package com.backend.backend_bff.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component("platformHealth")
public class PlatformHealthIndicator implements HealthIndicator {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.students.url:http://localhost:8081}")
    private String studentsUrl;

    @Value("${services.attendance.url:http://localhost:8082}")
    private String attendanceUrl;

    @Override
    public Health health() {
        try {
            restTemplate.getForObject(studentsUrl + "/actuator/health", String.class);
            restTemplate.getForObject(attendanceUrl + "/actuator/health", String.class);

            return Health.up()
                    .withDetail("ms-students", "UP")
                    .withDetail("ms-attendance", "UP")
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", "Servicio crítico inaccesible: " + e.getMessage())
                    .build();
        }
    }
}
