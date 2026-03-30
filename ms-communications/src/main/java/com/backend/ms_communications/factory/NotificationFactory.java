package com.backend.ms_communications.factory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class NotificationFactory {

    @Autowired
    private Map<String, Notification> notifications;

    public Notification getNotification(String type) {
        Notification notification = notifications.get(type.toUpperCase());
        if (notification == null) {
            throw new IllegalArgumentException("Tipo de notificación no soportado: " + type);
        }
        return notification;
    }
}