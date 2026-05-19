package com.backend.ms_attendance.service;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.dto.EstadísticasAsistenciaDto;
import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import com.backend.ms_attendance.factory.AsistenciaFactory;
import com.backend.ms_attendance.factory.AtrasoFactory;
import com.backend.ms_attendance.factory.InasistenciaFactory;
import com.backend.ms_attendance.factory.PresenteFactory;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroAtraso;
import com.backend.ms_attendance.model.RegistroInasistencia;
import com.backend.ms_attendance.model.RegistroPresenteAsistencia;
import com.backend.ms_attendance.repository.RepositorioRegistroAsistencia;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ServicioAsistencia - Tests de Lógica de Negocio")
public class ServicioAsistenciaTest {

    @Mock
    private RepositorioRegistroAsistencia repositorio;
    @Mock
    private ClienteEstudiantes clienteEstudiantes;

    private Map<String, AsistenciaFactory> mapaFactory;
    private ServicioAsistencia servicioAsistencia;

    @BeforeEach
    void setUp() {
        mapaFactory = new HashMap<>();
        mapaFactory.put("PRESENTE", new PresenteFactory());
        mapaFactory.put("ATRASO", new AtrasoFactory());
        mapaFactory.put("INASISTENCIA", new InasistenciaFactory());

        // Se necesita reinicializar servicioAsistencia para inyectar el mapaFactory mockeado
        servicioAsistencia = new ServicioAsistencia(mapaFactory, repositorio, clienteEstudiantes);
    }

    // --- Tests para crearAsistencia ---

    @Test
    @DisplayName("Debe crear un registro de asistencia PRESENTE exitosamente")
    void debeCrearAsistenciaPresenteExitosamente() {
        // Arrange
        Long estudianteId = 1L;
        LocalDate fecha = LocalDate.now();
        AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
            .estudianteId(estudianteId)
            .fechaRegistro(fecha)
            .tipoRegistro("PRESENTE")
            .build();

        RegistroPresenteAsistencia registroGuardado = new RegistroPresenteAsistencia();
        registroGuardado.setId(1L);
        registroGuardado.setEstudianteId(estudianteId);
        registroGuardado.setFechaRegistro(fecha);

        doNothing().when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);
        when(repositorio.save(any(RegistroAsistencia.class))).thenReturn(registroGuardado);

