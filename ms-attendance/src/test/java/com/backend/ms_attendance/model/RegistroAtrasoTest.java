package com.backend.ms_attendance.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RegistroAtraso - Tests de Modelo")
public class RegistroAtrasoTest {

    @Test
    @DisplayName("Debe crear instancia con constructor por defecto")
    void debeCrearInstanciaConConstructorPorDefecto() {
        // Arrange & Act
        RegistroAtraso registro = new RegistroAtraso();

        // Assert
        assertThat(registro).isNotNull();
    }

    @Test
    @DisplayName("Debe set y get horaLlegada correctamente")
    void debeSetGetHoraLlegada() {
        // Arrange
        RegistroAtraso registro = new RegistroAtraso();
        LocalTime hora = LocalTime.of(8, 30);

        // Act
        registro.setHoraLlegada(hora);

        // Assert
        assertThat(registro.getHoraLlegada()).isEqualTo(hora);
    }

    @Test
    @DisplayName("Debe set y get horaEsperada correctamente")
    void debeSetGetHoraEsperada() {
        // Arrange
        RegistroAtraso registro = new RegistroAtraso();
        LocalTime hora = LocalTime.of(8, 0);

        // Act
        registro.setHoraEsperada(hora);

        // Assert
        assertThat(registro.getHoraEsperada()).isEqualTo(hora);
    }

    @Test
    @DisplayName("Debe set y get minutosAtraso correctamente")
    void debeSetGetMinutosAtraso() {
        // Arrange
        RegistroAtraso registro = new RegistroAtraso();
        Integer minutos = 30;

        // Act
        registro.setMinutosAtraso(minutos);

        // Assert
        assertThat(registro.getMinutosAtraso()).isEqualTo(minutos);
    }

    @Test
    @DisplayName("Debe crear instancia con datos completos usando setters")
    void debeCrearInstanciaConDatosCompletos() {
        // Arrange
        RegistroAtraso registro = new RegistroAtraso();
        registro.setId(1L);
        registro.setEstudianteId(1L);
        registro.setFechaRegistro(LocalDate.now());
        registro.setHoraLlegada(LocalTime.of(8, 30));
        registro.setHoraEsperada(LocalTime.of(8, 0));
        registro.setMinutosAtraso(30);

        // Act & Assert
        assertThat(registro.getId()).isEqualTo(1L);
        assertThat(registro.getEstudianteId()).isEqualTo(1L);
        assertThat(registro.getFechaRegistro()).isNotNull();
        assertThat(registro.getHoraLlegada()).isEqualTo(LocalTime.of(8, 30));
        assertThat(registro.getHoraEsperada()).isEqualTo(LocalTime.of(8, 0));
        assertThat(registro.getMinutosAtraso()).isEqualTo(30);
    }
}
