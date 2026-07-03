package com.backend.apigateway.security.config;

import com.backend.apigateway.exception.ApiError;
import com.backend.apigateway.security.jwt.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final String[] allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${cors.allowed.origins:http://localhost:5173,http://localhost:8080}") String[] allowedOrigins
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/refresh").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/reset-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/students").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/students/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/asistencia").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/asistencia/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/clases").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/clases/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/evaluaciones").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/evaluaciones/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/students").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.POST, "/api/students/**").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.PUT, "/api/students").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.PUT, "/api/students/**").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/students").hasAnyRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/students/**").hasAnyRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/asistencia").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.POST, "/api/asistencia/**").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.POST, "/api/clases").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.POST, "/api/clases/**").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.POST, "/api/evaluaciones").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.POST, "/api/evaluaciones/**").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.PUT, "/api/asistencia").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.PUT, "/api/asistencia/**").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.PUT, "/api/clases").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.PUT, "/api/clases/**").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.PUT, "/api/evaluaciones").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.PUT, "/api/evaluaciones/**").hasAnyRole("ADMIN", "DOCENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/asistencia").hasAnyRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/asistencia/**").hasAnyRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/clases").hasAnyRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/clases/**").hasAnyRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/evaluaciones").hasAnyRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/evaluaciones/**").hasAnyRole("ADMIN")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(new ObjectMapper().writeValueAsString(
                        ApiError.builder()
                            .timestamp(LocalDateTime.now())
                            .status(HttpServletResponse.SC_UNAUTHORIZED)
                            .error("No autenticado")
                            .code("UNAUTHORIZED")
                            .message(authException.getMessage())
                            .path(request.getRequestURI())
                            .build()
                    ));
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(new ObjectMapper().writeValueAsString(
                        ApiError.builder()
                            .timestamp(LocalDateTime.now())
                            .status(HttpServletResponse.SC_FORBIDDEN)
                            .error("Acceso denegado")
                            .code("FORBIDDEN")
                            .message(accessDeniedException.getMessage())
                            .path(request.getRequestURI())
                            .build()
                    ));
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}