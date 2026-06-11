package com.example.proxy.controller;

import com.example.proxy.integration.HostUserDetails;
import com.example.proxy.integration.ProxyHostIntegration;
import com.example.proxy.dto.*;
import com.example.proxy.model.ProxyAssignment;
import com.example.proxy.service.ProxyAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.List;

@RestController
@RequestMapping("/api/proxy/assignments")
public class ProxyAssignmentController {

    private final ProxyAssignmentService proxyAssignmentService;
    private final ProxyHostIntegration proxyHostIntegration;

    public ProxyAssignmentController(ProxyAssignmentService proxyAssignmentService, ProxyHostIntegration proxyHostIntegration) {
        this.proxyAssignmentService = proxyAssignmentService;
        this.proxyHostIntegration = proxyHostIntegration;
    }

    private HostUserDetails getCurrentUser(Principal principal) {
        if (principal == null) throw new SecurityException("Unauthorized");
        HostUserDetails user = proxyHostIntegration.getUserDetails(principal.getName());
        if (user == null) throw new SecurityException("User not found");
        return user;
    }

    @GetMapping
    public ResponseEntity<?> getAssignments(
            @RequestParam(name = "scopeType", required = false) String scopeType,
            @RequestParam(name = "scopeValue", required = false) String scopeValue) {
        // Here we could enforce rules that GM only sees their own, and Admin sees all.
        // For simplicity, returning what is requested.
        List<ProxyAssignment> assignments;
        if (scopeType != null && scopeValue != null) {
            assignments = proxyAssignmentService.getAssignmentsByScope(scopeType, scopeValue);
        } else {
            assignments = proxyAssignmentService.getAllAssignments();
        }
        return ResponseEntity.ok(assignments);
    }

    @PostMapping
    public ResponseEntity<?> assignProxy(@Valid @RequestBody ProxyAssignmentRequest request, 
                                         Principal principal) {
        ProxyAssignment assignment = proxyAssignmentService.assignProxy(request, getCurrentUser(principal));
        return ResponseEntity.ok(assignment);
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkAssignProxy(@Valid @RequestBody BulkProxyAssignmentRequest request,
                                             Principal principal) {
        BulkProxyAssignmentResult result = proxyAssignmentService.bulkAssignProxy(request, getCurrentUser(principal));
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/permissions")
    public ResponseEntity<?> updatePermissions(@PathVariable("id") String id, 
                                               @Valid @RequestBody ProxyPermissionUpdateRequest request,
                                               Principal principal) {
        ProxyAssignment assignment = proxyAssignmentService.updatePermissions(id, request, getCurrentUser(principal));
        return ResponseEntity.ok(assignment);
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<?> disableProxy(@PathVariable("id") String id, 
                                          @Valid @RequestBody ReasonRequest request,
                                          Principal principal) {
        ProxyAssignment assignment = proxyAssignmentService.disableAssignment(id, request.getReason(), getCurrentUser(principal));
        return ResponseEntity.ok(assignment);
    }

    @PatchMapping("/{id}/enable")
    public ResponseEntity<?> enableProxy(@PathVariable("id") String id, 
                                         @Valid @RequestBody ReasonRequest request,
                                         Principal principal) {
        ProxyAssignment assignment = proxyAssignmentService.enableAssignment(id, request.getReason(), getCurrentUser(principal));
        return ResponseEntity.ok(assignment);
    }

    @PatchMapping("/{id}/remove")
    public ResponseEntity<?> removeProxy(@PathVariable("id") String id, 
                                         @Valid @RequestBody ReasonRequest request,
                                         Principal principal) {
        ProxyAssignment assignment = proxyAssignmentService.removeAssignment(id, request.getReason(), getCurrentUser(principal));
        return ResponseEntity.ok(assignment);
    }
}

