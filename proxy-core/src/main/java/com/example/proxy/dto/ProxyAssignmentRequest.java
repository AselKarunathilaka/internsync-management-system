package com.example.proxy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.List;

public class ProxyAssignmentRequest {
    @NotBlank
    private String proxyUserId;
    @NotBlank
    private String scopeType;
    @NotBlank
    private String scopeValue;
    @NotBlank
    private String proxyRole;
    @NotEmpty
    private List<String> permissions;

    /** When the proxy window starts. Required — must be in the future or now. */
    private LocalDateTime startDate;

    /** When the proxy window ends. Required — must be after startDate. */
    private LocalDateTime expiresAt;

    // Getters and setters
    public String getProxyUserId() { return proxyUserId; }
    public void setProxyUserId(String proxyUserId) { this.proxyUserId = proxyUserId; }

    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }

    public String getScopeValue() { return scopeValue; }
    public void setScopeValue(String scopeValue) { this.scopeValue = scopeValue; }

    public String getProxyRole() { return proxyRole; }
    public void setProxyRole(String proxyRole) { this.proxyRole = proxyRole; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}


