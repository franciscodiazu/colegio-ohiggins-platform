package com.backend.ms_students.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponseDto {

    private Long id;
    private String rut;
    private String name;
    private String grade;
    private String email;
    private String phone;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
