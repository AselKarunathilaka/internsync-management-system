package com.example.deploymentlab.repository;

import com.example.deploymentlab.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends MongoRepository<Employee, String> {
    List<Employee> findByDepartment(String department);
    List<Employee> findByDesignationIgnoreCase(String designation);
    boolean existsByEmail(String email);
    Optional<Employee> findByEmail(String email);
}
