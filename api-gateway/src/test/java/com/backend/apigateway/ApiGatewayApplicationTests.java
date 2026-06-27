package com.backend.apigateway;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

import static org.assertj.core.api.Assertions.assertThat;

class ApiGatewayApplicationTests {

    @Test
    @DisplayName("La clase principal tiene la anotación @SpringBootApplication")
    void applicationClass_hasSpringBootApplicationAnnotation() {
        SpringBootApplication annotation =
            ApiGatewayApplication.class.getAnnotation(SpringBootApplication.class);
        assertThat(annotation).isNotNull();
    }

    @Test
    @DisplayName("DataSourceAutoConfiguration no está excluido (gateway usa JPA)")
    void applicationClass_noLongerExcludesDataSourceAutoConfiguration() {
        SpringBootApplication annotation =
            ApiGatewayApplication.class.getAnnotation(SpringBootApplication.class);
        assertThat(annotation.exclude())
            .doesNotContain(DataSourceAutoConfiguration.class);
    }
}
