package cl.colegioohiggins.admin;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "spring.boot.admin.discovery.enabled=false"
})
class AdminServerApplicationTests {

    @Test
    void contextLoads() {
    }
}
