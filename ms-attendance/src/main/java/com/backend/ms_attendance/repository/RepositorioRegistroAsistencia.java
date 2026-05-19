package com.backend.ms_attendance.repository;

import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroPresenteAsistencia;
import com.backend.ms_attendance.model.RegistroInasistencia;
import com.backend.ms_attendance.model.RegistroAtraso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RepositorioRegistroAsistencia extends JpaRepository<RegistroAsistencia, Long> {

    List<RegistroAsistencia> findByEstudianteId(Long estudianteId);

    List<RegistroAsistencia> findByEstudianteIdAndFechaRegistro(Long estudianteId, LocalDate fechaRegistro);

    @Query("SELECT r FROM RegistroAsistencia r WHERE r.estudianteId = :estudianteId " +
           "AND r.fechaRegistro BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY r.fechaRegistro DESC")
    List<RegistroAsistencia> findByEstudianteIdAndRangoFechas(
        @Param("estudianteId") Long estudianteId,
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );

    List<RegistroPresenteAsistencia> findPresenteRegistrosByEstudianteId(Long estudianteId);

    List<RegistroInasistencia> findInasistenciaRegistrosByEstudianteId(Long estudianteId);

    @Query("SELECT r FROM RegistroInasistencia r WHERE r.estudianteId = :estudianteId " +
           "AND r.esJustificada = true")
    List<RegistroInasistencia> findInasistenciasJustificadasByEstudianteId(@Param("estudianteId") Long estudianteId);

    List<RegistroAtraso> findAtrasoRegistrosByEstudianteId(Long estudianteId);

    @Query("SELECT r FROM RegistroAtraso r WHERE r.estudianteId = :estudianteId " +
           "AND r.minutosAtraso > :umbral " +
           "ORDER BY r.minutosAtraso DESC")
    List<RegistroAtraso> findAtrasoRegistrosAboveUmbral(
        @Param("estudianteId") Long estudianteId,
        @Param("umbral") Integer umbral
    );

    @Query("SELECT COUNT(r) FROM RegistroPresenteAsistencia r WHERE r.estudianteId = :estudianteId")
    long countPresenteRegistros(@Param("estudianteId") Long estudianteId);

    @Query("SELECT COUNT(r) FROM RegistroInasistencia r WHERE r.estudianteId = :estudianteId")
    long countInasistenciaRegistros(@Param("estudianteId") Long estudianteId);

    @Query("SELECT COUNT(r) FROM RegistroAtraso r WHERE r.estudianteId = :estudianteId")
    long countAtrasoRegistros(@Param("estudianteId") Long estudianteId);
}

