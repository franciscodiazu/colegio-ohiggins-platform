package com.backend.ms_attendance.validation.strategy;

import com.backend.ms_attendance.dto.AsistenciaRequestDto;

/**
 * ValidationStrategy - Patrón Strategy para diferentes estrategias de validación
 *
 * PATRÓN DE DISEÑO: Strategy Pattern
 * ─────────────────────────────────
 * Define una familia de algoritmos (validaciones), encapsula cada uno,
 * y los hace intercambiables. Permite que el algoritmo varíe independientemente
 * de los clientes que lo usan.
 *
 * VENTAJAS:
 * ✓ Cada estrategia en su propia clase (responsabilidad única)
 * ✓ Fácil agregar nuevas validaciones sin modificar código existente
 * ✓ Testeable: cada validación se prueba por separado
 * ✓ Flexible: se puede cambiar la estrategia en tiempo de ejecución
 *
 * CASE DE USO:
 * - Validación por tipo de registro (PRESENTE, INASISTENCIA, ATRASO)
 * - Validación de rangos horarios
 * - Validaciones de negocio específicas por contexto
 */
public interface ValidationStrategy {
    /**
     * Valida un DTO de asistencia según la estrategia específica
     * @param dto Datos a validar
     * @throws IllegalArgumentException si la validación falla
     */
    void validate(AsistenciaRequestDto dto) throws IllegalArgumentException;

    /**
     * Retorna el nombre descriptivo de la estrategia
     * @return nombre de la estrategia
     */
    String getNombre();
}

