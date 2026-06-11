package com.example.proxy.service;

import com.example.proxy.integration.ProxyHostIntegration;
import com.example.proxy.model.ProxyAssignment;
import com.example.proxy.repository.ProxyAssignmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProxyAuthorizationService {

    private final ProxyAssignmentRepository proxyAssignmentRepository;
    private final ProxyHostIntegration proxyHostIntegration;

    public ProxyAuthorizationService(ProxyAssignmentRepository proxyAssignmentRepository,
                                     ProxyHostIntegration proxyHostIntegration) {
        this.proxyAssignmentRepository = proxyAssignmentRepository;
        this.proxyHostIntegration = proxyHostIntegration;
    }

    public boolean hasActiveProxyPermission(String userId, String permission, String scopeType, String scopeValue) {
        List<ProxyAssignment> assignments = proxyAssignmentRepository.findByProxyUserIdAndActiveTrueAndRemovedAtIsNull(userId);
        
        LocalDateTime now = LocalDateTime.now();
        
        return assignments.stream()
            .filter(a -> "INTERNAL".equals(a.getSource()))
            .filter(a -> scopeType.equals(a.getScopeType()) && scopeValue.equals(a.getScopeValue()))
            .filter(a -> a.getStartDate() == null || now.isAfter(a.getStartDate()))
            .filter(a -> a.getExpiresAt() == null || now.isBefore(a.getExpiresAt()))
            .anyMatch(a -> a.getPermissions().contains(permission));
    }

    public boolean canManageProxyAssignments(String assignerId, String scopeType, String scopeValue) {
        return proxyHostIntegration.canManageProxyAssignments(assignerId, scopeType, scopeValue);
    }

    public boolean canAssignUserAsProxy(String assignerId, String targetUserId, String scopeType, String scopeValue) {
        return proxyHostIntegration.canAssignUserAsProxy(assignerId, targetUserId, scopeType, scopeValue);
    }
}

