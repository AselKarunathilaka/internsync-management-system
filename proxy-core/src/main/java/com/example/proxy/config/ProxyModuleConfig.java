package com.example.proxy.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "proxy.module")
public class ProxyModuleConfig {

    private boolean enabled = true;
    private String name = "InternSync Proxy Management";
    private boolean allowBulkAssignment = true;
    private boolean allowExpiryDate = true;

    // We can define defaults here if not set in properties
    private List<Map<String, String>> scopeTypes = List.of(
        Map.of("key", "DEPARTMENT", "label", "Department")
    );

    private List<Map<String, String>> proxyRoles = List.of(
        Map.of("key", "GM_DGM_DEPARTMENT_PROXY", "label", "GM/DGM Department Proxy")
    );

    private List<Map<String, String>> permissions = List.of(
        Map.of("key", ProxyPermissionConstants.VIEW_DEPARTMENT_INTERNS, "label", "View Department Interns"),
        Map.of("key", ProxyPermissionConstants.VIEW_DEPARTMENT_PROJECTS, "label", "View Department Projects"),
        Map.of("key", ProxyPermissionConstants.UPDATE_PAID_NON_PAID_STATUS, "label", "Update Paid/Non-Paid Status"),
        Map.of("key", ProxyPermissionConstants.ASSIGN_INTERN_TO_PROJECT, "label", "Assign Intern to Project"),
        Map.of("key", ProxyPermissionConstants.REMOVE_INTERN_FROM_PROJECT, "label", "Remove Intern From Project")
    );

    // Getters and Setters
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isAllowBulkAssignment() { return allowBulkAssignment; }
    public void setAllowBulkAssignment(boolean allowBulkAssignment) { this.allowBulkAssignment = allowBulkAssignment; }

    public boolean isAllowExpiryDate() { return allowExpiryDate; }
    public void setAllowExpiryDate(boolean allowExpiryDate) { this.allowExpiryDate = allowExpiryDate; }

    public List<Map<String, String>> getScopeTypes() { return scopeTypes; }
    public void setScopeTypes(List<Map<String, String>> scopeTypes) { this.scopeTypes = scopeTypes; }

    public List<Map<String, String>> getProxyRoles() { return proxyRoles; }
    public void setProxyRoles(List<Map<String, String>> proxyRoles) { this.proxyRoles = proxyRoles; }

    public List<Map<String, String>> getPermissions() { return permissions; }
    public void setPermissions(List<Map<String, String>> permissions) { this.permissions = permissions; }
}

