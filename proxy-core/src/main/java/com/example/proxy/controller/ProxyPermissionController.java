package com.example.proxy.controller;

import java.security.Principal;
import com.example.proxy.model.ProxyAssignment;
import com.example.proxy.model.ProxyAuditLog;
import com.example.proxy.service.ProxyAssignmentService;
import com.example.proxy.service.ProxyAuditService;
import com.example.proxy.service.ProxyConfigService;
import com.example.proxy.service.ProxyAuthorizationService;
import com.example.proxy.integration.HostUserDetails;
import com.example.proxy.integration.ProxyHostIntegration;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proxy")
public class ProxyPermissionController {

    private final ProxyConfigService proxyConfigService;
    private final ProxyAssignmentService proxyAssignmentService;
    private final ProxyAuthorizationService proxyAuthorizationService;
    private final ProxyAuditService proxyAuditService;
    private final ProxyHostIntegration proxyHostIntegration;

    public ProxyPermissionController(ProxyConfigService proxyConfigService,
                                     ProxyAssignmentService proxyAssignmentService,
                                     ProxyAuthorizationService proxyAuthorizationService,
                                     ProxyAuditService proxyAuditService,
                                     ProxyHostIntegration proxyHostIntegration) {
        this.proxyConfigService = proxyConfigService;
        this.proxyAssignmentService = proxyAssignmentService;
        this.proxyAuthorizationService = proxyAuthorizationService;
        this.proxyAuditService = proxyAuditService;
        this.proxyHostIntegration = proxyHostIntegration;
    }

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        return ResponseEntity.ok(proxyConfigService.getProxyConfiguration());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProxyAccess(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<ProxyAssignment> assignments = proxyAssignmentService.getActiveAssignmentsForUser(principal.getName());
        LocalDateTime now = LocalDateTime.now();

        ProxyAssignment activeAssignment = assignments.stream()
            .filter(a -> a.getStartDate() == null || now.isAfter(a.getStartDate()))
            .filter(a -> a.getExpiresAt() == null || now.isBefore(a.getExpiresAt()))
            .findFirst().orElse(null);

        Map<String, Object> response = new HashMap<>();
        if (activeAssignment != null) {
            response.put("isProxy", true);
            response.put("source", activeAssignment.getSource());
            response.put("proxyRole", activeAssignment.getProxyRole());
            response.put("scopeType", activeAssignment.getScopeType());
            response.put("scopeValue", activeAssignment.getScopeValue());
            response.put("permissions", activeAssignment.getPermissions());
            response.put("expiresAt", activeAssignment.getExpiresAt());
        } else {
            response.put("isProxy", false);
            response.put("permissions", List.of());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/check")
    public ResponseEntity<?> checkPermission(@RequestBody Map<String, String> request,
                                             Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String permission = request.get("permission");
        String scopeType = request.get("scopeType");
        String scopeValue = request.get("scopeValue");

        boolean allowed = proxyAuthorizationService.hasActiveProxyPermission(
                principal.getName(), permission, scopeType, scopeValue);

        Map<String, Object> response = new HashMap<>();
        response.put("allowed", allowed);
        if (allowed) {
            response.put("source", "INTERNAL");
            response.put("reason", "Active proxy assignment found.");
        } else {
            response.put("reason", "No active proxy permission found.");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/proxy/logs
     * Admin  → all logs (newest first), or filtered by optional ?scopeValue=
     * GM/DGM → must supply ?scopeValue=their-dept; access validated against their management authority
     */
    @GetMapping("/logs")
    public ResponseEntity<?> getProxyLogs(
            @RequestParam(name = "scopeValue", required = false) String scopeValueParam,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        HostUserDetails currentUser = proxyHostIntegration.getUserDetails(principal.getName());
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        boolean isAdmin = currentUser.getAuthorities() != null &&
                          currentUser.getAuthorities().contains("ROLE_ADMIN");

        List<ProxyAuditLog> logs;

        if (isAdmin) {
            // Admin can see all logs, optionally filtered by scopeValue
            if (scopeValueParam != null && !scopeValueParam.isBlank()) {
                logs = proxyAuditService.getLogsByScopeValue(scopeValueParam);
            } else {
                logs = proxyAuditService.getAllLogsDesc();
            }
        } else {
            // GM/DGM: must provide their department as scopeValue.
            // The frontend already knows this from the employee profile.
            if (scopeValueParam == null || scopeValueParam.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "scopeValue is required for non-admin users"));
            }
            // Validate they actually manage this department
            boolean canManage = proxyAuthorizationService.canManageProxyAssignments(
                    currentUser.getId(), "DEPARTMENT", scopeValueParam);
            if (!canManage) {
                return ResponseEntity.status(403).body(
                    Map.of("error", "You are not authorized to view logs for department: " + scopeValueParam));
            }
            logs = proxyAuditService.getLogsByScopeValue(scopeValueParam);
        }

        return ResponseEntity.ok(logs);
    }
}
