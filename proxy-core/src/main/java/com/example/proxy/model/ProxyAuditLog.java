package com.example.proxy.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "proxy_audit_logs")
public class ProxyAuditLog {

    @Id
    private String id;

    private String performedByUserId;
    private String performedByEmployeeId;
    private String performedByName;
    private String performedByEmail;

    private String proxyUserId; // The user who holds the proxy assignment being exercised

    private String actingAsProxyRole;
    private String source;

    private String scopeType;
    private String scopeValue;

    private String permissionUsed;
    private String action;
    
    private String targetType;
    private String targetId;
    private String targetName;

    private boolean success;
    private String failureReason;

    private String requestPath;
    private String httpMethod;

    private LocalDateTime timestamp;

    private Object metadata;

    public ProxyAuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPerformedByUserId() { return performedByUserId; }
    public void setPerformedByUserId(String performedByUserId) { this.performedByUserId = performedByUserId; }

    public String getPerformedByEmployeeId() { return performedByEmployeeId; }
    public void setPerformedByEmployeeId(String performedByEmployeeId) { this.performedByEmployeeId = performedByEmployeeId; }

    public String getPerformedByName() { return performedByName; }
    public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }

    public String getPerformedByEmail() { return performedByEmail; }
    public void setPerformedByEmail(String performedByEmail) { this.performedByEmail = performedByEmail; }

    public String getProxyUserId() { return proxyUserId; }
    public void setProxyUserId(String proxyUserId) { this.proxyUserId = proxyUserId; }

    public String getActingAsProxyRole() { return actingAsProxyRole; }
    public void setActingAsProxyRole(String actingAsProxyRole) { this.actingAsProxyRole = actingAsProxyRole; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }

    public String getScopeValue() { return scopeValue; }
    public void setScopeValue(String scopeValue) { this.scopeValue = scopeValue; }

    public String getPermissionUsed() { return permissionUsed; }
    public void setPermissionUsed(String permissionUsed) { this.permissionUsed = permissionUsed; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public String getTargetName() { return targetName; }
    public void setTargetName(String targetName) { this.targetName = targetName; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getRequestPath() { return requestPath; }
    public void setRequestPath(String requestPath) { this.requestPath = requestPath; }

    public String getHttpMethod() { return httpMethod; }
    public void setHttpMethod(String httpMethod) { this.httpMethod = httpMethod; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Object getMetadata() { return metadata; }
    public void setMetadata(Object metadata) { this.metadata = metadata; }
}

