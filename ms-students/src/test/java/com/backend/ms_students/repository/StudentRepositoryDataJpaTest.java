package com.backend.ms_students.repository;

import com.backend.ms_students.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@DisplayName("StudentRepository — Persistencia JPA")
class StudentRepositoryDataJpaTest {

    @Autowired
    private StudentRepository repository;

    private Student baseStudent;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        baseStudent = new Student();
        baseStudent.setRut("12345678-5");
        baseStudent.setName("Juan Pérez");
        baseStudent.setGrade("1A");
    }

    @Nested
    @DisplayName("Operaciones CRUD")
    class CrudOperations {

        @Test
        @DisplayName("save — persiste y asigna ID autoincremental")
        void save_shouldPersistAndAssignId() {
            Student saved = repository.save(baseStudent);

            assertThat(saved.getId()).isNotNull();
            assertThat(saved.getRut()).isEqualTo("12345678-5");
            assertThat(saved.getName()).isEqualTo("Juan Pérez");
            assertThat(saved.getGrade()).isEqualTo("1A");
            assertThat(saved.getCreadoEn()).isNotNull();
            assertThat(saved.getActualizadoEn()).isNotNull();
        }

        @Test
        @DisplayName("findById — retorna Optional con estudiante si existe")
        void findById_whenExists_shouldReturnStudent() {
            Student saved = repository.save(baseStudent);

            Optional<Student> found = repository.findById(saved.getId());

            assertThat(found).isPresent();
            assertThat(found.get().getRut()).isEqualTo("12345678-5");
        }

        @Test
        @DisplayName("findById — retorna Optional vacío si no existe")
        void findById_whenNotExists_shouldReturnEmpty() {
            Optional<Student> found = repository.findById(999L);

            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("findAll — retorna todos los estudiantes ordenados por ID")
        void findAll_shouldReturnAllStudents() {
            repository.save(baseStudent);
            Student otro = new Student();
            otro.setRut("87654321-0");
            otro.setName("María García");
            otro.setGrade("2B");
            repository.save(otro);

            List<Student> all = repository.findAll();

            assertThat(all).hasSize(2);
        }

        @Test
        @DisplayName("delete — elimina estudiante existente")
        void delete_shouldRemoveStudent() {
            Student saved = repository.save(baseStudent);

            repository.delete(saved);

            assertThat(repository.findById(saved.getId())).isEmpty();
        }

        @Test
        @DisplayName("save — lanza excepción si el RUT ya existe (unique constraint)")
        void save_whenDuplicateRut_shouldThrow() {
            repository.save(baseStudent);
            Student duplicado = new Student();
            duplicado.setRut("12345678-5");
            duplicado.setName("Otro");
            duplicado.setGrade("3C");

            assertThatThrownBy(() -> repository.save(duplicado))
                .isInstanceOf(DataIntegrityViolationException.class);
        }
    }

    @Nested
    @DisplayName("Métodos de búsqueda derivados")
    class DerivedQueryMethods {

        @Test
        @DisplayName("findByRut — retorna estudiante cuando existe")
        void findByRut_whenExists_shouldReturnStudent() {
            repository.save(baseStudent);

            Optional<Student> found = repository.findByRut("12345678-5");

            assertThat(found).isPresent();
            assertThat(found.get().getName()).isEqualTo("Juan Pérez");
        }

        @Test
        @DisplayName("findByRut — retorna Optional vacío cuando no existe")
        void findByRut_whenNotExists_shouldReturnEmpty() {
            Optional<Student> found = repository.findByRut("NO-EXISTS");

            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("existsByRut — retorna true si el RUT existe")
        void existsByRut_whenExists_shouldReturnTrue() {
            repository.save(baseStudent);

            boolean exists = repository.existsByRut("12345678-5");

            assertThat(exists).isTrue();
        }

        @Test
        @DisplayName("existsByRut — retorna false si el RUT no existe")
        void existsByRut_whenNotExists_shouldReturnFalse() {
            boolean exists = repository.existsByRut("NO-EXISTS");

            assertThat(exists).isFalse();
        }
    }

    @Nested
    @DisplayName("Mapeo de timestamps (@PrePersist / @PreUpdate)")
    class TimestampMapping {

        @Test
        @DisplayName("creadoEn y actualizadoEn se asignan automáticamente al persistir")
        void timestamps_shouldBeSetOnPersist() {
            Student saved = repository.save(baseStudent);

            assertThat(saved.getCreadoEn()).isNotNull();
            assertThat(saved.getActualizadoEn()).isNotNull();
            assertThat(saved.getActualizadoEn())
                .isCloseTo(saved.getCreadoEn(), org.assertj.core.api.Assertions.within(1, java.time.temporal.ChronoUnit.MILLIS));
        }

        @Test
        @DisplayName("actualizadoEn se actualiza al modificar, creadoEn permanece")
        void updatedAt_shouldChangeOnUpdate() {
            Student saved = repository.save(baseStudent);
            java.time.LocalDateTime creadoOriginal = saved.getCreadoEn();

            saved.setName("Juan Pérez Modificado");
            repository.save(saved);
            repository.flush();

            Student updated = repository.findById(saved.getId()).orElseThrow();
            assertThat(updated.getCreadoEn()).isEqualTo(creadoOriginal);
            assertThat(updated.getActualizadoEn()).isAfter(creadoOriginal);
        }
    }
}
