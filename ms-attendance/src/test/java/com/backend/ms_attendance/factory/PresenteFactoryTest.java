package com.backend.ms_attendance.factory;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;
import com.backend.ms_attendance.model.RegistroAsistencia;
import com.backend.ms_attendance.model.RegistroPresenteAsistencia;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("Tests de PresenteFactory")
class PresenteFactoryTest {

	private final PresenteFactory factory = new PresenteFactory();

	@Test
	@DisplayName("Factory crea RegistroPresenteAsistencia con datos válidos")
	void testCrearPresente_ConDatosValidos() {
		AsistenciaRequestDto dto = new AsistenciaRequestDto();
		dto.setEstudianteId(1001L);
		dto.setFechaRegistro(LocalDate.of(2026, 5, 15));
		dto.setNotas("Llegó a tiempo");

		RegistroAsistencia registro = factory.crearRegistro(dto);

		assertNotNull(registro);
		RegistroPresenteAsistencia presente = (RegistroPresenteAsistencia) registro;
		assertEquals(1001L, presente.getEstudianteId());
		assertEquals(LocalDate.of(2026, 5, 15), presente.getFechaRegistro());
		assertEquals("Llegó a tiempo", presente.getNotas());
	}

	@Test
	@DisplayName("Factory rechaza DTO sin estudianteId")
	void testCrearPresente_SinEstudianteId() {
		AsistenciaRequestDto dto = new AsistenciaRequestDto();
		dto.setFechaRegistro(LocalDate.of(2026, 5, 15));

		assertThrows(IllegalArgumentException.class, () -> factory.crearRegistro(dto));
	}

	@Test
	@DisplayName("Factory rechaza DTO sin fechaRegistro")
	void testCrearPresente_SinFechaRegistro() {
		AsistenciaRequestDto dto = new AsistenciaRequestDto();
		dto.setEstudianteId(1001L);

		assertThrows(IllegalArgumentException.class, () -> factory.crearRegistro(dto));
	}

	@Test
	@DisplayName("Factory obtiene tipo PRESENTE")
	void testObtenerTipoRegistro() {
		assertEquals("PRESENTE", factory.obtenerTipoRegistro());
	}
}
