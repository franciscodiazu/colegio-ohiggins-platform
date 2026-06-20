import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConfirmModal from '../../components/ConfirmModal';

const defaultProps = {
  open: true,
  title: '¿Confirmar acción?',
  message: 'Esta acción no se puede deshacer.',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmModal — visibilidad', () => {
  it('no renderiza nada cuando open=false', () => {
    render(<ConfirmModal {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el modal cuando open=true', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('ConfirmModal — contenido por defecto', () => {
  it('muestra el título recibido por props', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('¿Confirmar acción?')).toBeInTheDocument();
  });

  it('muestra el mensaje recibido por props', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();
  });

  it('muestra el texto de confirmación por defecto "Confirmar"', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
  });

  it('muestra el texto de cancelación por defecto "Cancelar"', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('no renderiza el mensaje si no se pasa la prop message', () => {
    render(<ConfirmModal {...defaultProps} message={undefined} />);
    expect(screen.queryByText('Esta acción no se puede deshacer.')).not.toBeInTheDocument();
  });
});

describe('ConfirmModal — props personalizadas de texto', () => {
  it('muestra el confirmText personalizado', () => {
    render(<ConfirmModal {...defaultProps} confirmText="Sí, eliminar" />);
    expect(screen.getByRole('button', { name: /sí, eliminar/i })).toBeInTheDocument();
  });

  it('muestra el cancelText personalizado', () => {
    render(<ConfirmModal {...defaultProps} cancelText="No, volver" />);
    expect(screen.getByRole('button', { name: /no, volver/i })).toBeInTheDocument();
  });
});

describe('ConfirmModal — variantes', () => {
  it('aplica clase danger por defecto', () => {
    render(<ConfirmModal {...defaultProps} />);
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmBtn).toHaveClass('btn--danger');
  });

  it('aplica clase warning para variante warning', () => {
    render(<ConfirmModal {...defaultProps} variant="warning" />);
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmBtn).toHaveClass('btn--warning');
  });

  it('aplica clase primary para variante info', () => {
    render(<ConfirmModal {...defaultProps} variant="info" />);
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmBtn).toHaveClass('btn--primary');
  });

  it('usa danger como fallback ante una variante desconocida', () => {
    render(<ConfirmModal {...defaultProps} variant="desconocida" />);
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmBtn).toHaveClass('btn--danger');
  });
});

describe('ConfirmModal — accesibilidad', () => {
  it('el dialog tiene role="dialog" y aria-modal="true"', () => {
    render(<ConfirmModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('el título tiene el id correcto para aria-labelledby', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('¿Confirmar acción?')).toHaveAttribute(
      'id',
      'confirm-modal-title'
    );
  });

  it('el botón cancelar recibe el foco automáticamente al abrir', () => {
    render(<ConfirmModal {...defaultProps} />);
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    expect(document.activeElement).toBe(cancelBtn);
  });
});

describe('ConfirmModal — interacciones', () => {
  it('llama a onConfirm al hacer clic en el botón confirmar', async () => {
    const mockConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={mockConfirm} />);

    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it('llama a onCancel al hacer clic en el botón cancelar', async () => {
    const mockCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={mockCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('llama a onCancel al presionar Escape', async () => {
    const mockCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={mockCancel} />);

    await userEvent.keyboard('{Escape}');

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('llama a onCancel al hacer clic en el backdrop', async () => {
    const mockCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={mockCancel} />);

    const backdrop = screen.getByRole('dialog');
    await userEvent.click(backdrop);

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('no llama a onCancel al hacer clic dentro del panel (no en el backdrop)', async () => {
    const mockCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={mockCancel} />);

    // Clic en el título, que está dentro del panel
    await userEvent.click(screen.getByText('¿Confirmar acción?'));

    expect(mockCancel).not.toHaveBeenCalled();
  });
});