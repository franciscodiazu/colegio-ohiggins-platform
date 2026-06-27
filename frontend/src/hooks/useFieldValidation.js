import { useState, useCallback } from 'react';

// ─── Reglas de validación predefinidas ────────────────────────────────────────

export const rules = {
  required: (label) => (value) =>
    !value.trim() ? `${label} es obligatorio.` : null,

  email: () => (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !pattern.test(value.trim())
      ? 'Ingresa un correo electrónico válido.'
      : null;
  },

  institutionalEmail: () => (value) => {
    const pattern = /^[^\s@]+@(profesor|alum|apod)\.cl$/i;
    return value && !pattern.test(value.trim())
      ? 'El correo debe ser institucional (@profesor.cl, @alum.cl o @apod.cl).'
      : null;
  },

  minLength: (min) => (value) =>
    value && value.length < min
      ? `Debe tener al menos ${min} caracteres.`
      : null,

  matchField: (otherValue, label) => (value) =>
    value && value !== otherValue
      ? `No coincide con el campo ${label}.`
      : null,
};

// ─── Hook principal ────────────────────────────────────────────────────────────

/**
 * useFieldValidation — valida un campo individual en tiempo real.
 *
 * @param {Function[]} fieldRules — array de funciones validadoras (de `rules`)
 * @returns {{ value, onChange, error, touched, validate, reset }}
 *
 * Uso:
 *   const nombre = useFieldValidation([rules.required('Nombre')]);
 *   <input value={nombre.value} onChange={nombre.onChange} />
 *   {nombre.error && <p>{nombre.error}</p>}
 */
export function useFieldValidation(fieldRules = []) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);

  // Corre todas las reglas y devuelve el primer error encontrado
  const runRules = useCallback(
    (val) => {
      for (const rule of fieldRules) {
        const result = rule(val);
        if (result) return result;
      }
      return null;
    },
    [fieldRules],
  );

  const onChange = useCallback(
    (e) => {
      const next = e.target.value;
      setValue(next);

      // Solo validar en tiempo real si el campo ya fue tocado
      if (touched) {
        setError(runRules(next));
      }
    },
    [touched, runRules],
  );

  const onBlur = useCallback(() => {
    setTouched(true);
    setError(runRules(value));
  }, [value, runRules]);

  // Validar manualmente (al enviar el formulario)
  const validate = useCallback(() => {
    setTouched(true);
    const result = runRules(value);
    setError(result);
    return result === null;
  }, [value, runRules]);

  const reset = useCallback(() => {
    setValue('');
    setError(null);
    setTouched(false);
  }, []);

  return { value, onChange, onBlur, error, touched, validate, reset };
}