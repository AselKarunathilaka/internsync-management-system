package com.example.proxy.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "proxy_assignments")
public class ProxyAssignment {

    @Id
    private String id;

    private String proxyUserId;
    private String proxyUserName;
    private String proxyUserEmail;
    private String proxyUserEmployeeId;
    private String proxyUserEmployeeNumber; // Human-readable e.g. 001234 — stored at creation, immutable

    private String scopeType;
    private String scopeValue;

    private String proxyRole;
    private List<String> permissions;

    private boolean active;
    private String source;

    private LocalDateTime startDate;
    private LocalDateTime expiresAt;

    private String assignedByUserId;
    private String assignedByName;
    private String assignedByDesignation;
    private LocalDateTime assignedAt;

    private String updatedByUserId;
    private LocalDateTime updatedAt;

    private String disabledByUserId;
    private LocalDateTime disabledAt;
    private String disableReason;

    private String removedByUserId;
    private LocalDateTime removedAt;
    private String removeReason;

    private LocalDateTime createdAt;

    public ProxyAssignment() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProxyUserId() { return proxyUserId; }
    public void setProxyUserId(String proxyUserId) { this.proxyUserId = proxyUserId; }

    public String getProxyUserName() { return proxyUserName; }
    public void setProxyUserName(String proxyUserName) { this.proxyUserName = proxyUserName; }

    public String getProxyUserEmail() { return proxyUserEmail; }
    public void setProxyUserEmail(String proxyUserEmail) { this.proxyUserEmail = proxyUserEmail; }

    public String getProxyUserEmployeeId() { return proxyUserEmployeeId; }
    public void setProxyUserEmployeeId(String proxyUserEmployeeId) { this.proxyUserEmployeeId = proxyUserEmployeeId; }

    public String getProxyUserEmployeeNumber() { return proxyUserEmployeeNumber; }
    public void setProxyUserEmployeeNumber(String proxyUserEmployeeNumber) { this.proxyUserEmployeeNumber = proxyUserEmployeeNumber; }

    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }

    public String getScopeValue() { return scopeValue; }
    public void setScopeValue(String scopeValue) { this.scopeValue = scopeValue; }

    public String getProxyRole() { return proxyRole; }
    public void setProxyRole(String proxyRole) { this.proxyRole = proxyRole; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public String getAssignedByUserId() { return assignedByUserId; }
    public void setAssignedByUserId(String assignedByUserId) { this.assignedByUserId = assignedByUserId; }

    public String getAssignedByName() { return assignedByName; }
    public void setAssignedByName(String assignedByName) { this.assignedByName = assignedByName; }

    public String getAssignedByDesignation() { return assignedByDesignation; }
    public void setAssignedByDesignation(String assignedByDesignation) { this.assignedByDesignation = assignedByDesignation; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public String getUpdatedByUserId() { return updatedByUserId; }
    public void setUpdatedByUserId(String updatedByUserId) { this.updatedByUserId = updatedByUserId; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getDisabledByUserId() { return disabledByUserId; }
    public void setDisabledByUserId(String disabledByUserId) { this.disabledByUserId = disabledByUserId; }

    public LocalDateTime getDisabledAt() { return disabledAt; }
    public void setDisabledAt(LocalDateTime disabledAt) { this.disabledAt = disabledAt; }

    public String getDisableReason() { return disableReason; }
    public void setDisableReason(String disableReason) { this.disableReason = disableReason; }

    public String getRemovedByUserId() { return removedByUserId; }
    public void setRemovedByUserId(String removedByUserId) { this.removedByUserId = removedByUserId; }

    public LocalDateTime getRemovedAt() { return removedAt; }
    public void setRemovedAt(LocalDateTime removedAt) { this.removedAt = removedAt; }

    public String getRemoveReason() { return removeReason; }
    public void setRemoveReason(String removeReason) { this.removeReason = removeReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

