package com.backend.ms_communications.controller;

import com.backend.ms_communications.factory.NotificationFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/communications")
public class CommunicationController {

    @Autowired
    private NotificationFactory factory;

    @PostMapping("/send")
    public String sendNotification(@RequestParam String type, 
                                    @RequestParam String to, 
                                    @RequestParam String message) {
        factory.getNotification(type).send(to, message);
        return "Notificación " + type + " enviada correctamente.";
    }
}