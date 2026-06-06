package com.example.deploymentlab.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "departments")
public class Department {

    @Id
    private String id;

    @NotBlank(message = "Department name is required")
    private String name;

    private String description;
    
    // IDs of the GM and Deputy GM from the employees collection
    private String gmId;
    private String deputyGmId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Department() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGmId() { return gmId; }
    public void setGmId(String gmId) { this.gmId = gmId; }

    public String getDeputyGmId() { return deputyGmId; }
    public void setDeputyGmId(String deputyGmId) { this.deputyGmId = deputyGmId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
