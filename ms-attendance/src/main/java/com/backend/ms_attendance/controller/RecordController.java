package com.backend.ms_attendance.controller;

import com.backend.ms_attendance.model.Attendance;
import com.backend.ms_attendance.model.Observation;
import com.backend.ms_attendance.repository.AttendanceRepository;
import com.backend.ms_attendance.repository.ObservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance") // Coincide con la ruta del BFF
public class RecordController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ObservationRepository observationRepository;

    @PostMapping("/mark")
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @PostMapping("/observation")
    public Observation addObservation(@RequestBody Observation observation) {
        return observationRepository.save(observation);
    }

    @GetMapping("/student/{studentId}")
    public List<Observation> getStudentObservations(@PathVariable Long studentId) {
        return observationRepository.findByStudentId(studentId);
    }
}