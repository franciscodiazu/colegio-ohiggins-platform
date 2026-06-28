package com.backend.ms_attendance.repository;

import com.backend.ms_attendance.model.RegistroAtraso;
import com.backend.ms_attendance.model.RegistroInasistencia;
import com.backend.ms_attendance.model.RegistroPresenteAsistencia;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@EnableJpaRepositories(basePackageClasses = RepositorioRegistroAsistencia.class)
@EntityScan(basePackageClasses = RegistroPresenteAsistencia.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
@DisplayName("RepositorioRegistroAsistencia — Persistencia JPA con herencia SINGLE_TABLE")
class RepositorioRegistroAsistenciaDataJpaTest {

    @Autowired
    private RepositorioRegistroAsistencia repository;

    private static final Long ESTUDIANTE_ID = 1L;
    private static final Long OTRO_ESTUDIANTE = 2L;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private RegistroPresenteAsistencia crearPresente(Long estudianteId, LocalDate fecha) {
        return new RegistroPresenteAsistencia(estudianteId, fecha);
    }

    private RegistroInasistencia crearInasistencia(Long estudianteId, LocalDate fecha, Boolean justificada, String razon) {
        return new RegistroInasistencia(estudianteId, fecha, justificada, razon);
    }

    private RegistroAtraso crearAtraso(Long estudianteId, LocalDate fecha, LocalTime llegada, LocalTime esperada) {
        return new RegistroAtraso(estudianteId, fecha, llegada, esperada);
    }

    @Nested
    @DisplayName("Persistencia con herencia SINGLE_TABLE")
    class SingleTableInheritance {

        @Test
        @DisplayName("persiste RegistroPresenteAsistencia con discriminador PRESENTE")
        void shouldPersistPresente() {
            RegistroPresenteAsistencia registro = crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1));

            RegistroPresenteAsistencia saved = repository.save(registro);

            assertThat(saved.getId()).isNotNull();
            assertThat(saved.getEstudianteId()).isEqualTo(ESTUDIANTE_ID);
            assertThat(saved.obtenerEstado()).isEqualTo("PRESENTE");
            assertThat(saved.esValido()).isTrue();
        }

        @Test
        @DisplayName("persiste RegistroInasistencia con discriminador INASISTENCIA")
        void shouldPersistInasistencia() {
            RegistroInasistencia registro = crearInasistencia(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1), true, "Enfermedad");

            RegistroInasistencia saved = repository.save(registro);

            assertThat(saved.getId()).isNotNull();
            assertThat(saved.obtenerEstado()).isEqualTo("INASISTENCIA_JUSTIFICADA");
            assertThat(saved.getEsJustificada()).isTrue();
            assertThat(saved.getRazonJustificacion()).isEqualTo("Enfermedad");
        }

        @Test
        @DisplayName("persiste RegistroAtraso con discriminador ATRASO y calcula minutos")
        void shouldPersistAtraso() {
            RegistroAtraso registro = crearAtraso(
                ESTUDIANTE_ID, LocalDate.of(2026, 6, 1),
                LocalTime.of(8, 30), LocalTime.of(8, 0)
            );

            RegistroAtraso saved = repository.save(registro);

            assertThat(saved.getId()).isNotNull();
            assertThat(saved.obtenerEstado()).isEqualTo("ATRASO");
            assertThat(saved.getMinutosAtraso()).isEqualTo(30);
        }

        @Test
        @DisplayName("recupera los tres subtipos desde la misma tabla via discriminador")
        void shouldRetrieveAllSubtypes() {
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1)));
            repository.save(crearInasistencia(ESTUDIANTE_ID, LocalDate.of(2026, 6, 2), false, null));
            repository.save(crearAtraso(ESTUDIANTE_ID, LocalDate.of(2026, 6, 3), LocalTime.of(8, 20), LocalTime.of(8, 0)));

            List<RegistroPresenteAsistencia> presentes = repository.findPresenteRegistrosByEstudianteId(ESTUDIANTE_ID);
            List<RegistroInasistencia> inasistencias = repository.findInasistenciaRegistrosByEstudianteId(ESTUDIANTE_ID);
            List<RegistroAtraso> atrasos = repository.findAtrasoRegistrosByEstudianteId(ESTUDIANTE_ID);

            assertThat(presentes).hasSize(1);
            assertThat(inasistencias).hasSize(1);
            assertThat(atrasos).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Consultas derivadas (query methods)")
    class DerivedQueryMethods {

        @Test
        @DisplayName("findByEstudianteId — retorna registros ordenados por fecha")
        void findByEstudianteId_shouldReturnRecords() {
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1)));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 2)));

            var registros = repository.findByEstudianteId(ESTUDIANTE_ID);

            assertThat(registros).hasSize(2);
        }

        @Test
        @DisplayName("findByEstudianteId — retorna vacío si no hay registros")
        void findByEstudianteId_whenNoRecords_shouldReturnEmpty() {
            var registros = repository.findByEstudianteId(ESTUDIANTE_ID);

            assertThat(registros).isEmpty();
        }

        @Test
        @DisplayName("findByEstudianteIdAndFechaRegistro — filtra por estudiante y fecha exacta")
        void findByEstudianteIdAndFechaRegistro_shouldFilterByDate() {
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1)));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 2)));

            var registros = repository.findByEstudianteIdAndFechaRegistro(
                ESTUDIANTE_ID, LocalDate.of(2026, 6, 1));

            assertThat(registros).hasSize(1);
            assertThat(registros.get(0).getFechaRegistro()).isEqualTo(LocalDate.of(2026, 6, 1));
        }

        @Test
        @DisplayName("findByEstudianteId — no mezcla registros de distintos estudiantes")
        void findByEstudianteId_shouldNotMixStudents() {
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1)));
            repository.save(crearPresente(OTRO_ESTUDIANTE, LocalDate.of(2026, 6, 1)));

            var registros = repository.findByEstudianteId(ESTUDIANTE_ID);

            assertThat(registros)
                .hasSize(1)
                .allMatch(r -> r.getEstudianteId().equals(ESTUDIANTE_ID));
        }
    }

    @Nested
    @DisplayName("Consultas JPQL personalizadas")
    class CustomJpqlQueries {

        @Test
        @DisplayName("findByEstudianteIdAndRangoFechas — retorna registros en rango descendente")
        void dateRangeQuery_shouldReturnRecordsInRange() {
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1)));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 15)));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 30)));

            var registros = repository.findByEstudianteIdAndRangoFechas(
                ESTUDIANTE_ID,
                LocalDate.of(2026, 6, 5),
                LocalDate.of(2026, 6, 20)
            );

            assertThat(registros)
                .hasSize(1)
                .allMatch(r -> r.getFechaRegistro().equals(LocalDate.of(2026, 6, 15)));
        }

        @Test
        @DisplayName("findByEstudianteIdAndRangoFechas — retorna vacío si no hay registros en rango")
        void dateRangeQuery_whenEmptyRange_shouldReturnEmpty() {
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1)));

            var registros = repository.findByEstudianteIdAndRangoFechas(
                ESTUDIANTE_ID,
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 7, 31)
            );

            assertThat(registros).isEmpty();
        }

        @Test
        @DisplayName("findByEstudianteIdAndRangoFechas — retorna ordenado por fecha descendente")
        void dateRangeQuery_shouldBeOrderedDesc() {
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 10)));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 5)));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1)));

            var registros = repository.findByEstudianteIdAndRangoFechas(
                ESTUDIANTE_ID,
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 30)
            );

            assertThat(registros).hasSize(3);
            assertThat(registros.get(0).getFechaRegistro())
                .isAfter(registros.get(registros.size() - 1).getFechaRegistro());
        }

        @Test
        @DisplayName("findInasistenciasJustificadasByEstudianteId — solo retorna justificadas")
        void justificadasQuery_shouldReturnOnlyJustificadas() {
            repository.save(crearInasistencia(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1), true, "Enfermedad"));
            repository.save(crearInasistencia(ESTUDIANTE_ID, LocalDate.of(2026, 6, 2), false, null));
            repository.save(crearInasistencia(ESTUDIANTE_ID, LocalDate.of(2026, 6, 3), true, "Viaje"));

            var justificadas = repository.findInasistenciasJustificadasByEstudianteId(ESTUDIANTE_ID);

            assertThat(justificadas)
                .hasSize(2)
                .allMatch(RegistroInasistencia::getEsJustificada);
        }

        @Test
        @DisplayName("findAtrasoRegistrosAboveUmbral — solo retorna atrasos mayores al umbral")
        void atrasosAboveUmbral_shouldFilterByThreshold() {
            repository.save(crearAtraso(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1), LocalTime.of(8, 5), LocalTime.of(8, 0)));
            repository.save(crearAtraso(ESTUDIANTE_ID, LocalDate.of(2026, 6, 2), LocalTime.of(8, 30), LocalTime.of(8, 0)));
            repository.save(crearAtraso(ESTUDIANTE_ID, LocalDate.of(2026, 6, 3), LocalTime.of(9, 0), LocalTime.of(8, 0)));

            var atrasos = repository.findAtrasoRegistrosAboveUmbral(ESTUDIANTE_ID, 15);

            assertThat(atrasos)
                .hasSize(2)
                .allMatch(r -> r.getMinutosAtraso() > 15);
            assertThat(atrasos.get(0).getMinutosAtraso())
                .isGreaterThanOrEqualTo(atrasos.get(atrasos.size() - 1).getMinutosAtraso());
        }
    }

    @Nested
    @DisplayName("Consultas de agregación (COUNT)")
    class AggregationQueries {

        @Test
        @DisplayName("countPresenteRegistros — cuenta solo registros PRESENTE")
        void countPresente_shouldCountOnlyPresente() {
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1)));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 2)));
            repository.save(crearInasistencia(ESTUDIANTE_ID, LocalDate.of(2026, 6, 3), false, null));

            long count = repository.countPresenteRegistros(ESTUDIANTE_ID);

            assertThat(count).isEqualTo(2);
        }

        @Test
        @DisplayName("countInasistenciaRegistros — cuenta solo registros INASISTENCIA")
        void countInasistencia_shouldCountOnlyInasistencia() {
            repository.save(crearInasistencia(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1), false, null));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 2)));

            long count = repository.countInasistenciaRegistros(ESTUDIANTE_ID);

            assertThat(count).isEqualTo(1);
        }

        @Test
        @DisplayName("countAtrasoRegistros — cuenta solo registros ATRASO")
        void countAtraso_shouldCountOnlyAtraso() {
            repository.save(crearAtraso(ESTUDIANTE_ID, LocalDate.of(2026, 6, 1), LocalTime.of(8, 15), LocalTime.of(8, 0)));
            repository.save(crearPresente(ESTUDIANTE_ID, LocalDate.of(2026, 6, 2)));

            long count = repository.countAtrasoRegistros(ESTUDIANTE_ID);

            assertThat(count).isEqualTo(1);
        }

        @Test
        @DisplayName("COUNT — retorna 0 cuando no hay registros del tipo")
        void count_whenNoRecords_shouldReturnZero() {
            long count = repository.countPresenteRegistros(ESTUDIANTE_ID);

            assertThat(count).isZero();
        }
    }
}
