package com.backend.ms_attendance.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RegistroPresenteAsistencia - Tests de Modelo")
public class RegistroPresenteAsistenciaTest {

    @Test
    @DisplayName("Debe crear instancia con constructor por defecto")
    void debeCrearInstanciaConConstructorPorDefecto() {
        // Arrange & Act
        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia();

        // Assert
        assertThat(registro).isNotNull();
    }

    @Test
    @DisplayName("Debe crear instancia con datos completos usando setters")
    void debeCrearInstanciaConDatosCompletos() {
        // Arrange
        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia();
        registro.setId(1L);
        registro.setEstudianteId(1L);
        registro.setFechaRegistro(LocalDate.now());

        // Act & Assert
        assertThat(registro.getId()).isEqualTo(1L);
        assertThat(registro.getEstudianteId()).isEqualTo(1L);
        assertThat(registro.getFechaRegistro()).isNotNull();
    }

    @Test
    @DisplayName("Debe retornar PRESENTE como estado")
    void debeRetornarPresente() {
        // Arrange
        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia();

        // Act
        String estado = registro.obtenerEstado();

        // Assert
        assertThat(estado).isEqualTo("PRESENTE");
    }

    @Test
    @DisplayName("Debe ser válido cuando tiene estudianteId y fechaRegistro")
    void debeSerValidoConDatosCompletos() {
        // Arrange
        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia();
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
        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia();
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
        RegistroPresenteAsistencia registro = new RegistroPresenteAsistencia();
        registro.setEstudianteId(1L);
        registro.setFechaRegistro(null);

        // Act
        boolean valido = registro.esValido();

        // Assert
        assertThat(valido).isFalse();
    }
}
