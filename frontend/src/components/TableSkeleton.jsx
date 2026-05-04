// ─── Componente: celda skeleton individual ────────────────────────────────────

function SkeletonCell({ width = '80%' }) {
  return (
    <td>
      <div className="skeleton-cell" style={{ width }} />
    </td>
  );
}

// ─── Componente: fila skeleton ────────────────────────────────────────────────

function SkeletonRow({ cols }) {
  // Ancho variable por columna para que se vea más natural
  const widths = ['60%', '80%', '50%', '70%', '40%', '65%'];
  return (
    <tr className="skeleton-row">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonCell key={i} width={widths[i % widths.length]} />
      ))}
    </tr>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * TableSkeleton — skeleton de carga reutilizable para tablas.
 *
 * Props:
 *   cols {number} — número de columnas (default: 4)
 *   rows {number} — número de filas skeleton a mostrar (default: 4)
 */
export default function TableSkeleton({ cols = 4, rows = 4 }) {
  return (
    <tbody aria-label="Cargando datos..." aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </tbody>
  );
}