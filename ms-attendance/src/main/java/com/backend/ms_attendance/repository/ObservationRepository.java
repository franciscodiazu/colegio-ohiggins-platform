package com.backend.ms_attendance.repository;

import com.backend.ms_attendance.model.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ObservationRepository extends JpaRepository<Observation, Long> {
    List<Observation> findByStudentId(Long studentId);
}