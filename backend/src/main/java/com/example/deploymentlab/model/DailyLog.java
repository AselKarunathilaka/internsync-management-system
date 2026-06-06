package com.example.deploymentlab.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "daily_logs")
public class DailyLog {
    @Id
    private String id;
    
    private String internId;
    private LocalDate date;
    private String status;
    private String taskStack;
    private String tasksCompleted;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DailyLog() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInternId() { return internId; }
    public void setInternId(String internId) { this.internId = internId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTaskStack() { return taskStack; }
    public void setTaskStack(String taskStack) { this.taskStack = taskStack; }

    public String getTasksCompleted() { return tasksCompleted; }
    public void setTasksCompleted(String tasksCompleted) { this.tasksCompleted = tasksCompleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
