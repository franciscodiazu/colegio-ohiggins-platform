package com.backend.ms_attendance.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("EntidadNoEncontradaException - Tests de Excepción")
public class EntidadNoEncontradaExceptionTest {

    @Test
    @DisplayName("Debe crear excepción con mensaje")
    void debeCrearExcepcionConMensaje() {
        // Arrange
        String mensaje = "Estudiante no encontrado";

        // Act
        EntidadNoEncontradaException ex = new EntidadNoEncontradaException(mensaje);

        // Assert
        assertThat(ex).isInstanceOf(RuntimeException.class);
        assertThat(ex.getMessage()).isEqualTo(mensaje);
    }

    @Test
    @DisplayName("Debe crear excepción con mensaje y causa")
    void debeCrearExcepcionConMensajeYCausa() {
        // Arrange
        String mensaje = "Estudiante no encontrado";
        Throwable causa = new RuntimeException("Error de conexión");

        // Act
        EntidadNoEncontradaException ex = new EntidadNoEncontradaException(mensaje, causa);

        // Assert
        assertThat(ex).isInstanceOf(RuntimeException.class);
        assertThat(ex.getMessage()).isEqualTo(mensaje);
        assertThat(ex.getCause()).isEqualTo(causa);
    }

    @Test
    @DisplayName("Debe tener anotación @ResponseStatus con NOT_FOUND")
    void debeTenerAnotacionResponseStatus() {
        // Arrange & Act
        EntidadNoEncontradaException ex = new EntidadNoEncontradaException("Test");

        // Assert
        assertThat(ex.getClass().getAnnotation(org.springframework.web.bind.annotation.ResponseStatus.class))
            .isNotNull();
        assertThat(ex.getClass().getAnnotation(org.springframework.web.bind.annotation.ResponseStatus.class).value())
            .isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }
}
