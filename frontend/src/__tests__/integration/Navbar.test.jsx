import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../../components/Navbar';

const defaultItems = [
  { key: 'estudiantes', label: 'Estudiantes' },
  { key: 'asistencia', label: 'Asistencia' },
  { key: 'evaluaciones', label: 'Evaluaciones y Notas' },
];

const defaultSession = {
  name: 'Génesis López',
  email: 'genesis@colegio.cl',
  role: 'profesor',
};

const renderNavbar = (props = {}) =>
  render(
    <Navbar
      items={defaultItems}
      activeKey="estudiantes"
      onChange={vi.fn()}
      session={defaultSession}
      onLogout={vi.fn()}
      {...props}
    />
  );

describe('Navbar — renderizado inicial', () => {
  it('renderiza el header con role="banner"', () => {
    renderNavbar();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renderiza la navegación principal', () => {
    renderNavbar();
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();
  });

  it('renderiza todos los ítems de navegación', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: 'Estudiantes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asistencia' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Evaluaciones y Notas' })).toBeInTheDocument();
  });

  it('muestra el logo del colegio', () => {
    renderNavbar();
    expect(screen.getByAltText(/colegio bernardo o'higgins/i)).toBeInTheDocument();
  });
});

describe('Navbar — ítem activo', () => {
  it('aplica la clase "active" al ítem activo', () => {
    renderNavbar({ activeKey: 'asistencia' });
    const btn = screen.getByRole('button', { name: 'Asistencia' });
    expect(btn).toHaveClass('active');
  });

  it('no aplica "active" a los ítems inactivos', () => {
    renderNavbar({ activeKey: 'asistencia' });
    expect(screen.getByRole('button', { name: 'Estudiantes' })).not.toHaveClass('active');
    expect(screen.getByRole('button', { name: 'Evaluaciones y Notas' })).not.toHaveClass('active');
  });

  it('el ítem activo tiene aria-current="page"', () => {
    renderNavbar({ activeKey: 'evaluaciones' });
    expect(
      screen.getByRole('button', { name: 'Evaluaciones y Notas' })
    ).toHaveAttribute('aria-current', 'page');
  });

  it('los ítems inactivos no tienen aria-current', () => {
    renderNavbar({ activeKey: 'evaluaciones' });
    expect(
      screen.getByRole('button', { name: 'Estudiantes' })
    ).not.toHaveAttribute('aria-current');
  });
});

describe('Navbar — navegación', () => {
  it('llama a onChange con la key correcta al hacer clic', async () => {
    const mockOnChange = vi.fn();
    renderNavbar({ onChange: mockOnChange });

    await userEvent.click(screen.getByRole('button', { name: 'Asistencia' }));

    expect(mockOnChange).toHaveBeenCalledWith('asistencia');
  });

  it('llama a onChange al hacer clic en cualquier ítem', async () => {
    const mockOnChange = vi.fn();
    renderNavbar({ onChange: mockOnChange });

    await userEvent.click(screen.getByRole('button', { name: 'Evaluaciones y Notas' }));

    expect(mockOnChange).toHaveBeenCalledWith('evaluaciones');
  });
});

describe('Navbar — sesión de usuario', () => {
  it('muestra el nombre del usuario cuando hay sesión', () => {
    renderNavbar();
    expect(screen.getByText('Génesis López')).toBeInTheDocument();
  });

  it('muestra el badge de rol "Profesor"', () => {
    renderNavbar();
    expect(screen.getByText('Profesor')).toBeInTheDocument();
  });

  it('muestra el badge de rol "Estudiante"', () => {
    renderNavbar({ session: { ...defaultSession, role: 'estudiante' } });
    expect(screen.getByText('Estudiante')).toBeInTheDocument();
  });

  it('muestra el badge de rol "Apoderado"', () => {
    renderNavbar({ session: { ...defaultSession, role: 'apoderado' } });
    expect(screen.getByText('Apoderado')).toBeInTheDocument();
  });

  it('muestra el avatar con la inicial del nombre', () => {
    renderNavbar();
    // "Génesis López" → inicial "G"
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('muestra la inicial del email si no hay nombre', () => {
    renderNavbar({ session: { email: 'genesis@colegio.cl', role: 'profesor' } });
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('muestra "?" si no hay ni nombre ni email', () => {
    renderNavbar({ session: { role: 'profesor' } });
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('muestra el botón de cerrar sesión', () => {
    renderNavbar();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('no muestra la sección de sesión cuando session=null', () => {
    renderNavbar({ session: null });
    expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument();
  });

  it('llama a onLogout al hacer clic en "Salir"', async () => {
    const mockLogout = vi.fn();
    renderNavbar({ onLogout: mockLogout });

    await userEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('muestra el email como nombre si name está vacío', () => {
    renderNavbar({
      session: { name: '', email: 'genesis@colegio.cl', role: 'profesor' },
    });
    expect(screen.getByText('genesis@colegio.cl')).toBeInTheDocument();
  });
});

describe('Navbar — ítems personalizados', () => {
  it('renderiza ítems personalizados en lugar de los por defecto', () => {
    const customItems = [
      { key: 'home', label: 'Inicio' },
      { key: 'perfil', label: 'Mi Perfil' },
    ];
    renderNavbar({ items: customItems, activeKey: 'home' });

    expect(screen.getByRole('button', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mi Perfil' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Estudiantes' })).not.toBeInTheDocument();
  });
});