package com.backend.ms_attendance.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "registro_asistencia")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(
    name = "tipo_registro",
    discriminatorType = DiscriminatorType.STRING,
    length = 20
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class RegistroAsistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @Column(nullable = false)
    private Long estudianteId;

    @JsonIgnore
    @Column(nullable = true)
    private Long claseId;

    @Column(nullable = false)
    private LocalDate fechaRegistro;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    private LocalDateTime actualizadoEn;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @PrePersist
    protected void onCreate() {
        this.creadoEn = LocalDateTime.now();
        this.actualizadoEn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.actualizadoEn = LocalDateTime.now();
    }

    public abstract String obtenerEstado();

    public abstract boolean esValido();

    @Transient
    @JsonProperty("classId")
    public Long getClassId() {
        return this.claseId;
    }

    @Transient
    @JsonProperty("studentId")
    public Long getStudentId() {
        return this.estudianteId;
    }

    @Transient
    @JsonProperty("estado")
    public String getEstadoSerializado() {
        return obtenerEstado();
    }
}

