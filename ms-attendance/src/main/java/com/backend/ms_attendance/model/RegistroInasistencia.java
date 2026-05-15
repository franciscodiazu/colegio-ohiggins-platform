package com.backend.ms_attendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("INASISTENCIA")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class RegistroInasistencia extends RegistroAsistencia {

    @Column(nullable = true, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean esJustificada;

    @Column(nullable = true, columnDefinition = "VARCHAR(255)")
    private String razonJustificacion;

    public RegistroInasistencia(Long estudianteId, java.time.LocalDate fechaRegistro,
                                Boolean esJustificada, String razonJustificacion) {
        this.setEstudianteId(estudianteId);
        this.setFechaRegistro(fechaRegistro);
        this.esJustificada = esJustificada != null ? esJustificada : false;
        this.razonJustificacion = razonJustificacion;
    }

    @Override
    public String obtenerEstado() {
        return (esJustificada != null && esJustificada) ? "INASISTENCIA_JUSTIFICADA" : "INASISTENCIA";
    }

    @Override
    public boolean esValido() {
        return this.getEstudianteId() != null &&
               this.getFechaRegistro() != null;
    }
}

