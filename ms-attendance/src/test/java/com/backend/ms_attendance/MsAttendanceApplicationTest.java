package com.backend.ms_attendance;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MsAttendanceApplication - Tests de Aplicación")
public class MsAttendanceApplicationTest {

    @Test
    @DisplayName("Debe crear contexto de aplicación Spring")
    void debeCrearContextoDeAplicacion() {
        // Arrange & Act
        SpringApplicationBuilder builder = new SpringApplicationBuilder(MsAttendanceApplication.class);
        
        // Assert
        assertThat(builder).isNotNull();
    }

    @Test
    @DisplayName("Debe tener anotación @SpringBootApplication")
    void debeTenerAnotacionSpringBootApplication() {
        // Arrange & Act
        MsAttendanceApplication app = new MsAttendanceApplication();

        // Assert
        assertThat(app.getClass().getAnnotation(org.springframework.boot.autoconfigure.SpringBootApplication.class))
            .isNotNull();
    }
}
