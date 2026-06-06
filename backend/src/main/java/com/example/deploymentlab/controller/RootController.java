package com.example.deploymentlab.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "app", "InternSync Backend",
                "backend", "running",
                "message", "Use /api/status for full health check",
                "timestamp", LocalDateTime.now().toString()
        );
    }

}
