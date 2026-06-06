package com.example.deploymentlab.repository;

import com.example.deploymentlab.model.EmployeeTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EmployeeTaskRepository extends MongoRepository<EmployeeTask, String> {
    List<EmployeeTask> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
}
