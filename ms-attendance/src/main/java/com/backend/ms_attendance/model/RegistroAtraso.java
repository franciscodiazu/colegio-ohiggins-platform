package com.backend.ms_attendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Entity
@DiscriminatorValue("ATRASO")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class RegistroAtraso extends RegistroAsistencia {

    @Column(nullable = true)
    private LocalTime horaLlegada;

    @Column(nullable = true)
    private LocalTime horaEsperada;

    @Column(name = "minutos_atraso", nullable = true)
    private Integer minutosAtraso;

    public RegistroAtraso(Long estudianteId, java.time.LocalDate fechaRegistro,
                          LocalTime horaLlegada, LocalTime horaEsperada) {
        this.setEstudianteId(estudianteId);
        this.setFechaRegistro(fechaRegistro);
        this.horaLlegada = horaLlegada;
        this.horaEsperada = horaEsperada;
        this.calcularMinutosAtraso();
    }

    @Override
    public String obtenerEstado() {
        return "ATRASO";
    }

    @Override
    public boolean esValido() {
        boolean baseValido = this.getEstudianteId() != null &&
                            this.getFechaRegistro() != null &&
                            this.horaLlegada != null &&
                            this.horaEsperada != null;

        if (!baseValido) {
            return false;
        }

        if (!this.horaLlegada.isAfter(this.horaEsperada)) {
            return false;
        }

        if (this.minutosAtraso != null) {
            long minutosCalculados = java.time.temporal.ChronoUnit.MINUTES
                .between(this.horaEsperada, this.horaLlegada);
            if (this.minutosAtraso != minutosCalculados) {
                return false;
            }
        }

        return true;
    }

    public void calcularMinutosAtraso() {
        if (this.horaLlegada != null && this.horaEsperada != null) {
            this.minutosAtraso = Math.toIntExact(java.time.temporal.ChronoUnit.MINUTES
                .between(this.horaEsperada, this.horaLlegada));
        }
    }
}

