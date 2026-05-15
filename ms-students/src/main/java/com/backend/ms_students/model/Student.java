package com.backend.ms_students.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String rut;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String grade;

    @Column(updatable = false)
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;

    @PrePersist
    protected void onCreate() { this.creadoEn = LocalDateTime.now(); this.actualizadoEn = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { this.actualizadoEn = LocalDateTime.now(); }
}