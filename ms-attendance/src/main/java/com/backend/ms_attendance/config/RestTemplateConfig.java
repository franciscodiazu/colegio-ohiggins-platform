package com.backend.ms_attendance.config;

import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.util.Timeout;
import org.apache.hc.core5.util.TimeValue;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // 1. Configuración de HttpClient 5 (Apache) - Centralización de Timeouts
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(Timeout.ofSeconds(5))   // Tiempo límite para establecer el socket TCP
                .setResponseTimeout(Timeout.ofSeconds(10)) // Tiempo límite para esperar paquetes de datos (Read Timeout)
                .build();

        // 2. Gestión de Pool de conexiones óptimo para microservicios en la nube (AWS)
        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(100);           // Máximo de conexiones simultáneas totales en el pool
        connectionManager.setDefaultMaxPerRoute(20);    // Máximo de conexiones simultáneas hacia el mismo microservicio (ms-students)

        // Verifica si una conexión inactiva sigue viva antes de reusarla, evitando sockets rotos
        connectionManager.setValidateAfterInactivity(TimeValue.ofSeconds(30));

        CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .setConnectionManager(connectionManager)
                .evictIdleConnections(TimeValue.ofMinutes(1)) // Limpieza automática de sockets zombie/muertos por el proxy o ALB
                .build();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);

        // 3. Inicialización del componente RestTemplate de Spring
        // Delegamos el control de timeouts de forma EXCLUSIVA a la factoría de Apache HttpClient 5.
        // Removemos los métodos .connectTimeout() y .readTimeout() del builder para evitar sobreescritura de propiedades.
        return builder
                .requestFactory(() -> factory)
                .build();
    }
}