package com.backend.ms_attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionResponseDto {

    private Long id;
    private String nombre;
    private String curso;
    private LocalDate fecha;
    private Integer ponderacion;
    private String descripcion;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
