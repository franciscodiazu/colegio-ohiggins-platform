package com.backend.backend_bff.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Component("platformHealth")
public class PlatformHealthIndicator implements HealthIndicator {

    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final WebClient.Builder webClientBuilder;

    public PlatformHealthIndicator(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public Health health() {
        try {
            String studentsHealth = webClientBuilder.build()
                .get().uri("lb://MS-STUDENTS/actuator/health")
                .retrieve().bodyToMono(String.class).block(TIMEOUT);

            String attendanceHealth = webClientBuilder.build()
                .get().uri("lb://MS-ATTENDANCE/actuator/health")
                .retrieve().bodyToMono(String.class).block(TIMEOUT);

            return Health.up()
                    .withDetail("ms-students", studentsHealth)
                    .withDetail("ms-attendance", attendanceHealth)
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", "Servicio crítico inaccesible: " + e.getMessage())
                    .build();
        }
    }
}
