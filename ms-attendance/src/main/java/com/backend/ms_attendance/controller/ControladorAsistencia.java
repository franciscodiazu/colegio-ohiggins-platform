package com.backend.ms_attendance.controller;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.dto.EstadísticasAsistenciaDto;
import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroInasistencia;
import com.backend.ms_attendance.model.RegistroAtraso;
import com.backend.ms_attendance.service.ServicioAsistencia;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/asistencia")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080", "http://frontend:8080"})
@Tag(name = "Asistencia", description = "APIs para gestión de registros de asistencia de estudiantes")
public class ControladorAsistencia {

    @Autowired
    private ServicioAsistencia servicioAsistencia;

    @PostMapping
    @Operation(
        summary = "Crear nuevo registro de asistencia",
        description = "Crea un nuevo registro de asistencia para un estudiante. Valida la existencia " +
                      "del estudiante en el servicio académico antes de procesar la solicitud. " +
                      "Diferencia entre errores de usuario (404) y errores de infraestructura (503)."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Registro de asistencia creado exitosamente",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RegistroAsistencia.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Estudiante no encontrado en el servicio académico (EntidadNoEncontradaException). " +
                         "Este error ocurre cuando el ID del estudiante solicitado no existe en ms-students. " +
                         "Es un error de negocio (datos de entrada inválidos).",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RespuestaError.class, example =
                    "{\"mensaje\": \"Estudiante con ID 999 no encontrado en el servicio académico.\"}")
            )
        ),
        @ApiResponse(
            responseCode = "503",
            description = "Servicio académico no disponible (ServicioNoDisponibleException). " +
                         "Este error ocurre cuando ms-students está caído, no responde (timeout), " +
                         "o hay problemas de conexión. Es un error de infraestructura. " +
                         "El ALB (Application Load Balancer) detectará este código y activará " +
                         "auto-scaling automáticamente para recuperarse.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RespuestaError.class, example =
                    "{\"mensaje\": \"Validación temporalmente no disponible. Intente nuevamente más tarde.\"}")
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Solicitud inválida. Validación de entrada fallida (DTO inválido o factory no disponible).",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RespuestaError.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Error interno del servidor. Fallo inesperado durante la creación del registro.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RespuestaError.class)
            )
        )
    })
    public ResponseEntity<?> crearAsistencia(@Valid @RequestBody AsistenciaRequestDto dto) {
        log.info("POST /api/v1/asistencia - Crear registro {} para estudiante {}",
            dto.getTipoRegistro(), dto.getEstudianteId());

        try {
            RegistroAsistencia registro = servicioAsistencia.crearAsistencia(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(registro);
        } catch (EntidadNoEncontradaException e) {
            // HTTP 404: El estudiante no existe en ms-students
            log.warn("Estudiante no encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new RespuestaError(e.getMessage()));
        } catch (ServicioNoDisponibleException e) {
            // HTTP 503: ms-students no está disponible (timeout, caído, etc)
            log.error("Servicio académico no disponible: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new RespuestaError(e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Validación fallida: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new RespuestaError(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creando registro: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new RespuestaError("Error creando registro: " + e.getMessage()));
        }
    }

    @GetMapping("/estudiante/{estudianteId}")
    public ResponseEntity<List<RegistroAsistencia>> obtenerAsistenciaEstudiante(
        @PathVariable Long estudianteId
    ) {
        log.info("GET /api/v1/asistencia/estudiante/{} - Obtener registros", estudianteId);

        List<RegistroAsistencia> registros = servicioAsistencia.obtenerAsistenciaEstudiante(estudianteId);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/estudiante/{estudianteId}/rango")
    public ResponseEntity<List<RegistroAsistencia>> obtenerAsistenciaRangoFechas(
        @PathVariable Long estudianteId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin
    ) {
        log.info("GET /api/v1/asistencia/estudiante/{}/rango - {} a {}",
            estudianteId, fechaInicio, fechaFin);

        List<RegistroAsistencia> registros =
            servicioAsistencia.obtenerAsistenciaEstudianteRangoFechas(estudianteId, fechaInicio, fechaFin);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/estudiante/{estudianteId}/fecha")
    public ResponseEntity<List<RegistroAsistencia>> obtenerAsistenciaPorFecha(
        @PathVariable Long estudianteId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        log.info("GET /api/v1/asistencia/estudiante/{}/fecha/{}", estudianteId, fecha);

        List<RegistroAsistencia> registros =
            servicioAsistencia.obtenerAsistenciaEstudiantePorFecha(estudianteId, fecha);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/estudiante/{estudianteId}/estadisticas")
    public ResponseEntity<EstadísticasAsistenciaDto> obtenerEstadísticas(
        @PathVariable Long estudianteId
    ) {
        log.info("GET /api/v1/asistencia/estudiante/{}/estadisticas", estudianteId);

        EstadísticasAsistenciaDto estadisticas = servicioAsistencia.obtenerEstadísticasEstudiante(estudianteId);
        return ResponseEntity.ok(estadisticas);
    }

    @GetMapping("/estudiante/{estudianteId}/inasistencias/justificadas")
    public ResponseEntity<List<RegistroInasistencia>> obtenerInasistenciasJustificadas(
        @PathVariable Long estudianteId
    ) {
        log.info("GET /api/v1/asistencia/estudiante/{}/inasistencias/justificadas", estudianteId);

        List<RegistroInasistencia> registros = servicioAsistencia.obtenerInasistenciasJustificadas(estudianteId);
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/estudiante/{estudianteId}/atrasos")
    public ResponseEntity<List<RegistroAtraso>> obtenerAtrasos(
        @PathVariable Long estudianteId,
        @RequestParam(defaultValue = "15") int umbral
    ) {
        log.info("GET /api/v1/asistencia/estudiante/{}/atrasos?umbral={}",
            estudianteId, umbral);

        List<RegistroAtraso> registros =
            servicioAsistencia.obtenerAtrasosAboveUmbral(estudianteId, umbral);
        return ResponseEntity.ok(registros);
    }

    public static class RespuestaError {
        public String mensaje;

        public RespuestaError(String mensaje) {
            this.mensaje = mensaje;
        }
    }
}

