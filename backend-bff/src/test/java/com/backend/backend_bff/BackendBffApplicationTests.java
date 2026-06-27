package com.backend.backend_bff;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

import static org.assertj.core.api.Assertions.assertThat;

class BackendBffApplicationTests {

    @Test
    @DisplayName("La clase principal tiene la anotación @SpringBootApplication")
    void applicationClass_hasSpringBootApplicationAnnotation() {
        SpringBootApplication annotation =
            BackendBffApplication.class.getAnnotation(SpringBootApplication.class);
        assertThat(annotation).isNotNull();
    }

    @Test
    @DisplayName("DataSourceAutoConfiguration ya no está excluido (BFF usa JPA)")
    void applicationClass_noLongerExcludesDataSourceAutoConfiguration() {
        SpringBootApplication annotation =
            BackendBffApplication.class.getAnnotation(SpringBootApplication.class);
        assertThat(annotation.exclude())
            .doesNotContain(DataSourceAutoConfiguration.class);
    }
}