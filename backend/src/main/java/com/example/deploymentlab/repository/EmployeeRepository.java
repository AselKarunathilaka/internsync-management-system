package com.example.deploymentlab.repository;

import com.example.deploymentlab.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EmployeeRepository extends MongoRepository<Employee, String> {
    List<Employee> findByDepartment(String department);
    List<Employee> findByDesignationIgnoreCase(String designation);
}
