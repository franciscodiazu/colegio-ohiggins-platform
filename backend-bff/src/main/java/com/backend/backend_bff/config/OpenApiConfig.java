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
                        .description("Backend For Frontend que orquesta las peticiones de los clientes frontend " +
                                "hacia los microservicios internos, aplicando reglas de negocio y seguridad.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo")
                                .email("dev@colegioohiggins.cl")));
    }
}
