package com.backend.ms_communications.factory;

import org.springframework.stereotype.Component;

@Component("EMAIL")
public class EmailNotification implements Notification {
    @Override
    public void send(String recipient, String message) {
        // Simulación de envío de correo para la versión funcional
        System.out.println("[EMAIL SENT] Para: " + recipient + " | Mensaje: " + message);
    }
}