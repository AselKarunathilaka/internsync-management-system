package com.example.deploymentlab.repository;

import com.example.deploymentlab.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByInternId(String internId);
    Boolean existsByEmployeeId(String employeeId);
    Optional<User> findByEmployeeId(String employeeId);
    Optional<User> findByInternId(String internId);
    Optional<User> findByEntraEmailIgnoreCase(String entraEmail);
    Optional<User> findByEntraObjectId(String entraObjectId);
    Optional<User> findByEmailIgnoreCase(String email);
}
