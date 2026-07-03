package com.backend.ms_students.factory;

import com.backend.ms_students.dto.StudentRequestDto;
import com.backend.ms_students.model.Student;
import org.springframework.stereotype.Component;

@Component("REGULAR")
public class StudentRegularFactory implements StudentFactory {
    @Override
    public Student crearEstudiante(StudentRequestDto dto) {
        Student student = new Student();
        student.setRut(dto.getRut());
        student.setName(dto.getName());
        student.setGrade(dto.getGrade());
        student.setEmail(dto.getEmail());
        student.setPhone(dto.getPhone());
        return student;
    }
}