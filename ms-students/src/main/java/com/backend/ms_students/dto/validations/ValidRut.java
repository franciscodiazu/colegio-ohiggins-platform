package com.backend.ms_students.dto.validations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = RutValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidRut {
    String message() default "El RUT ingresado es inválido o el dígito verificador es incorrecto";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}