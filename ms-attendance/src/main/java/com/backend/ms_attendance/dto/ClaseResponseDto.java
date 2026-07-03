package com.backend.ms_attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaseResponseDto {

    private Long id;

    private LocalDate fecha;

    private String curso;

    private String asignatura;

    private String bloque;
}
