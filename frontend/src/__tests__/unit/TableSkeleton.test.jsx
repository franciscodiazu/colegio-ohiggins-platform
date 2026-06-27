import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TableSkeleton from '../../components/TableSkeleton';

// Helper: TableSkeleton debe estar dentro de una tabla para HTML válido
const renderSkeleton = (props = {}) =>
  render(
    <table>
      <TableSkeleton {...props} />
    </table>
  );

describe('TableSkeleton — renderizado con valores por defecto', () => {
  it('renderiza un tbody con aria-label de carga', () => {
    renderSkeleton();
    expect(screen.getByLabelText('Cargando datos...')).toBeInTheDocument();
  });

  it('tiene aria-busy="true"', () => {
    renderSkeleton();
    const tbody = screen.getByLabelText('Cargando datos...');
    expect(tbody).toHaveAttribute('aria-busy', 'true');
  });

  it('renderiza 4 filas por defecto', () => {
    renderSkeleton();
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);
  });

  it('renderiza 4 columnas por defecto en cada fila', () => {
    renderSkeleton();
    const rows = screen.getAllByRole('row');
    rows.forEach((row) => {
      const cells = within(row).getAllByRole('cell');
      expect(cells).toHaveLength(4);
    });
  });
});

describe('TableSkeleton — props personalizadas', () => {
  it('renderiza el número de filas indicado con rows=6', () => {
    renderSkeleton({ rows: 6 });
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(6);
  });

  it('renderiza el número de columnas indicado con cols=3', () => {
    renderSkeleton({ cols: 3 });
    const rows = screen.getAllByRole('row');
    rows.forEach((row) => {
      const cells = within(row).getAllByRole('cell');
      expect(cells).toHaveLength(3);
    });
  });

  it('renderiza correctamente con cols=1 y rows=1', () => {
    renderSkeleton({ cols: 1, rows: 1 });
    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(screen.getAllByRole('cell')).toHaveLength(1);
  });

  it('renderiza correctamente con cols=6 (cubre todos los anchos del ciclo)', () => {
    renderSkeleton({ cols: 6, rows: 1 });
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(6);
  });

  it('cada celda contiene un div con clase skeleton-cell', () => {
    const { container } = renderSkeleton({ cols: 3, rows: 2 });
    const skeletonDivs = container.querySelectorAll('.skeleton-cell');
    expect(skeletonDivs).toHaveLength(6); // 3 cols × 2 rows
  });
});

describe('TableSkeleton — estilos de ancho variables', () => {
  it('las celdas tienen anchos distintos (patrón rotativo)', () => {
    const { container } = renderSkeleton({ cols: 6, rows: 1 });
    const divs = container.querySelectorAll('.skeleton-cell');
    const widths = Array.from(divs).map((d) => d.style.width);
    // Los 6 anchos deben cubrir el array completo de widths definido en el componente
    expect(widths).toEqual(['60%', '80%', '50%', '70%', '40%', '65%']);
  });
});