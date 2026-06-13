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

    public boolean hasAnyActiveProxyPermission(String userId, String scopeType, String scopeValue) {
        List<ProxyAssignment> assignments = proxyAssignmentRepository.findByProxyUserIdAndActiveTrueAndRemovedAtIsNull(userId);
        LocalDateTime now = LocalDateTime.now();
        System.out.println("DEBUG: hasAnyActiveProxyPermission for " + userId + ". Found assignments: " + assignments.size() + ", now: " + now);
        
        return assignments.stream()
            .filter(a -> {
                boolean match = "INTERNAL".equals(a.getSource()) && 
                                scopeType.equals(a.getScopeType()) && 
                                scopeValue.equals(a.getScopeValue());
                System.out.println("DEBUG: Assignment " + a.getId() + " basic match: " + match + " (Source: " + a.getSource() + ", ScopeValue: " + a.getScopeValue() + ")");
                return match;
            })
            .filter(a -> {
                boolean started = a.getStartDate() == null || now.isAfter(a.getStartDate());
                System.out.println("DEBUG: Assignment " + a.getId() + " started: " + started + " (StartDate: " + a.getStartDate() + ")");
                return started;
            })
            .anyMatch(a -> {
                boolean notExpired = a.getExpiresAt() == null || now.isBefore(a.getExpiresAt());
                System.out.println("DEBUG: Assignment " + a.getId() + " not expired: " + notExpired + " (ExpiresAt: " + a.getExpiresAt() + ")");
                return notExpired;
            });
    }
}

