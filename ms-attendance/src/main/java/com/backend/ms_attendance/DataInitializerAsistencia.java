package com.backend.ms_attendance;

import com.backend.ms_attendance.model.Clase;
import com.backend.ms_attendance.model.RegistroPresenteAsistencia;
import com.backend.ms_attendance.model.RegistroInasistencia;
import com.backend.ms_attendance.repository.RepositorioClase;
import com.backend.ms_attendance.repository.RepositorioRegistroAsistencia;
import com.backend.ms_attendance.service.ClienteEstudiantes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class DataInitializerAsistencia implements CommandLineRunner {

    private final RepositorioClase repositorioClase;
    private final RepositorioRegistroAsistencia repositorioAsistencia;
    private final ClienteEstudiantes clienteEstudiantes;

    public DataInitializerAsistencia(
        RepositorioClase repositorioClase,
        RepositorioRegistroAsistencia repositorioAsistencia,
        ClienteEstudiantes clienteEstudiantes
    ) {
        this.repositorioClase = repositorioClase;
        this.repositorioAsistencia = repositorioAsistencia;
        this.clienteEstudiantes = clienteEstudiantes;
    }

    @Override
    public void run(String... args) {
        if (repositorioClase.count() > 0 || repositorioAsistencia.count() > 0) {
            log.info("Seed data already exists, skipping DataInitializerAsistencia");
            return;
        }
        log.info("--- Seeding attendance data ---");

        Clase clase1 = new Clase();
        clase1.setFecha(LocalDate.now());
        clase1.setCurso("1A");
        clase1.setAsignatura("Matematicas");
        clase1.setBloque("08:00 - 08:45");
        clase1 = repositorioClase.save(clase1);
        log.info("Created class 1A: id={}", clase1.getId());

        Clase clase2 = new Clase();
        clase2.setFecha(LocalDate.now().minusDays(1));
        clase2.setCurso("2B");
        clase2.setAsignatura("Lenguaje");
        clase2.setBloque("10:00 - 10:45");
        clase2 = repositorioClase.save(clase2);
        log.info("Created class 2B: id={}", clase2.getId());

        List<Map<String, Object>> estudiantes;
        try {
            estudiantes = clienteEstudiantes.listarEstudiantes();
        } catch (Exception e) {
            log.warn("Could not fetch students from ms-students: {}. Skipping attendance seeds.", e.getMessage());
            return;
        }

        if (estudiantes.isEmpty()) {
            log.warn("No students found in ms-students. Skipping attendance seeds.");
            return;
        }

        for (int i = 0; i < estudiantes.size(); i++) {
            Map<String, Object> est = estudiantes.get(i);
            Number idNum = (Number) est.get("id");
            Long studentId = idNum.longValue();

            RegistroPresenteAsistencia presente = new RegistroPresenteAsistencia();
            presente.setEstudianteId(studentId);
            presente.setClaseId(clase1.getId());
            presente.setFechaRegistro(LocalDate.now());
            presente.setNotas("Presente - seed");
            repositorioAsistencia.save(presente);
            log.info("Presente for student {}", studentId);

            if (i == 0) {
                RegistroInasistencia ausente = new RegistroInasistencia();
                ausente.setEstudianteId(studentId);
                ausente.setClaseId(clase2.getId());
                ausente.setFechaRegistro(LocalDate.now().minusDays(1));
                ausente.setNotas("Ausente sin justificacion - seed");
                ausente.setEsJustificada(false);
                repositorioAsistencia.save(ausente);
                log.info("Inasistencia (no justificada) for student {}", studentId);
            }

            if (i == 1) {
                RegistroInasistencia justificada = new RegistroInasistencia();
                justificada.setEstudianteId(studentId);
                justificada.setClaseId(clase2.getId());
                justificada.setFechaRegistro(LocalDate.now().minusDays(1));
                justificada.setNotas("Ausente justificada - seed");
                justificada.setEsJustificada(true);
                justificada.setRazonJustificacion("Problema de salud familiar");
                repositorioAsistencia.save(justificada);
                log.info("Inasistencia (justificada) for student {}", studentId);
            }
        }

        log.info("--- Seed complete: {} clases, {} attendance records ---",
            repositorioClase.count(), repositorioAsistencia.count());
    }
}
