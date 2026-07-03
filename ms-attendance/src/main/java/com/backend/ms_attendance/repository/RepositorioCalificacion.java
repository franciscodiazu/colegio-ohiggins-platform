package com.backend.ms_attendance.repository;

import com.backend.ms_attendance.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RepositorioCalificacion extends JpaRepository<Calificacion, Long> {
    List<Calificacion> findByEvaluacion_Id(Long evaluacionId);
    List<Calificacion> findByEstudianteId(Long estudianteId);
    boolean existsByEvaluacion_IdAndEstudianteId(Long evaluacionId, Long estudianteId);
}
