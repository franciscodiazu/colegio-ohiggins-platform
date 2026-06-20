package com.backend.backend_bff.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(excludeAutoConfiguration = DataSourceAutoConfiguration.class)
@Import(CorsConfig.class)
@TestPropertySource(properties = {
    "cors.allowed.origins=http://localhost:5173,http://localhost:8080"
})
class CorsConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Responde a preflight OPTIONS con headers CORS correctos")
    void preflightRequest_returnsCorHeaders() throws Exception {
        mockMvc.perform(options("/api/students/1")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk())
            .andExpect(header().exists("Access-Control-Allow-Origin"));
    }

    @Test
    @DisplayName("Permite origen http://localhost:5173")
    void allowedOrigin_localhost5173() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    @DisplayName("Permite método GET en CORS")
    void allowedMethod_GET() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().string("Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("GET")));
    }

    @Test
    @DisplayName("Permite método POST en CORS")
    void allowedMethod_POST() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "POST"))
            .andExpect(header().string("Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("POST")));
    }

    @Test
    @DisplayName("Permite método DELETE en CORS")
    void allowedMethod_DELETE() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "DELETE"))
            .andExpect(header().string("Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("DELETE")));
    }

    @Test
    @DisplayName("Allow-Credentials es true")
    void allowCredentials_isTrue() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("Bloquea origen no permitido")
    void blockedOrigin_returnsNoAllowOriginHeader() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://malicious.com")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}