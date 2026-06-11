package com.example.proxy.service;

import com.example.proxy.config.ProxyModuleConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProxyConfigService {

    private final ProxyModuleConfig proxyModuleConfig;

    @Value("${proxy.access.source:INTERNAL}")
    private String activeSource;

    public ProxyConfigService(ProxyModuleConfig proxyModuleConfig) {
        this.proxyModuleConfig = proxyModuleConfig;
    }

    public Map<String, Object> getProxyConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("moduleName", proxyModuleConfig.getName());
        config.put("enabled", proxyModuleConfig.isEnabled());
        config.put("activeSource", activeSource);
        config.put("allowBulkAssignment", proxyModuleConfig.isAllowBulkAssignment());
        config.put("allowExpiryDate", proxyModuleConfig.isAllowExpiryDate());
        config.put("scopeTypes", proxyModuleConfig.getScopeTypes());
        config.put("proxyRoles", proxyModuleConfig.getProxyRoles());
        config.put("permissions", proxyModuleConfig.getPermissions());

        return config;
    }
}

