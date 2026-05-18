package com.backend.ms_attendance.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RegistroInasistencia - Tests de Modelo")
public class RegistroInasistenciaTest {

    @Test
    @DisplayName("Debe crear instancia con constructor completo")
    void debeCrearInstanciaConConstructorCompleto() {
        // Arrange & Act
        RegistroInasistencia registro = new RegistroInasistencia(
            1L,
            LocalDate.now(),
            true,
            "Enfermedad"
        );

        // Assert
        assertThat(registro.getEstudianteId()).isEqualTo(1L);
        assertThat(registro.getFechaRegistro()).isNotNull();
        assertThat(registro.getEsJustificada()).isTrue();
        assertThat(registro.getRazonJustificacion()).isEqualTo("Enfermedad");
    }

    @Test
    @DisplayName("Debe crear instancia con esJustificada null y convertirla a false")
    void debeCrearInstanciaConEsJustificadaNull() {
        // Arrange & Act
        RegistroInasistencia registro = new RegistroInasistencia(
            1L,
            LocalDate.now(),
            null,
            null
        );

        // Assert
        assertThat(registro.getEsJustificada()).isFalse();
        assertThat(registro.getRazonJustificacion()).isNull();
    }

    @Test
    @DisplayName("Debe retornar INASISTENCIA_JUSTIFICADA cuando es justificada")
    void debeRetornarInasistenciaJustificada() {
        // Arrange
        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEsJustificada(true);

        // Act
        String estado = registro.obtenerEstado();

        // Assert
        assertThat(estado).isEqualTo("INASISTENCIA_JUSTIFICADA");
    }

    @Test
    @DisplayName("Debe retornar INASISTENCIA cuando no es justificada")
    void debeRetornarInasistenciaNoJustificada() {
        // Arrange
        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEsJustificada(false);

        // Act
        String estado = registro.obtenerEstado();

        // Assert
        assertThat(estado).isEqualTo("INASISTENCIA");
    }

    @Test
    @DisplayName("Debe retornar INASISTENCIA cuando esJustificada es null")
    void debeRetornarInasistenciaCuandoEsJustificadaNull() {
        // Arrange
        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEsJustificada(null);

        // Act
        String estado = registro.obtenerEstado();

        // Assert
        assertThat(estado).isEqualTo("INASISTENCIA");
    }

    @Test
    @DisplayName("Debe ser válido cuando tiene estudianteId y fechaRegistro")
    void debeSerValidoConDatosCompletos() {
        // Arrange
        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEstudianteId(1L);
        registro.setFechaRegistro(LocalDate.now());

        // Act
        boolean valido = registro.esValido();

        // Assert
        assertThat(valido).isTrue();
    }

    @Test
    @DisplayName("Debe no ser válido cuando estudianteId es null")
    void debeNoSerValidoSinEstudianteId() {
        // Arrange
        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEstudianteId(null);
        registro.setFechaRegistro(LocalDate.now());

        // Act
        boolean valido = registro.esValido();

        // Assert
        assertThat(valido).isFalse();
    }

    @Test
    @DisplayName("Debe no ser válido cuando fechaRegistro es null")
    void debeNoSerValidoSinFechaRegistro() {
        // Arrange
        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEstudianteId(1L);
        registro.setFechaRegistro(null);

        // Act
        boolean valido = registro.esValido();

        // Assert
        assertThat(valido).isFalse();
    }

    @Test
    @DisplayName("Debe no ser válido cuando ambos campos son null")
    void debeNoSerValidoSinDatos() {
        // Arrange
        RegistroInasistencia registro = new RegistroInasistencia();
        registro.setEstudianteId(null);
        registro.setFechaRegistro(null);

        // Act
        boolean valido = registro.esValido();

        // Assert
        assertThat(valido).isFalse();
    }
}
