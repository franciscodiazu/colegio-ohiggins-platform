package com.backend.ms_attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadísticasAsistenciaDto {

    @JsonProperty("estudiante_id")
    private Long estudianteId;

    @JsonProperty("cantidad_presentes")
    private long cantidadPresentes;

    @JsonProperty("cantidad_inasistencias")
    private long cantidadInasistencias;

    @JsonProperty("cantidad_atrasos")
    private long cantidadAtrasos;

    @JsonProperty("cantidad_total")
    private long cantidadTotal;

    @JsonProperty("porcentaje_asistencia")
    private double porcentajeAsistencia;
}

