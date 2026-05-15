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
import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // 1. Configuración de HttpClient 5 (Apache)
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(Timeout.ofSeconds(5))
                .setResponseTimeout(Timeout.ofSeconds(10))
                .build();

        // 2. Gestión de Pool de conexiones
        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(100);
        connectionManager.setDefaultMaxPerRoute(20);
        // Usamos evict para limpiar conexiones inactivas, ideal para entornos AWS/Cloud
        connectionManager.setValidateAfterInactivity(TimeValue.ofSeconds(30));

        CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .setConnectionManager(connectionManager)
                .evictIdleConnections(TimeValue.ofMinutes(1)) // Limpieza automática de zombies
                .build();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);

        // 3. Builder de Spring modernizado (Sin "set", usando Duration directamente)
        return builder
                .requestFactory(() -> factory)
                .connectTimeout(Duration.ofSeconds(5)) // Cambiado: de setConnectTimeout -> connectTimeout
                .readTimeout(Duration.ofSeconds(10))   // Cambiado: de setReadTimeout -> readTimeout
                .build();
    }
}