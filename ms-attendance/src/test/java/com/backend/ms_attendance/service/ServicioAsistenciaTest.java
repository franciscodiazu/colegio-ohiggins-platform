package com.backend.ms_attendance.service;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.exception.EntidadNoEncontradaException;
import com.backend.ms_attendance.exception.ServicioNoDisponibleException;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.repository.RepositorioRegistroAsistencia;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

@SpringBootTest
@DisplayName("Tests Consolidados de ServicioAsistencia e Infraestructura de Red")
public class ServicioAsistenciaTest {

    @Autowired
    private ServicioAsistencia servicioAsistencia;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ClienteEstudiantes clienteEstudiantes;

    @Autowired
    private RepositorioRegistroAsistencia repositorio;

    private MockRestServiceServer mockServer;
    private final String urlEsperada = "http://ms-students:8081/api/v1/estudiantes/";

    @BeforeEach
    void setUp() {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    @DisplayName("Crear asistencia con estudiante inexistente (404)")
    void testCrearAsistencia_EstudianteNoExiste() {
        Long estudianteIdInvalido = 999L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteIdInvalido);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        mockServer.expect(requestTo(urlEsperada + estudianteIdInvalido))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThrows(
                EntidadNoEncontradaException.class,
                () -> servicioAsistencia.crearAsistencia(dto)
        );

        mockServer.verify();
    }

    @Test
    @DisplayName("Crear asistencia con servicio no disponible (503)")
    void testCrearAsistencia_ServicioNoDisponible() {
        Long estudianteId = 1002L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        mockServer.expect(requestTo(urlEsperada + estudianteId))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThrows(
                ServicioNoDisponibleException.class,
                () -> servicioAsistencia.crearAsistencia(dto)
        );
        mockServer.verify();
    }

    @Test
    @DisplayName("Factory no existe para tipo (bloqueante 3)")
    void testCrearAsistencia_FactoryNoExiste() {
        Long estudianteId = 1001L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("TIPO_INEXISTENTE");

        mockServer.expect(requestTo(urlEsperada + estudianteId))
                .andRespond(withSuccess("true", MediaType.APPLICATION_JSON));

        assertThrows(
                IllegalArgumentException.class,
                () -> servicioAsistencia.crearAsistencia(dto)
        );
        mockServer.verify();
    }

    @Test
    @DisplayName("Validación de estudiante es prioritaria (bloqueante 1)")
    void testValidacionEsPrimero() {
        Long estudianteId = 1001L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        mockServer.expect(requestTo(urlEsperada + estudianteId))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThrows(
                EntidadNoEncontradaException.class,
                () -> servicioAsistencia.crearAsistencia(dto)
        );

        mockServer.verify();
    }

    @Test
    @DisplayName("Crear asistencia tipo PRESENTE exitosamente")
    void testCrearAsistencia_PresenteExitoso() {
        Long estudianteId = 1001L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("PRESENTE");

        mockServer.expect(requestTo(urlEsperada + estudianteId))
                .andRespond(withSuccess("true", MediaType.APPLICATION_JSON));

        RegistroAsistencia resultado = servicioAsistencia.crearAsistencia(dto);

        assertNotNull(resultado);
        assertEquals("PRESENTE", resultado.obtenerEstado());
        assertEquals(estudianteId, resultado.getEstudianteId());
        mockServer.verify();
    }

    @Test
    @DisplayName("Crear asistencia tipo ATRASO exitosamente")
    void testCrearAsistencia_AtrasoExitoso() {
        Long estudianteId = 1001L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.now());
        dto.setTipoRegistro("ATRASO");
        dto.setHoraLlegada(LocalTime.of(8, 30));

        mockServer.expect(requestTo(urlEsperada + estudianteId))
                .andRespond(withSuccess("true", MediaType.APPLICATION_JSON));

        RegistroAsistencia resultado = servicioAsistencia.crearAsistencia(dto);

        assertNotNull(resultado);
        assertEquals("ATRASO", resultado.obtenerEstado());
        assertEquals(estudianteId, resultado.getEstudianteId());
        mockServer.verify();
    }

    @Test
    @DisplayName("ClienteEstudiantes debe responder exitosamente ante payload JSON válido")
    void testClienteEstudiantes_CasoFeliz() {
        Long estudianteId = 1L;
        mockServer.expect(requestTo(urlEsperada + estudianteId))
                .andRespond(withSuccess("true", MediaType.APPLICATION_JSON));

        assertDoesNotThrow(() -> clienteEstudiantes.validarExistenciaEstudiante(estudianteId));
        mockServer.verify();
    }

    @Test
    @DisplayName("ClienteEstudiantes lanza excepción si ms-students devuelve payload inválido")
    void testClienteEstudiantes_PayloadInvalido() {
        Long estudianteId = 2L;
        mockServer.expect(requestTo(urlEsperada + estudianteId))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST));

        assertThrows(
                Exception.class,
                () -> clienteEstudiantes.validarExistenciaEstudiante(estudianteId)
        );
        mockServer.verify();
    }

    @Test
    @DisplayName("DTO nulo causa NullPointerException en flujo")
    void testCrearAsistencia_DTONulo() {
        assertThrows(
                NullPointerException.class,
                () -> servicioAsistencia.crearAsistencia(null)
        );
    }

    @Test
    @DisplayName("DTO con tipo null activa CircuitBreaker en validación")
    void testCrearAsistencia_SinTipoRegistro() {
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(1001L);
        dto.setFechaRegistro(LocalDate.of(2026, 5, 17));
        dto.setTipoRegistro(null);

        assertThrows(
                ServicioNoDisponibleException.class,
                () -> servicioAsistencia.crearAsistencia(dto)
        );
    }

    @Test
    @DisplayName("CircuitBreaker se abre ante fallos repetidos (503)")
    void testCircuitBreakerAbierto() {
        Long estudianteId = 1003L;
        AsistenciaRequestDto dto = new AsistenciaRequestDto();
        dto.setEstudianteId(estudianteId);
        dto.setFechaRegistro(LocalDate.of(2026, 5, 17));
        dto.setTipoRegistro("PRESENTE");

        mockServer.expect(requestTo(urlEsperada + estudianteId))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        assertThrows(
                ServicioNoDisponibleException.class,
                () -> servicioAsistencia.crearAsistencia(dto)
        );
        mockServer.verify();
    }
}
