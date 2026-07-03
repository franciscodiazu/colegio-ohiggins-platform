package com.backend.ms_attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ClaseRequestDto {

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotBlank(message = "El curso es obligatorio")
    private String curso;

    @NotBlank(message = "La asignatura es obligatoria")
    private String asignatura;

    private String bloque;
}
