package com.backend.ms_attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalificacionResponseDto {

    private Long id;

    @JsonProperty("evaluationId")
    private Long evaluationId;

    @JsonProperty("studentId")
    private Long studentId;

    private Double nota;

    private String observacion;

    private LocalDateTime creadoEn;

    private LocalDateTime actualizadoEn;
}
