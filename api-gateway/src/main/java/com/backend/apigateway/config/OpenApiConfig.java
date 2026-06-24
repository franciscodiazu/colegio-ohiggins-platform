package com.backend.apigateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiGatewayOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Gateway - Colegio Ohiggins")
                        .description("Puerta de enlace única que enruta peticiones a los microservicios internos. " +
                                "Gestiona autenticación JWT, CORS y balanceo de carga.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo")
                                .email("dev@colegioohiggins.cl")));
    }
}
