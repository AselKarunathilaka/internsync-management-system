package com.example.proxy.repository;

import com.example.proxy.model.ProxyAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProxyAssignmentRepository extends MongoRepository<ProxyAssignment, String> {
    
    List<ProxyAssignment> findByProxyUserIdAndActiveTrueAndRemovedAtIsNull(String proxyUserId);
    
    List<ProxyAssignment> findByScopeTypeAndScopeValueAndRemovedAtIsNull(String scopeType, String scopeValue);
    
    Optional<ProxyAssignment> findByProxyUserIdAndScopeTypeAndScopeValueAndProxyRoleAndActiveTrueAndRemovedAtIsNull(
        String proxyUserId, String scopeType, String scopeValue, String proxyRole
    );

    List<ProxyAssignment> findByRemovedAtIsNull();
}

