package com.backend.ms_attendance.validation.strategy;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.*;

/**
 * ValidationStrategyTest - Suite de tests para el Strategy Pattern de validaciones
 *
 * PATRÓN: Strategy Pattern
 * ──────────────────────
 * Valida que cada estrategia implementa correctamente su algoritmo de validación.
 *
 * COBERTURA:
 * ✓ PresenteValidationStrategy: validación para PRESENTE
 * ✓ InasistenciaValidationStrategy: validación para INASISTENCIA
 * ✓ AtrasoValidationStrategy: validación para ATRASO
 *
 * OBJETIVO: Mejorar cobertura de lineas y branches en validaciones
 */
@SpringBootTest
@DisplayName("ValidationStrategy - Tests de Patrones de Validación")
public class ValidationStrategyTest {

    @Autowired
    private PresenteValidationStrategy presenteStrategy;

    @Autowired
    private InasistenciaValidationStrategy inasistenciaStrategy;

    @Autowired
    private AtrasoValidationStrategy atrasoStrategy;

    @Nested
    @DisplayName("PresenteValidationStrategy")
    class PresenteValidationTests {

        @Test
        @DisplayName("Debe aceptar DTO válido para PRESENTE")
        void testValidDTOPresente() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("PRESENTE")
                .build();

            // Act & Assert
            assertThatNoException().isThrownBy(() -> presenteStrategy.validate(dto));
        }

        @Test
        @DisplayName("Debe rechazar DTO con estudianteId nulo")
        void testRechazaEstudianteIdNulo() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(null)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("PRESENTE")
                .build();

            // Act & Assert
            assertThatThrownBy(() -> presenteStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("estudianteId debe ser un número positivo");
        }

        @Test
        @DisplayName("Debe rechazar DTO con estudianteId negativo")
        void testRechazaEstudianteIdNegativo() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(-1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("PRESENTE")
                .build();

            // Act & Assert
            assertThatThrownBy(() -> presenteStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("estudianteId debe ser un número positivo");
        }

        @Test
        @DisplayName("Debe rechazar DTO con fechaRegistro nula")
        void testRechazaFechaRegistroNula() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(null)
                .tipoRegistro("PRESENTE")
                .build();

            // Act & Assert
            assertThatThrownBy(() -> presenteStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("fechaRegistro es obligatoria");
        }

        @Test
        @DisplayName("Debe rechazar DTO con fecha en el futuro")
        void testRechazaFechaFutura() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now().plusDays(1))
                .tipoRegistro("PRESENTE")
                .build();

            // Act & Assert
            assertThatThrownBy(() -> presenteStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no se puede registrar asistencia en el futuro");
        }

        @Test
        @DisplayName("getNombre retorna 'PRESENTE_VALIDATION'")
        void testGetNombrePresente() {
            assertThat(presenteStrategy.getNombre()).isEqualTo("PRESENTE_VALIDATION");
        }
    }

    @Nested
    @DisplayName("InasistenciaValidationStrategy")
    class InasistenciaValidationTests {

        @Test
        @DisplayName("Debe aceptar DTO válido no justificado")
        void testValidDTOInasistenciaNoJustificada() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("INASISTENCIA")
                .esJustificada(false)
                .build();

            // Act & Assert
            assertThatNoException().isThrownBy(() -> inasistenciaStrategy.validate(dto));
        }

        @Test
        @DisplayName("Debe aceptar DTO válido justificado con razón")
        void testValidDTOInasistenciaJustificada() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("INASISTENCIA")
                .esJustificada(true)
                .razonJustificacion("Enfermedad")
                .build();

            // Act & Assert
            assertThatNoException().isThrownBy(() -> inasistenciaStrategy.validate(dto));
        }

        @Test
        @DisplayName("Debe rechazar inasistencia justificada sin razón")
        void testRechazaInasistenciaJustificadaSinRazon() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("INASISTENCIA")
                .esJustificada(true)
                .razonJustificacion(null)
                .build();

            // Act & Assert
            assertThatThrownBy(() -> inasistenciaStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("razonJustificacion es obligatoria");
        }

        @Test
        @DisplayName("Debe rechazar inasistencia justificada con razón vacía")
        void testRechazaInasistenciaJustificadaRazonVacia() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("INASISTENCIA")
                .esJustificada(true)
                .razonJustificacion("")
                .build();

            // Act & Assert
            assertThatThrownBy(() -> inasistenciaStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("razonJustificacion es obligatoria");
        }

        @Test
        @DisplayName("getNombre retorna 'INASISTENCIA_VALIDATION'")
        void testGetNombreInasistencia() {
            assertThat(inasistenciaStrategy.getNombre()).isEqualTo("INASISTENCIA_VALIDATION");
        }
    }

    @Nested
    @DisplayName("AtrasoValidationStrategy")
    class AtrasoValidationTests {

        @Test
        @DisplayName("Debe aceptar DTO válido para ATRASO")
        void testValidDTOAtraso() {
            // Arrange
            LocalTime horaEsperada = LocalTime.of(8, 0);
            LocalTime horaLlegada = LocalTime.of(8, 15);

            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("ATRASO")
                .horaEsperada(horaEsperada)
                .horaLlegada(horaLlegada)
                .build();

            // Act & Assert
            assertThatNoException().isThrownBy(() -> atrasoStrategy.validate(dto));
        }

        @Test
        @DisplayName("Debe rechazar atraso sin horaLlegada")
        void testRechazaAtrasoSinHoraLlegada() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("ATRASO")
                .horaLlegada(null)
                .horaEsperada(LocalTime.of(8, 0))
                .build();

            // Act & Assert
            assertThatThrownBy(() -> atrasoStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("horaLlegada es obligatoria");
        }

        @Test
        @DisplayName("Debe rechazar atraso sin horaEsperada")
        void testRechazaAtrasoSinHoraEsperada() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("ATRASO")
                .horaLlegada(LocalTime.of(8, 15))
                .horaEsperada(null)
                .build();

            // Act & Assert
            assertThatThrownBy(() -> atrasoStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("horaEsperada es obligatoria");
        }

        @Test
        @DisplayName("Debe rechazar cuando horaLlegada es anterior a horaEsperada")
        void testRechazaHoraLlegadaAnterior() {
            // Arrange
            AsistenciaRequestDto dto = AsistenciaRequestDto.builder()
                .estudianteId(1L)
                .fechaRegistro(LocalDate.now())
                .tipoRegistro("ATRASO")
                .horaLlegada(LocalTime.of(7, 45))
                .horaEsperada(LocalTime.of(8, 0))
                .build();

            // Act & Assert
            assertThatThrownBy(() -> atrasoStrategy.validate(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("horaLlegada no puede ser anterior a horaEsperada");
        }

        @Test
        @DisplayName("getNombre retorna 'ATRASO_VALIDATION'")
        void testGetNombreAtraso() {
            assertThat(atrasoStrategy.getNombre()).isEqualTo("ATRASO_VALIDATION");
        }
    }
}

