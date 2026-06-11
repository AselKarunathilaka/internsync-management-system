package com.example.proxy.repository;

import com.example.proxy.model.ProxyAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProxyAuditLogRepository extends MongoRepository<ProxyAuditLog, String> {
    
    List<ProxyAuditLog> findByScopeTypeAndScopeValueOrderByTimestampDesc(String scopeType, String scopeValue);
    
    List<ProxyAuditLog> findAllByOrderByTimestampDesc();
    
    List<ProxyAuditLog> findByProxyUserIdOrderByTimestampDesc(String proxyUserId);

    List<ProxyAuditLog> findByScopeValueOrderByTimestampDesc(String scopeValue);
}


