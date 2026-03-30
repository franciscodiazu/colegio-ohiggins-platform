package com.backend.ms_attendance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long studentId; // Relación lógica con ms-students
    private LocalDate date;
    private boolean present;
}