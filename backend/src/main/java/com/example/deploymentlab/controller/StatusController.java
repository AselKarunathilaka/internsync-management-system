package com.example.deploymentlab.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/status")
public class StatusController {

    @Value("${app.version:1.0.0}")
    private String appVersion;

    private final MongoTemplate mongoTemplate;

    public StatusController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping
    public Map<String, String> getStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("app", "InternSync Backend");
        status.put("backend", "running");
        status.put("database", checkDatabaseConnection());
        status.put("version", appVersion);
        status.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return status;
    }

    @GetMapping("/db")
    public Map<String, String> getDbStatus() {
        Map<String, String> dbStatus = new HashMap<>();
        String dbConn = checkDatabaseConnection();
        dbStatus.put("database", dbConn);
        if (!"connected".equals(dbConn)) {
            dbStatus.put("error", "Database connection failed");
        }
        dbStatus.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return dbStatus;
    }

    @GetMapping("/version")
    public Map<String, String> getVersion() {
        Map<String, String> versionInfo = new HashMap<>();
        versionInfo.put("version", appVersion);
        return versionInfo;
    }

    private String checkDatabaseConnection() {
        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            return "connected";
        } catch (Exception e) {
            return "disconnected";
        }
    }
}
