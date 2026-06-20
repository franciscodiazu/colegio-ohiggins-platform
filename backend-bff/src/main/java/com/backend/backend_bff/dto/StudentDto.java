package com.backend.backend_bff.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudentDto {
    private Long id;
    private String rut;
    private String name;
    private String grade;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
