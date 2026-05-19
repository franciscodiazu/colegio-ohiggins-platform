package com.backend.ms_attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsistenciaRequestDto {

    @NotNull(message = "estudianteId es obligatorio")
    @JsonProperty("estudiante_id")
    private Long estudianteId;

    @NotNull(message = "fechaRegistro es obligatorio")
    @JsonProperty("fecha_registro")
    private LocalDate fechaRegistro;

    @NotNull(message = "tipoRegistro es obligatorio")
    @JsonProperty("tipo_registro")
    private String tipoRegistro;

    @JsonProperty("es_justificada")
    private Boolean esJustificada;

    @JsonProperty("razon_justificacion")
    private String razonJustificacion;

    @JsonProperty("hora_llegada")
    private LocalTime horaLlegada;

    @JsonProperty("hora_esperada")
    private LocalTime horaEsperada;

    @JsonProperty("notas")
    private String notas;

    public boolean esValidoParaTipo() {
        if (this.tipoRegistro == null) {
            return false;
        }

        switch (this.tipoRegistro.toUpperCase()) {
            case "PRESENTE":
                return this.estudianteId != null && this.fechaRegistro != null;

            case "INASISTENCIA":
                return this.estudianteId != null && this.fechaRegistro != null;

            case "ATRASO":
                return this.estudianteId != null &&
                       this.fechaRegistro != null &&
                       this.horaLlegada != null;

            default:
                return false;
        }
    }
}

