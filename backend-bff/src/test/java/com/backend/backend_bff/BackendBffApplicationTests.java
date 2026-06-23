package com.backend.backend_bff;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import static org.assertj.core.api.Assertions.assertThat;

class BackendBffApplicationTests {

    @Test
    @DisplayName("La clase principal tiene la anotacion @SpringBootApplication")
    void applicationClass_hasSpringBootApplicationAnnotation() {
        SpringBootApplication annotation =
            BackendBffApplication.class.getAnnotation(SpringBootApplication.class);
        assertThat(annotation).isNotNull();
    }
}