        // Act
        RegistroAsistencia resultado = servicioAsistencia.crearAsistencia(dto);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(1L);
        assertThat(resultado.getEstudianteId()).isEqualTo(estudianteId);
        assertThat(resultado.getFechaRegistro()).isEqualTo(fecha);
        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
        verify(repositorio, times(1)).save(any(RegistroAsistencia.class));
    }

    @Test
    @DisplayName("Debe crear un registro de asistencia ATRASO exitosamente")
    void debeCrearAsistenciaAtrasoExitosamente() {
        // Arrange
        Long estudianteId = 2L;
        LocalDate fecha = LocalDate.now();
        LocalTime horaLlegada = LocalTime.of(8, 30);
        LocalTime horaEsperada = LocalTime.of(8, 0);
        AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
            .estudianteId(estudianteId)
            .fechaRegistro(fecha)
            .tipoRegistro("ATRASO")
            .horaLlegada(horaLlegada)
            .horaEsperada(horaEsperada)
            .build();

        RegistroAtraso registroGuardado = new RegistroAtraso();
        registroGuardado.setId(2L);
        registroGuardado.setEstudianteId(estudianteId);
        registroGuardado.setFechaRegistro(fecha);
        registroGuardado.setHoraLlegada(horaLlegada);
        registroGuardado.setHoraEsperada(horaEsperada);

        doNothing().when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);
        when(repositorio.save(any(RegistroAsistencia.class))).thenReturn(registroGuardado);

        // Act
        RegistroAsistencia resultado = servicioAsistencia.crearAsistencia(dto);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(2L);
        assertThat(resultado.getEstudianteId()).isEqualTo(estudianteId);
        assertThat(resultado.getFechaRegistro()).isEqualTo(fecha);
        assertThat(((RegistroAtraso) resultado).getHoraLlegada()).isEqualTo(horaLlegada);
        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
        verify(repositorio, times(1)).save(any(RegistroAsistencia.class));
    }

    @Test
    @DisplayName("Debe crear un registro de asistencia INASISTENCIA exitosamente")
    void debeCrearAsistenciaInasistenciaExitosamente() {
        // Arrange
        Long estudianteId = 3L;
        LocalDate fecha = LocalDate.now();
        AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
            .estudianteId(estudianteId)
            .fechaRegistro(fecha)
            .tipoRegistro("INASISTENCIA")
            .esJustificada(true)
            .razonJustificacion("Enfermedad")
            .build();

        RegistroInasistencia registroGuardado = new RegistroInasistencia();
        registroGuardado.setId(3L);
        registroGuardado.setEstudianteId(estudianteId);
        registroGuardado.setFechaRegistro(fecha);
        registroGuardado.setEsJustificada(true);
        registroGuardado.setRazonJustificacion("Enfermedad");

        doNothing().when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);
        when(repositorio.save(any(RegistroAsistencia.class))).thenReturn(registroGuardado);

        // Act
        RegistroAsistencia resultado = servicioAsistencia.crearAsistencia(dto);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(3L);
        assertThat(resultado.getEstudianteId()).isEqualTo(estudianteId);
        assertThat(resultado.getFechaRegistro()).isEqualTo(fecha);
        assertThat(((RegistroInasistencia) resultado).getEsJustificada()).isTrue();
        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
        verify(repositorio, times(1)).save(any(RegistroAsistencia.class));
    }

    @Test
    @DisplayName("Debe lanzar EntidadNoEncontradaException si el estudiante no existe")
    void debeLanzarExcepcionSiEstudianteNoExiste() {
        // Arrange
        Long estudianteId = 99L;
        AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
            .estudianteId(estudianteId)
            .fechaRegistro(LocalDate.now())
            .tipoRegistro("PRESENTE")
            .build();

        doThrow(new EntidadNoEncontradaException("Estudiante no encontrado"))
            .when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);

        // Act & Assert
        assertThrows(EntidadNoEncontradaException.class, () ->
            servicioAsistencia.crearAsistencia(dto)
        );
        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
        verify(repositorio, never()).save(any(RegistroAsistencia.class));
    }

    @Test
    @DisplayName("Debe lanzar ServicioNoDisponibleException si el servicio de estudiantes no está disponible")
    void debeLanzarExcepcionSiServicioEstudiantesNoDisponible() {
        // Arrange
        Long estudianteId = 100L;
        AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
            .estudianteId(estudianteId)
            .fechaRegistro(LocalDate.now())
            .tipoRegistro("PRESENTE")
            .build();

        doThrow(new ServicioNoDisponibleException("Servicio de estudiantes caído"))
            .when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);

        // Act & Assert
        assertThrows(ServicioNoDisponibleException.class, () ->
            servicioAsistencia.crearAsistencia(dto)
        );
        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
        verify(repositorio, never()).save(any(RegistroAsistencia.class));
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException si el DTO es inválido para el tipo de registro")
    void debeLanzarExcepcionSiDtoInvalidoParaTipo() {
        // Arrange
        Long estudianteId = 1L;
        // DTO de ATRASO sin horaLlegada, lo cual lo hace inválido
        AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
            .estudianteId(estudianteId)
            .fechaRegistro(LocalDate.now())
            .tipoRegistro("ATRASO")
            .build();

        doNothing().when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);

        // Act & Assert
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () ->
            servicioAsistencia.crearAsistencia(dto)
        );
        assertThat(thrown.getMessage()).contains("AsistenciaRequestDto inválido para tipo ATRASO");
        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
        verify(repositorio, never()).save(any(RegistroAsistencia.class));
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException si no existe factory para el tipo de registro")
    void debeLanzarExcepcionSiNoExisteFactory() {
        // Arrange
        Long estudianteId = 1L;
        AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
            .estudianteId(estudianteId)
            .fechaRegistro(LocalDate.now())
            .tipoRegistro("TIPO_INEXISTENTE")
            .build();

        doNothing().when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);

        // Act & Assert
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () ->
            servicioAsistencia.crearAsistencia(dto)
        );
        assertThat(thrown.getMessage()).contains("AsistenciaRequestDto inválido para tipo TIPO_INEXISTENTE");
        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
        verify(repositorio, never()).save(any(RegistroAsistencia.class));
    }

    @Test
    @DisplayName("Debe lanzar RuntimeException si falla la persistencia")
    void debeLanzarRuntimeExceptionSiFallaPersistencia() {
        // Arrange
        Long estudianteId = 1L;
        LocalDate fecha = LocalDate.now();
        AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
            .estudianteId(estudianteId)
            .fechaRegistro(fecha)
            .tipoRegistro("PRESENTE")
            .build();

        doNothing().when(clienteEstudiantes).validarExistenciaEstudiante(estudianteId);
        when(repositorio.save(any(RegistroAsistencia.class))).thenThrow(new RuntimeException("Error de DB"));

        // Act & Assert
        RuntimeException thrown = assertThrows(RuntimeException.class, () ->
            servicioAsistencia.crearAsistencia(dto)
        );
        assertThat(thrown.getMessage()).contains("Error guardando registro en base de datos");
        verify(clienteEstudiantes, times(1)).validarExistenciaEstudiante(estudianteId);
        verify(repositorio, times(1)).save(any(RegistroAsistencia.class));
    }

    // --- Tests para obtenerAsistenciaEstudiante ---

    @Test
    @DisplayName("Debe retornar lista vacía si no hay registros para el estudiante")
    void debeRetornarListaVaciaSiNoHayRegistros() {
        // Arrange
        Long estudianteId = 4L;
        when(repositorio.findByEstudianteId(estudianteId)).thenReturn(Collections.emptyList());

        // Act
        List<RegistroAsistencia> resultados = servicioAsistencia.obtenerAsistenciaEstudiante(estudianteId);

        // Assert
        assertThat(resultados).isNotNull().isEmpty();
        verify(repositorio, times(1)).findByEstudianteId(estudianteId);
    }

    @Test
    @DisplayName("Debe retornar registros de asistencia para un estudiante")
    void debeRetornarRegistrosParaEstudiante() {
        // Arrange
        Long estudianteId = 5L;
        RegistroPresenteAsistencia r1 = new RegistroPresenteAsistencia();
        r1.setId(1L); r1.setEstudianteId(estudianteId); r1.setFechaRegistro(LocalDate.now());
        RegistroAtraso r2 = new RegistroAtraso();
        r2.setId(2L); r2.setEstudianteId(estudianteId); r2.setFechaRegistro(LocalDate.now().minusDays(1));
        List<RegistroAsistencia> registros = List.of(r1, r2);

        when(repositorio.findByEstudianteId(estudianteId)).thenReturn(registros);

        // Act
        List<RegistroAsistencia> resultados = servicioAsistencia.obtenerAsistenciaEstudiante(estudianteId);

        // Assert
        assertThat(resultados).isNotNull().hasSize(2);
        assertThat(resultados.get(0).getEstudianteId()).isEqualTo(estudianteId);
        verify(repositorio, times(1)).findByEstudianteId(estudianteId);
    }

    // --- Tests para obtenerEstadísticasEstudiante ---

    @Test
    @DisplayName("Debe calcular estadísticas correctamente para un estudiante")
    void debeCalcularEstadisticasCorrectamente() {
        // Arrange
        Long estudianteId = 6L;
        when(repositorio.countPresenteRegistros(estudianteId)).thenReturn(10L);
        when(repositorio.countInasistenciaRegistros(estudianteId)).thenReturn(2L);
        when(repositorio.countAtrasoRegistros(estudianteId)).thenReturn(3L);

        // Act
        EstadísticasAsistenciaDto estadisticas = servicioAsistencia.obtenerEstadísticasEstudiante(estudianteId);

        // Assert
        assertThat(estadisticas).isNotNull();
        assertThat(estadisticas.getEstudianteId()).isEqualTo(estudianteId);
        assertThat(estadisticas.getCantidadPresentes()).isEqualTo(10L);
        assertThat(estadisticas.getCantidadInasistencias()).isEqualTo(2L);
        assertThat(estadisticas.getCantidadAtrasos()).isEqualTo(3L);
        assertThat(estadisticas.getCantidadTotal()).isEqualTo(15L);
        assertThat(estadisticas.getPorcentajeAsistencia()).isCloseTo((10.0 / 15.0) * 100.0, org.assertj.core.api.Assertions.within(0.0001));
        verify(repositorio, times(1)).countPresenteRegistros(estudianteId);
        verify(repositorio, times(1)).countInasistenciaRegistros(estudianteId);
        verify(repositorio, times(1)).countAtrasoRegistros(estudianteId);
    }

    @Test
    @DisplayName("Debe calcular estadísticas con 0% de asistencia si no hay registros")
    void debeCalcularEstadisticasConCeroPorCiento() {
        // Arrange
        Long estudianteId = 7L;
        when(repositorio.countPresenteRegistros(estudianteId)).thenReturn(0L);
        when(repositorio.countInasistenciaRegistros(estudianteId)).thenReturn(0L);
        when(repositorio.countAtrasoRegistros(estudianteId)).thenReturn(0L);

        // Act
        EstadísticasAsistenciaDto estadisticas = servicioAsistencia.obtenerEstadísticasEstudiante(estudianteId);

        // Assert
        assertThat(estadisticas).isNotNull();
        assertThat(estadisticas.getEstudianteId()).isEqualTo(estudianteId);
        assertThat(estadisticas.getCantidadPresentes()).isEqualTo(0L);
        assertThat(estadisticas.getCantidadInasistencias()).isEqualTo(0L);
        assertThat(estadisticas.getCantidadAtrasos()).isEqualTo(0L);
        assertThat(estadisticas.getCantidadTotal()).isEqualTo(0L);
        assertThat(estadisticas.getPorcentajeAsistencia()).isEqualTo(0.0);
    }

    // --- Tests para obtenerAsistenciaEstudianteRangoFechas ---

    @Test
    @DisplayName("Debe retornar registros en rango de fechas")
    void debeRetornarRegistrosEnRangoFechas() {
        // Arrange
        Long estudianteId = 8L;
        LocalDate fechaInicio = LocalDate.now().minusDays(7);
        LocalDate fechaFin = LocalDate.now();
        RegistroPresenteAsistencia r1 = new RegistroPresenteAsistencia();
        r1.setId(1L); r1.setEstudianteId(estudianteId); r1.setFechaRegistro(fechaInicio.plusDays(1));
        List<RegistroAsistencia> registros = List.of(r1);

        when(repositorio.findByEstudianteIdAndRangoFechas(estudianteId, fechaInicio, fechaFin))
            .thenReturn(registros);

        // Act
        List<RegistroAsistencia> resultados = servicioAsistencia.obtenerAsistenciaEstudianteRangoFechas(
            estudianteId, fechaInicio, fechaFin
        );

        // Assert
        assertThat(resultados).isNotNull().hasSize(1);
        verify(repositorio, times(1)).findByEstudianteIdAndRangoFechas(estudianteId, fechaInicio, fechaFin);
    }

    // --- Tests para obtenerAsistenciaEstudiantePorFecha ---

    @Test
    @DisplayName("Debe retornar registros por fecha específica")
    void debeRetornarRegistrosPorFecha() {
        // Arrange
        Long estudianteId = 9L;
        LocalDate fecha = LocalDate.now();
        RegistroPresenteAsistencia r1 = new RegistroPresenteAsistencia();
        r1.setId(1L); r1.setEstudianteId(estudianteId); r1.setFechaRegistro(fecha);
        List<RegistroAsistencia> registros = List.of(r1);

        when(repositorio.findByEstudianteIdAndFechaRegistro(estudianteId, fecha)).thenReturn(registros);

        // Act
        List<RegistroAsistencia> resultados = servicioAsistencia.obtenerAsistenciaEstudiantePorFecha(estudianteId, fecha);

        // Assert
        assertThat(resultados).isNotNull().hasSize(1);
        verify(repositorio, times(1)).findByEstudianteIdAndFechaRegistro(estudianteId, fecha);
    }

    // --- Tests para obtenerInasistenciasJustificadas ---

    @Test
    @DisplayName("Debe retornar inasistencias justificadas")
    void debeRetornarInasistenciasJustificadas() {
        // Arrange
        Long estudianteId = 10L;
        RegistroInasistencia r1 = new RegistroInasistencia();
        r1.setId(1L); r1.setEstudianteId(estudianteId); r1.setEsJustificada(true);
        List<RegistroInasistencia> registros = List.of(r1);

        when(repositorio.findInasistenciasJustificadasByEstudianteId(estudianteId)).thenReturn(registros);

        // Act
        List<RegistroInasistencia> resultados = servicioAsistencia.obtenerInasistenciasJustificadas(estudianteId);

        // Assert
        assertThat(resultados).isNotNull().hasSize(1);
        assertThat(resultados.get(0).getEsJustificada()).isTrue();
        verify(repositorio, times(1)).findInasistenciasJustificadasByEstudianteId(estudianteId);
    }

    // --- Tests para obtenerAtrasosAboveUmbral ---

    @Test
    @DisplayName("Debe retornar atrasos above umbral")
    void debeRetornarAtrasosAboveUmbral() {
        // Arrange
        Long estudianteId = 11L;
        Integer umbral = 30;
        RegistroAtraso r1 = new RegistroAtraso();
        r1.setId(1L); r1.setEstudianteId(estudianteId); r1.setMinutosAtraso(45);
        List<RegistroAtraso> registros = List.of(r1);

        when(repositorio.findAtrasoRegistrosAboveUmbral(estudianteId, umbral)).thenReturn(registros);

        // Act
        List<RegistroAtraso> resultados = servicioAsistencia.obtenerAtrasosAboveUmbral(estudianteId, umbral);

        // Assert
        assertThat(resultados).isNotNull().hasSize(1);
        assertThat(resultados.get(0).getMinutosAtraso()).isGreaterThan(umbral);
        verify(repositorio, times(1)).findAtrasoRegistrosAboveUmbral(estudianteId, umbral);
    }
}
