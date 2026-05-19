package com.backend.ms_attendance.service;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.dto.EstadísticasAsistenciaDto;
import com.backend.ms_attendance.factory.AsistenciaFactory;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroInasistencia;
import com.backend.ms_attendance.model.RegistroAtraso;
import com.backend.ms_attendance.repository.RepositorioRegistroAsistencia;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional
public class ServicioAsistencia {

    private final Map<String, AsistenciaFactory> mapaFactory;
    private final RepositorioRegistroAsistencia repositorio;
    private final ClienteEstudiantes clienteEstudiantes;

    public ServicioAsistencia(
        Map<String, AsistenciaFactory> mapaFactory,
        RepositorioRegistroAsistencia repositorio,
        ClienteEstudiantes clienteEstudiantes
    ) {
        this.mapaFactory = mapaFactory;
        this.repositorio = repositorio;
        this.clienteEstudiantes = clienteEstudiantes;

        log.info("ServicioAsistencia inicializado con {} factories registradas",
            mapaFactory.size());
        mapaFactory.forEach((clave, factory) ->
            log.debug("  - Factory registrada: {} -> {}", clave, factory.getClass().getSimpleName())
        );
    }

    public RegistroAsistencia crearAsistencia(AsistenciaRequestDto dto) {
        log.info("Solicitado: crear registro {} para estudiante {}",
            dto.getTipoRegistro(), dto.getEstudianteId());

        // BLOQUEANTE 1: Validación de integridad inter-servicio
        // Si el estudiante no existe, se lanza EntidadNoEncontradaException (404)
        // Si el servicio no responde, se lanza ServicioNoDisponibleException (503)
        // La ejecución NO continúa más allá de este punto
        clienteEstudiantes.validarExistenciaEstudiante(dto.getEstudianteId());

        // BLOQUEANTE 2: Validación del DTO para el tipo de registro
        if (!dto.esValidoParaTipo()) {
            log.error("Bloqueante 2 activado: DTO inválido para tipo {}", dto.getTipoRegistro());
            throw new IllegalArgumentException(
                String.format(
                    "AsistenciaRequestDto inválido para tipo %s: %s",
                    dto.getTipoRegistro(), dto
                )
            );
        }

        // BLOQUEANTE 3: Obtener factory para el tipo de registro
        String tipoRegistro = dto.getTipoRegistro().toUpperCase();
        AsistenciaFactory factory = mapaFactory.get(tipoRegistro);

        if (factory == null) {
            log.error("Bloqueante 3 activado: no existe factory para tipo {}", tipoRegistro);
            throw new IllegalArgumentException(
                String.format(
                    "No existe factory registrada para tipo '%s'. " +
                    "Tipos soportados: %s",
                    tipoRegistro, mapaFactory.keySet()
                )
            );
        }

        log.debug("Factory seleccionada: {}", factory.getClass().getSimpleName());

        // FASE 2: Creación del registro (solo si pasaron todos los bloqueantes)
        RegistroAsistencia registro;
        try {
            registro = factory.crearRegistro(dto);
            log.debug("Registro creado por factory: {}", factory.getClass().getSimpleName());
        } catch (IllegalArgumentException e) {
            log.error("Factory {} rechazó el payload: {}",
                factory.getClass().getSimpleName(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado creando registro con factory {}: {}",
                factory.getClass().getSimpleName(), e.getMessage(), e);
            throw new RuntimeException("Error creando registro de asistencia", e);
        }

        // FASE 3: Persistencia (solo si la creación fue exitosa)
        try {
            RegistroAsistencia guardado = repositorio.save(registro);
            log.info("ÉXITO: Registro persistido. ID: {}, Tipo: {}, Estudiante: {}, Fecha: {}",
                guardado.getId(), tipoRegistro, guardado.getEstudianteId(), guardado.getFechaRegistro());
            return guardado;
        } catch (Exception e) {
            log.error("Error CRÍTICO persistiendo registro: {}", e.getMessage(), e);
            throw new RuntimeException("Error guardando registro en base de datos", e);
        }
    }

    public List<RegistroAsistencia> obtenerAsistenciaEstudiante(Long estudianteId) {
        log.debug("Buscando todos los registros para estudiante: {}", estudianteId);
        List<RegistroAsistencia> registros = repositorio.findByEstudianteId(estudianteId);
        log.debug("Encontrados {} registros", registros.size());
        return registros;
    }

    public List<RegistroAsistencia> obtenerAsistenciaEstudianteRangoFechas(
        Long estudianteId,
        LocalDate fechaInicio,
        LocalDate fechaFin
    ) {
        log.debug("Buscando registros para estudiante: {} entre {} y {}",
            estudianteId, fechaInicio, fechaFin);
        return repositorio.findByEstudianteIdAndRangoFechas(estudianteId, fechaInicio, fechaFin);
    }

    public List<RegistroAsistencia> obtenerAsistenciaEstudiantePorFecha(Long estudianteId, LocalDate fecha) {
        log.debug("Buscando registros para estudiante: {} en fecha: {}", estudianteId, fecha);
        return repositorio.findByEstudianteIdAndFechaRegistro(estudianteId, fecha);
    }

    public EstadísticasAsistenciaDto obtenerEstadísticasEstudiante(Long estudianteId) {
        log.debug("Calculando estadísticas para estudiante: {}", estudianteId);

        long cantidadPresentes = repositorio.countPresenteRegistros(estudianteId);
        long cantidadInasistencias = repositorio.countInasistenciaRegistros(estudianteId);
        long cantidadAtrasos = repositorio.countAtrasoRegistros(estudianteId);
        long cantidadTotal = cantidadPresentes + cantidadInasistencias + cantidadAtrasos;

        double porcentajeAsistencia = 0.0;
        if (cantidadTotal > 0) {
            porcentajeAsistencia = (cantidadPresentes * 100.0) / cantidadTotal;
        }

        return EstadísticasAsistenciaDto.builder()
            .estudianteId(estudianteId)
            .cantidadPresentes(cantidadPresentes)
            .cantidadInasistencias(cantidadInasistencias)
            .cantidadAtrasos(cantidadAtrasos)
            .cantidadTotal(cantidadTotal)
            .porcentajeAsistencia(porcentajeAsistencia)
            .build();
    }

    public List<RegistroInasistencia> obtenerInasistenciasJustificadas(Long estudianteId) {
        log.debug("Buscando inasistencias justificadas para estudiante: {}", estudianteId);
        return repositorio.findInasistenciasJustificadasByEstudianteId(estudianteId);
    }

    public List<RegistroAtraso> obtenerAtrasosAboveUmbral(Long estudianteId, Integer umbral) {
        log.debug("Buscando atrasos > {} minutos para estudiante: {}", umbral, estudianteId);
        return repositorio.findAtrasoRegistrosAboveUmbral(estudianteId, umbral);
    }
}

