package cl.colegioohiggins.discovery;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

import static org.assertj.core.api.Assertions.assertThat;

class DiscoveryServerApplicationTests {

    @Test
    @DisplayName("La clase principal tiene la anotación @SpringBootApplication")
    void applicationClass_hasSpringBootApplicationAnnotation() {
        SpringBootApplication annotation =
            DiscoveryServerApplication.class.getAnnotation(SpringBootApplication.class);
        assertThat(annotation).isNotNull();
    }

    @Test
    @DisplayName("La clase principal tiene la anotación @EnableEurekaServer")
    void applicationClass_hasEnableEurekaServerAnnotation() {
        EnableEurekaServer annotation =
            DiscoveryServerApplication.class.getAnnotation(EnableEurekaServer.class);
        assertThat(annotation).isNotNull();
    }
}
