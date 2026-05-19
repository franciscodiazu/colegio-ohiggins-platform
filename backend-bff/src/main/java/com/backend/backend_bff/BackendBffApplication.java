package com.backend.backend_bff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class BackendBffApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendBffApplication.class, args);
	}

}
