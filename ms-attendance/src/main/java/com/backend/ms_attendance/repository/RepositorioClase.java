package com.backend.ms_attendance.repository;

import com.backend.ms_attendance.model.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositorioClase extends JpaRepository<Clase, Long> {
}
