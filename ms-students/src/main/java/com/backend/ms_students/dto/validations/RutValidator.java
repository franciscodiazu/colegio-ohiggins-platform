package com.backend.ms_students.dto.validations;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RutValidator implements ConstraintValidator<ValidRut, String> {

    @Override
    public boolean isValid(String rut, ConstraintValidatorContext context) {
        if (rut == null || !rut.matches("^[0-9]{7,8}-[0-9Kk]$")) {
            return false;
        }

        try {
            String[] partes = rut.split("-");
            int numero = Integer.parseInt(partes[0]);
            char dvEntregado = partes[1].toUpperCase().charAt(0);
            
            return validarDV(numero) == dvEntregado;
        } catch (Exception e) {
            return false;
        }
    }

    private char validarDV(int rut) {
        int m = 0, s = 1;
        for (; rut != 0; rut /= 10) {
            s = (s + rut % 10 * (9 - m++ % 6)) % 11;
        }
        return (char) (s != 0 ? s + 47 : 75); // 75 es 'K'
    }
}