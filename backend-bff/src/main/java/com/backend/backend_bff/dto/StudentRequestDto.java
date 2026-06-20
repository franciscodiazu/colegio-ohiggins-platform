package com.backend.backend_bff.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StudentRequestDto {
    @JsonProperty("rut_estudiante")
    private String rut;

    @JsonProperty("nombre_completo")
    private String name;

    @JsonProperty("grado_academico")
    private String grade;
}
