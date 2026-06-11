package com.example.proxy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.List;

public class BulkProxyAssignmentRequest {
    @NotEmpty
    private List<String> proxyUserIds;
    @NotBlank
    private String scopeType;
    @NotBlank
    private String scopeValue;
    @NotBlank
    private String proxyRole;
    @NotEmpty
    private List<String> permissions;
    
    private LocalDateTime expiresAt;

    // Getters and setters
    public List<String> getProxyUserIds() { return proxyUserIds; }
    public void setProxyUserIds(List<String> proxyUserIds) { this.proxyUserIds = proxyUserIds; }

    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }

    public String getScopeValue() { return scopeValue; }
    public void setScopeValue(String scopeValue) { this.scopeValue = scopeValue; }

    public String getProxyRole() { return proxyRole; }
    public void setProxyRole(String proxyRole) { this.proxyRole = proxyRole; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}

