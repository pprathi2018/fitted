package com.fitted.service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    
    @GetMapping("/health")
    public String health() {
        return "Fitted Backend is running successfully!";
    }
    
    @GetMapping("/")
    public String home() {
        return "Fitted backend is ready!";
    }
}