package com.backend.backend_bff.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(excludeAutoConfiguration = DataSourceAutoConfiguration.class)
@Import(WebConfig.class)
class WebConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Permite origen Vite dev server (5173)")
    void allowedOrigin_viteDevServer() throws Exception {
        mockMvc.perform(options("/api/asistencia/lista")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    @DisplayName("Permite origen 127.0.0.1:5173")
    void allowedOrigin_127001() throws Exception {
        mockMvc.perform(options("/api/asistencia/lista")
                .header("Origin", "http://127.0.0.1:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:5173"));
    }

    @Test
    @DisplayName("Permite origen frontend Docker (frontend:80)")
    void allowedOrigin_docker() throws Exception {
        mockMvc.perform(options("/api/asistencia/lista")
                .header("Origin", "http://frontend:80")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().string("Access-Control-Allow-Origin", "http://frontend:80"));
    }

    @Test
    @DisplayName("Permite método PATCH en CORS")
    void allowedMethod_PATCH() throws Exception {
        mockMvc.perform(options("/api/students/1")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "PATCH"))
            .andExpect(header().string("Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("PATCH")));
    }

    @Test
    @DisplayName("Permite método OPTIONS en CORS")
    void allowedMethod_OPTIONS() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "OPTIONS"))
            .andExpect(header().string("Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("OPTIONS")));
    }

    @Test
    @DisplayName("maxAge está configurado en la respuesta")
    void corsMaxAge_isSet() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().exists("Access-Control-Max-Age"));
    }

    @Test
    @DisplayName("Allow-Credentials es true en WebConfig")
    void allowCredentials_isTrue() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("Bloquea origen no configurado")
    void blockedOrigin_noAllowOriginHeader() throws Exception {
        mockMvc.perform(options("/api/students/")
                .header("Origin", "http://attacker.io")
                .header("Access-Control-Request-Method", "DELETE"))
            .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}