package com.backend.backend_bff.controller;

import com.backend.backend_bff.dto.StudentDto;
import com.backend.backend_bff.dto.StudentRequestDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final RestTemplate restTemplate;
    private final String studentsServiceUrl;

    public StudentController(
            RestTemplate restTemplate,
            @Value("${services.students.url:http://localhost:8081}") String studentsServiceUrl
    ) {
        this.restTemplate = restTemplate;
        this.studentsServiceUrl = studentsServiceUrl;
    }

    @GetMapping
    public ResponseEntity<List<StudentDto>> listarTodos() {
        String url = studentsServiceUrl + "/api/v1/estudiantes";
        log.info("BFF GET all students from: {}", url);

        try {
            ResponseEntity<List<StudentDto>> response = restTemplate.exchange(
                url, HttpMethod.GET, null,
                new ParameterizedTypeReference<List<StudentDto>>() {}
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Error fetching students from {}: {}", url, e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDto> obtenerPorId(@PathVariable Long id) {
        String url = studentsServiceUrl + "/api/v1/estudiantes/" + id;
        log.info("BFF GET student {} from: {}", id, url);

        try {
            ResponseEntity<StudentDto> response = restTemplate.getForEntity(url, StudentDto.class);
            return ResponseEntity.ok(response.getBody());
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching student {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody StudentRequestDto dto) {
        String url = studentsServiceUrl + "/api/v1/estudiantes";
        log.info("BFF POST create student to: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<StudentRequestDto> request = new HttpEntity<>(dto, headers);
            ResponseEntity<StudentDto> response = restTemplate.postForEntity(url, request, StudentDto.class);
            return ResponseEntity.status(HttpStatus.CREATED).body(response.getBody());
        } catch (Exception e) {
            log.error("Error creating student: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody StudentDto dto) {
        String url = studentsServiceUrl + "/api/v1/estudiantes/" + id;
        log.info("BFF PUT update student {} to: {}", id, url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<StudentDto> request = new HttpEntity<>(dto, headers);
            ResponseEntity<StudentDto> response = restTemplate.exchange(url, HttpMethod.PUT, request, StudentDto.class);
            return ResponseEntity.ok(response.getBody());
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating student {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
