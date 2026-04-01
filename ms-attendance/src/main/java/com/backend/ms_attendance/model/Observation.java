package com.backend.ms_attendance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Observation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long studentId;
    private String description; // Texto extenso para anotaciones [cite: 42]
    private String type; // "Positiva" o "Negativa" 
    private LocalDateTime createdAt = LocalDateTime.now();
}