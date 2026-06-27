package com.backend.backend_bff.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI bffOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Backend BFF - Colegio Ohiggins")
                        .description("Backend For Frontend (BFF) que actúa como agregador de salud de la plataforma de microservicios. Expone endpoints de monitoreo (/actuator/health, /actuator/prometheus) para Docker healthcheck y Prometheus. Componente arquitectónico requerido por la rúbrica EV3.")
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo")
                                .email("dev@colegioohiggins.cl")));
    }
}
