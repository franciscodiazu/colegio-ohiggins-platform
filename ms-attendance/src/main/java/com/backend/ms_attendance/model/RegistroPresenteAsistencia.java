package com.backend.ms_attendance.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("PRESENTE")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class RegistroPresenteAsistencia extends RegistroAsistencia {

    public RegistroPresenteAsistencia(Long estudianteId, java.time.LocalDate fechaRegistro) {
        this.setEstudianteId(estudianteId);
        this.setFechaRegistro(fechaRegistro);
    }

    @Override
    public String obtenerEstado() {
        return "PRESENTE";
    }

    @Override
    public boolean esValido() {
        return this.getEstudianteId() != null &&
               this.getFechaRegistro() != null;
    }
}

