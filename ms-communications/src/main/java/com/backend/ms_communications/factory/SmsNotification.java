package com.backend.ms_communications.factory;

import org.springframework.stereotype.Component;

@Component("SMS")
public class SmsNotification implements Notification {
    @Override
    public void send(String recipient, String message) {
        System.out.println("[SMS SENT] Para: " + recipient + " | Mensaje: " + message);
    }
}