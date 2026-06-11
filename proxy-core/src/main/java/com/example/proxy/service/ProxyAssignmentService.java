package com.example.proxy.service;

import com.example.proxy.dto.*;
import com.example.proxy.model.ProxyAssignment;
import com.example.proxy.repository.ProxyAssignmentRepository;
import com.example.proxy.integration.ProxyHostIntegration;
import com.example.proxy.integration.HostUserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProxyAssignmentService {

    private final ProxyAssignmentRepository proxyAssignmentRepository;
    private final ProxyHostIntegration proxyHostIntegration;
    private final ProxyAuthorizationService proxyAuthorizationService;
    private final ProxyAuditService proxyAuditService;

    @Value("${proxy.access.source:INTERNAL}")
    private String activeSource;

    public ProxyAssignmentService(ProxyAssignmentRepository proxyAssignmentRepository, 
                                  ProxyHostIntegration proxyHostIntegration,
                                  ProxyAuthorizationService proxyAuthorizationService,
                                  ProxyAuditService proxyAuditService) {
        this.proxyAssignmentRepository = proxyAssignmentRepository;
        this.proxyHostIntegration = proxyHostIntegration;
        this.proxyAuthorizationService = proxyAuthorizationService;
        this.proxyAuditService = proxyAuditService;
    }

    public List<ProxyAssignment> getAssignmentsByScope(String scopeType, String scopeValue) {
        return proxyAssignmentRepository.findByScopeTypeAndScopeValueAndRemovedAtIsNull(scopeType, scopeValue);
    }

    public List<ProxyAssignment> getAllAssignments() {
        return proxyAssignmentRepository.findByRemovedAtIsNull();
    }

    public ProxyAssignment assignProxy(ProxyAssignmentRequest request, HostUserDetails currentUser) {
        
        HostUserDetails targetUser = proxyHostIntegration.getUserDetails(request.getProxyUserId());
        if (targetUser == null) {
            throw new IllegalArgumentException("User not found.");
        }

        if (!proxyAuthorizationService.canAssignUserAsProxy(currentUser.getId(), targetUser.getId(), request.getScopeType(), request.getScopeValue())) {
            throw new SecurityException("Not authorized to assign this user as proxy for the given scope.");
        }

        // Check active duplicates
        Optional<ProxyAssignment> existing = proxyAssignmentRepository.findByProxyUserIdAndScopeTypeAndScopeValueAndProxyRoleAndActiveTrueAndRemovedAtIsNull(
            targetUser.getId(), request.getScopeType(), request.getScopeValue(), request.getProxyRole()
        );

        if (existing.isPresent()) {
            throw new IllegalStateException("Active proxy assignment already exists for this user in this scope and role.");
        }

        ProxyAssignment assignment = new ProxyAssignment();
        assignment.setProxyUserId(targetUser.getId());
        assignment.setProxyUserEmployeeId(targetUser.getEmployeeId());
        assignment.setProxyUserEmployeeNumber(targetUser.getEmployeeNumber()); // stored at creation, immutable
        assignment.setProxyUserName(targetUser.getUsername());
        assignment.setProxyUserEmail(targetUser.getEmail());
        
        assignment.setScopeType(request.getScopeType());
        assignment.setScopeValue(request.getScopeValue());
        assignment.setProxyRole(request.getProxyRole());
        assignment.setPermissions(request.getPermissions());
        assignment.setExpiresAt(request.getExpiresAt());
        assignment.setActive(true);
        assignment.setSource(activeSource);
        // Use the requested startDate if provided, otherwise default to now
        assignment.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDateTime.now());

        assignment.setAssignedByUserId(currentUser.getId());
        assignment.setAssignedByName(currentUser.getUsername());
        assignment.setAssignedByDesignation(currentUser.getDesignation());
        assignment.setAssignedAt(LocalDateTime.now());

        ProxyAssignment saved = proxyAssignmentRepository.save(assignment);

        proxyAuditService.logAction(currentUser, currentUser.getAuthorities().toString(), activeSource, 
            request.getScopeType(), request.getScopeValue(), String.join(", ", request.getPermissions()), "ASSIGN_PROXY", 
            "ProxyAssignment", saved.getId(), targetUser.getUsername(), true, null);

        return saved;
    }

    public BulkProxyAssignmentResult bulkAssignProxy(BulkProxyAssignmentRequest request, HostUserDetails currentUser) {
        
        int successCount = 0;
        int failureCount = 0;
        List<BulkProxyAssignmentResult.ResultDetail> results = new ArrayList<>();

        for (String proxyUserId : request.getProxyUserIds()) {
            try {
                ProxyAssignmentRequest singleReq = new ProxyAssignmentRequest();
                singleReq.setProxyUserId(proxyUserId);
                singleReq.setScopeType(request.getScopeType());
                singleReq.setScopeValue(request.getScopeValue());
                singleReq.setProxyRole(request.getProxyRole());
                singleReq.setPermissions(request.getPermissions());
                singleReq.setExpiresAt(request.getExpiresAt());
                
                assignProxy(singleReq, currentUser);
                successCount++;
                results.add(new BulkProxyAssignmentResult.ResultDetail(proxyUserId, "SUCCESS", "Proxy assigned successfully."));
            } catch (Exception e) {
                failureCount++;
                results.add(new BulkProxyAssignmentResult.ResultDetail(proxyUserId, "FAILED", e.getMessage()));
            }
        }

        return new BulkProxyAssignmentResult(request.getProxyUserIds().size(), successCount, failureCount, results);
    }

    public ProxyAssignment updatePermissions(String assignmentId, ProxyPermissionUpdateRequest request, HostUserDetails currentUser) {
        ProxyAssignment assignment = proxyAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new IllegalArgumentException("Assignment not found."));

        if (!proxyAuthorizationService.canManageProxyAssignments(currentUser.getId(), assignment.getScopeType(), assignment.getScopeValue())) {
             throw new SecurityException("Not authorized to manage this proxy assignment.");
        }

        // Only update permissions — startDate and expiresAt are IMMUTABLE once set.
        assignment.setPermissions(request.getPermissions());
        // NOTE: request.getExpiresAt() is intentionally ignored here to enforce immutability.
        assignment.setUpdatedAt(LocalDateTime.now());
        assignment.setUpdatedByUserId(currentUser.getId());

        ProxyAssignment saved = proxyAssignmentRepository.save(assignment);
        
        proxyAuditService.logAction(currentUser, currentUser.getAuthorities().toString(), activeSource, 
            assignment.getScopeType(), assignment.getScopeValue(), String.join(", ", assignment.getPermissions()), "UPDATE_PROXY_PERMISSIONS", 
            "ProxyAssignment", saved.getId(), saved.getProxyUserName(), true, null);

        return saved;
    }

    public ProxyAssignment disableAssignment(String assignmentId, String reason, HostUserDetails currentUser) {
        ProxyAssignment assignment = proxyAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new IllegalArgumentException("Assignment not found."));

        if (!proxyAuthorizationService.canManageProxyAssignments(currentUser.getId(), assignment.getScopeType(), assignment.getScopeValue())) {
             throw new SecurityException("Not authorized to manage this proxy assignment.");
        }

        assignment.setActive(false);
        assignment.setDisableReason(reason);
        assignment.setDisabledAt(LocalDateTime.now());
        assignment.setDisabledByUserId(currentUser.getId());

        ProxyAssignment saved = proxyAssignmentRepository.save(assignment);
        
        proxyAuditService.logAction(currentUser, currentUser.getAuthorities().toString(), activeSource, 
            assignment.getScopeType(), assignment.getScopeValue(), String.join(", ", assignment.getPermissions()), "DISABLE_PROXY", 
            "ProxyAssignment", saved.getId(), saved.getProxyUserName(), true, null);

        return saved;
    }

    public ProxyAssignment enableAssignment(String assignmentId, String reason, HostUserDetails currentUser) {
        ProxyAssignment assignment = proxyAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new IllegalArgumentException("Assignment not found."));

        if (!proxyAuthorizationService.canManageProxyAssignments(currentUser.getId(), assignment.getScopeType(), assignment.getScopeValue())) {
             throw new SecurityException("Not authorized to manage this proxy assignment.");
        }

        assignment.setActive(true);
        // Clean disable fields or just leave them for history, but typically we might clear or just append history
        ProxyAssignment saved = proxyAssignmentRepository.save(assignment);
        
        proxyAuditService.logAction(currentUser, currentUser.getAuthorities().toString(), activeSource, 
            assignment.getScopeType(), assignment.getScopeValue(), String.join(", ", assignment.getPermissions()), "ENABLE_PROXY", 
            "ProxyAssignment", saved.getId(), saved.getProxyUserName(), true, null);

        return saved;
    }

    public ProxyAssignment removeAssignment(String assignmentId, String reason, HostUserDetails currentUser) {
        ProxyAssignment assignment = proxyAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new IllegalArgumentException("Assignment not found."));

        if (!proxyAuthorizationService.canManageProxyAssignments(currentUser.getId(), assignment.getScopeType(), assignment.getScopeValue())) {
             throw new SecurityException("Not authorized to manage this proxy assignment.");
        }

        assignment.setActive(false);
        assignment.setRemoveReason(reason);
        assignment.setRemovedAt(LocalDateTime.now());
        assignment.setRemovedByUserId(currentUser.getId());

        ProxyAssignment saved = proxyAssignmentRepository.save(assignment);
        
        proxyAuditService.logAction(currentUser, currentUser.getAuthorities().toString(), activeSource, 
            assignment.getScopeType(), assignment.getScopeValue(), String.join(", ", assignment.getPermissions()), "REMOVE_PROXY", 
            "ProxyAssignment", saved.getId(), saved.getProxyUserName(), true, null);

        return saved;
    }
    
    /**
     * Get active proxy assignments for a user.
     * userId may be a MongoDB _id OR a username string (from principal.getName()).
     * We resolve it through the host integration so either form works.
     */
    public List<ProxyAssignment> getActiveAssignmentsForUser(String userId) {
        // Try direct lookup first (by stored proxyUserId which is always the MongoDB _id)
        List<ProxyAssignment> byId = proxyAssignmentRepository.findByProxyUserIdAndActiveTrueAndRemovedAtIsNull(userId);
        if (!byId.isEmpty()) {
            return byId;
        }
        // If nothing found, userId might be a username string — resolve through host integration
        try {
            HostUserDetails resolved = proxyHostIntegration.getUserDetails(userId);
            if (resolved != null && resolved.getId() != null && !resolved.getId().equals(userId)) {
                return proxyAssignmentRepository.findByProxyUserIdAndActiveTrueAndRemovedAtIsNull(resolved.getId());
            }
        } catch (Exception e) {
            // ignore resolution errors, return empty
        }
        return byId;
    }
}

