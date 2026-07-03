package com.backend.ms_attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CalificacionRequestDto {

    @NotNull(message = "El ID de la evaluación es obligatorio")
    @JsonProperty("evaluationId")
    private Long evaluacionId;

    @NotNull(message = "El ID del estudiante es obligatorio")
    @JsonProperty("studentId")
    private Long estudianteId;

    @NotNull(message = "La nota es obligatoria")
    @DecimalMin(value = "1.0", message = "La nota debe estar entre 1.0 y 7.0")
    @DecimalMax(value = "7.0", message = "La nota debe estar entre 1.0 y 7.0")
    private Double nota;

    private String observacion;
}
