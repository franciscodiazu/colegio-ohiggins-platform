package com.backend.ms_attendance.service;

import com.backend.ms_attendance.dto.CalificacionRequestDto;
import com.backend.ms_attendance.dto.EvaluacionRequestDto;
import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.model.Calificacion;
import com.backend.ms_attendance.model.Evaluacion;
import com.backend.ms_attendance.repository.RepositorioCalificacion;
import com.backend.ms_attendance.repository.RepositorioEvaluacion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Slf4j
@Service
public class ServicioEvaluacion {

    private final RepositorioEvaluacion repositorioEvaluacion;
    private final RepositorioCalificacion repositorioCalificacion;

    public ServicioEvaluacion(RepositorioEvaluacion repositorioEvaluacion,
                              RepositorioCalificacion repositorioCalificacion) {
        this.repositorioEvaluacion = repositorioEvaluacion;
        this.repositorioCalificacion = repositorioCalificacion;
    }

    public List<Evaluacion> listarEvaluaciones() {
        return repositorioEvaluacion.findAll();
    }

    public Evaluacion crearEvaluacion(EvaluacionRequestDto dto) {
        Evaluacion evaluacion = new Evaluacion();
        evaluacion.setNombre(dto.getNombre().trim());
        evaluacion.setCurso(dto.getCurso().trim());
        evaluacion.setFecha(dto.getFecha());
        evaluacion.setPonderacion(dto.getPonderacion());
        evaluacion.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : "");
        return repositorioEvaluacion.save(evaluacion);
    }

    public Evaluacion obtenerEvaluacion(Long id) {
        return repositorioEvaluacion.findById(id)
            .orElseThrow(() -> new EntidadNoEncontradaException("Evaluación no encontrada: " + id));
    }

    public Evaluacion actualizarEvaluacion(Long id, EvaluacionRequestDto dto) {
        Evaluacion evaluacion = obtenerEvaluacion(id);
        evaluacion.setNombre(dto.getNombre().trim());
        evaluacion.setCurso(dto.getCurso().trim());
        evaluacion.setFecha(dto.getFecha());
        evaluacion.setPonderacion(dto.getPonderacion());
        evaluacion.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : "");
        return repositorioEvaluacion.save(evaluacion);
    }

    public List<Evaluacion> listarEvaluacionesPorCurso(String curso) {
        return repositorioEvaluacion.findByCurso(curso);
    }

    public List<Calificacion> listarCalificaciones() {
        return repositorioCalificacion.findAll();
    }

    public Calificacion crearCalificacion(CalificacionRequestDto dto) {
        Evaluacion evaluacion = repositorioEvaluacion.findById(dto.getEvaluacionId())
            .orElseThrow(() -> new EntidadNoEncontradaException("Evaluación no encontrada: " + dto.getEvaluacionId()));

        Calificacion calificacion = new Calificacion();
        calificacion.setEvaluacion(evaluacion);
        calificacion.setEstudianteId(dto.getEstudianteId());
        calificacion.setNota(dto.getNota());
        calificacion.setObservacion(dto.getObservacion() != null ? dto.getObservacion().trim() : "");
        return repositorioCalificacion.save(calificacion);
    }

    public List<Calificacion> listarCalificacionesPorEstudiante(Long estudianteId) {
        return repositorioCalificacion.findByEstudianteId(estudianteId);
    }

    public List<Calificacion> listarCalificacionesPorEvaluacion(Long evaluacionId) {
        return repositorioCalificacion.findByEvaluacion_Id(evaluacionId);
    }
}
