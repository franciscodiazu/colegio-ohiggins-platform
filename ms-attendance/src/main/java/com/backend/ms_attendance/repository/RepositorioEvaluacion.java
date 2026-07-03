package com.backend.ms_attendance.repository;

import com.backend.ms_attendance.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RepositorioEvaluacion extends JpaRepository<Evaluacion, Long> {
    List<Evaluacion> findByCurso(String curso);
}
