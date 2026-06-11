package com.example.proxy.service;

import com.example.proxy.integration.HostUserDetails;
import com.example.proxy.model.ProxyAuditLog;
import com.example.proxy.repository.ProxyAuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProxyAuditService {

    private final ProxyAuditLogRepository proxyAuditLogRepository;

    public ProxyAuditService(ProxyAuditLogRepository proxyAuditLogRepository) {
        this.proxyAuditLogRepository = proxyAuditLogRepository;
    }

    public void logAction(HostUserDetails currentUser, String actingAsProxyRole, String source, 
                          String scopeType, String scopeValue, String permissionUsed, String action, 
                          String targetType, String targetId, String targetName, 
                          boolean success, String failureReason) {
        logAction(currentUser, null, actingAsProxyRole, source, scopeType, scopeValue,
                  permissionUsed, action, targetType, targetId, targetName, success, failureReason);
    }

    public void logAction(HostUserDetails currentUser, String proxyUserId, String actingAsProxyRole, String source,
                          String scopeType, String scopeValue, String permissionUsed, String action,
                          String targetType, String targetId, String targetName,
                          boolean success, String failureReason) {

        ProxyAuditLog log = new ProxyAuditLog();
        if (currentUser != null) {
            log.setPerformedByUserId(currentUser.getId());
            log.setPerformedByName(currentUser.getUsername());
            log.setPerformedByEmail(currentUser.getEmail());
        }

        log.setProxyUserId(proxyUserId);
        log.setActingAsProxyRole(actingAsProxyRole);
        log.setSource(source);
        log.setScopeType(scopeType);
        log.setScopeValue(scopeValue);
        log.setPermissionUsed(permissionUsed);
        log.setAction(action);
        
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setTargetName(targetName);
        
        log.setSuccess(success);
        log.setFailureReason(failureReason);

        proxyAuditLogRepository.save(log);
    }
    
    public List<ProxyAuditLog> getLogsByScope(String scopeType, String scopeValue) {
        return proxyAuditLogRepository.findByScopeTypeAndScopeValueOrderByTimestampDesc(scopeType, scopeValue);
    }

    /** Returns all logs for a department scope value, sorted newest first. */
    public List<ProxyAuditLog> getLogsByScopeValue(String scopeValue) {
        return proxyAuditLogRepository.findByScopeValueOrderByTimestampDesc(scopeValue);
    }

    /** Returns all logs sorted newest first (for Admin use). */
    public List<ProxyAuditLog> getAllLogsDesc() {
        return proxyAuditLogRepository.findAllByOrderByTimestampDesc();
    }
    
    public List<ProxyAuditLog> getAllLogs() {
        return proxyAuditLogRepository.findAll();
    }
}


