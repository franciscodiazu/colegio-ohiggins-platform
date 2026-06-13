// ─────────────────────────────────────────────────────────────────────────────
// PRUEBAS UNITARIAS — Hook: useFieldValidation
// Verifica el comportamiento aislado de cada regla de validación y el
// ciclo de vida del hook (onChange, onBlur, validate, reset).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFieldValidation, rules } from '../../hooks/useFieldValidation';

// ─── Helper: construye un evento sintético de input ───────────────────────────
const mockEvent = (value) => ({ target: { value } });

// =============================================================================
// 1. REGLAS INDIVIDUALES
// =============================================================================

describe('rules.required', () => {
  const rule = rules.required('El nombre');

  it('retorna error cuando el valor está vacío', () => {
    expect(rule('')).toBe('El nombre es obligatorio.');
  });

  it('retorna error cuando el valor es solo espacios', () => {
    expect(rule('   ')).toBe('El nombre es obligatorio.');
  });

  it('retorna null cuando el valor tiene contenido', () => {
    expect(rule('Génesis')).toBeNull();
  });
});

describe('rules.email', () => {
  const rule = rules.email();

  it('retorna null cuando el valor está vacío (campo opcional)', () => {
    expect(rule('')).toBeNull();
  });

  it('retorna error para correo sin @', () => {
    expect(rule('correosinArroba.cl')).not.toBeNull();
  });

  it('retorna error para correo sin dominio', () => {
    expect(rule('correo@')).not.toBeNull();
  });

  it('retorna null para correo con formato válido', () => {
    expect(rule('usuario@ejemplo.cl')).toBeNull();
  });
});

describe('rules.institutionalEmail', () => {
  const rule = rules.institutionalEmail();

  it('acepta correo @profesor.cl', () => {
    expect(rule('ana@profesor.cl')).toBeNull();
  });

  it('acepta correo @alum.cl', () => {
    expect(rule('pedro@alum.cl')).toBeNull();
  });

  it('acepta correo @apod.cl', () => {
    expect(rule('maria@apod.cl')).toBeNull();
  });

  it('rechaza correo de dominio externo', () => {
    expect(rule('usuario@gmail.com')).not.toBeNull();
  });

  it('retorna null cuando el valor está vacío', () => {
    expect(rule('')).toBeNull();
  });
});

describe('rules.minLength', () => {
  const rule = rules.minLength(6);

  it('retorna error si la longitud es menor al mínimo', () => {
    expect(rule('abc')).not.toBeNull();
  });

  it('retorna null si la longitud es exactamente el mínimo', () => {
    expect(rule('abcdef')).toBeNull();
  });

  it('retorna null si la longitud supera el mínimo', () => {
    expect(rule('abcdefgh')).toBeNull();
  });

  it('retorna null cuando el valor está vacío', () => {
    expect(rule('')).toBeNull();
  });
});

describe('rules.matchField', () => {
  it('retorna null cuando los valores coinciden', () => {
    const rule = rules.matchField('secreta123', 'contraseña');
    expect(rule('secreta123')).toBeNull();
  });

  it('retorna error cuando los valores no coinciden', () => {
    const rule = rules.matchField('secreta123', 'contraseña');
    expect(rule('diferente')).not.toBeNull();
  });

  it('retorna null cuando el valor está vacío', () => {
    const rule = rules.matchField('secreta123', 'contraseña');
    expect(rule('')).toBeNull();
  });
});

// =============================================================================
// 2. HOOK useFieldValidation — ciclo de vida
// =============================================================================

describe('useFieldValidation — estado inicial', () => {
  it('inicia con value vacío, sin error y sin tocar', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    expect(result.current.value).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.touched).toBe(false);
  });
});

describe('useFieldValidation — onChange', () => {
  it('actualiza el value al escribir', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    act(() => result.current.onChange(mockEvent('hola')));
    expect(result.current.value).toBe('hola');
  });

  it('no muestra error mientras el campo no ha sido tocado (onBlur)', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    act(() => result.current.onChange(mockEvent('')));
    expect(result.current.error).toBeNull();
  });

  it('valida en tiempo real si el campo ya fue tocado', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    // Tocar primero
    act(() => result.current.onBlur());
    // Borrar el contenido
    act(() => result.current.onChange(mockEvent('')));
    expect(result.current.error).not.toBeNull();
  });
});

describe('useFieldValidation — onBlur', () => {
  it('marca el campo como touched', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    act(() => result.current.onBlur());
    expect(result.current.touched).toBe(true);
  });

  it('muestra error si el campo está vacío al perder el foco', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    act(() => result.current.onBlur());
    expect(result.current.error).not.toBeNull();
  });
});

describe('useFieldValidation — validate', () => {
  it('retorna false y establece error cuando el campo es inválido', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    let isValid;
    act(() => { isValid = result.current.validate(); });
    expect(isValid).toBe(false);
    expect(result.current.error).not.toBeNull();
  });

  it('retorna true y limpia el error cuando el campo es válido', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    act(() => result.current.onChange(mockEvent('valor válido')));
    let isValid;
    act(() => { isValid = result.current.validate(); });
    expect(isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });
});

describe('useFieldValidation — reset', () => {
  it('limpia value, error y touched', () => {
    const { result } = renderHook(() =>
      useFieldValidation([rules.required('Campo')])
    );
    act(() => {
      result.current.onChange(mockEvent('algo'));
      result.current.onBlur();
    });
    act(() => result.current.reset());
    expect(result.current.value).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.touched).toBe(false);
  });
});
