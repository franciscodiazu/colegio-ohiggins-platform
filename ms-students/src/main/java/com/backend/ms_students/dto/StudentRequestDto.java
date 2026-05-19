package com.backend.ms_students.dto;

import com.backend.ms_students.dto.validations.ValidRut;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudentRequestDto {

    @NotBlank(message = "El RUT es obligatorio")
    @ValidRut 
    @JsonProperty("rut_estudiante")
    private String rut;

    @NotBlank(message = "El nombre es obligatorio")
    @JsonProperty("nombre_completo")
    private String name;

    @NotBlank(message = "El grado es obligatorio")
    @JsonProperty("grado_academico")
    private String grade;
}