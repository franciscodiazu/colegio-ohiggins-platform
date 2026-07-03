package com.backend.ms_attendance.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "calificaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluacion_id", nullable = false, foreignKey = @ForeignKey(name = "fk_calificacion_evaluacion"))
    private Evaluacion evaluacion;

    @Column(name = "estudiante_id", nullable = false)
    @JsonIgnore
    private Long estudianteId;

    @Column(nullable = false)
    private Double nota;

    private String observacion;

    private LocalDateTime creadoEn;

    private LocalDateTime actualizadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
        actualizadoEn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        actualizadoEn = LocalDateTime.now();
    }

    @Transient
    @JsonProperty("evaluationId")
    public Long getEvaluacionId() {
        return evaluacion != null ? evaluacion.getId() : null;
    }

    @Transient
    @JsonProperty("studentId")
    public Long getStudentId() {
        return this.estudianteId;
    }
}
