package com.backend.ms_students.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class ServicioNoDisponibleException extends RuntimeException {

    private final String code;

    public ServicioNoDisponibleException(String mensaje) {
        super(mensaje);
        this.code = "SERVICE-001";
    }

    public ServicioNoDisponibleException(String code, String mensaje) {
        super(mensaje);
        this.code = code;
    }

    public ServicioNoDisponibleException(String mensaje, Throwable causa) {
        super(mensaje, causa);
        this.code = "SERVICE-001";
    }

    public String getCode() {
        return code;
    }
}
