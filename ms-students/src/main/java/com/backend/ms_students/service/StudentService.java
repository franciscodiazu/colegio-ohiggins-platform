package com.backend.ms_students.service;

import com.backend.ms_students.model.Student;
import com.backend.ms_students.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> updateStudent(Long id, Student studentDetails) {
        return studentRepository.findById(id)
                .map(student -> {
                    student.setRut(studentDetails.getRut());
                    student.setName(studentDetails.getName());
                    student.setGrade(studentDetails.getGrade());
                    return studentRepository.save(student);
                });
    }
}