package com.backend.ms_attendance.service;

import com.backend.ms_attendance.dto.ClaseRequestDto;
import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.model.Clase;
import com.backend.ms_attendance.repository.RepositorioClase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@Transactional
public class ServicioClase {

    private final RepositorioClase repositorio;

    public ServicioClase(RepositorioClase repositorio) {
        this.repositorio = repositorio;
    }

    public List<Clase> listarClases() {
        return repositorio.findAll();
    }

    public Clase crearClase(ClaseRequestDto dto) {
        Clase clase = new Clase();
        clase.setFecha(dto.getFecha());
        clase.setCurso(dto.getCurso());
        clase.setAsignatura(dto.getAsignatura());
        clase.setBloque(dto.getBloque());
        Clase creada = repositorio.save(clase);
        log.info("Clase creada: id={}, curso={}, asignatura={}", creada.getId(), creada.getCurso(), creada.getAsignatura());
        return creada;
    }

    public Clase obtenerClase(Long id) {
        return repositorio.findById(id)
            .orElseThrow(() -> new EntidadNoEncontradaException("Clase no encontrada: " + id));
    }
}
