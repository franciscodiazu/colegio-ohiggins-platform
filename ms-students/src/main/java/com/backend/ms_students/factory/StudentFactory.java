package com.backend.ms_students.factory;

import com.backend.ms_students.dto.StudentRequestDto;
import com.backend.ms_students.model.Student;

public interface StudentFactory {
    Student crearEstudiante(StudentRequestDto dto);
}