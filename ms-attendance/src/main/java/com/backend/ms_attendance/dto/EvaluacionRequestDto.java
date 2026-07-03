package com.backend.ms_attendance.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class EvaluacionRequestDto {

    @NotBlank(message = "El nombre de la evaluación es obligatorio")
    private String nombre;

    @NotBlank(message = "El curso es obligatorio")
    private String curso;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La ponderación es obligatoria")
    @Min(value = 1, message = "La ponderación debe estar entre 1 y 100")
    @Max(value = 100, message = "La ponderación debe estar entre 1 y 100")
    private Integer ponderacion;

    private String descripcion;
}
