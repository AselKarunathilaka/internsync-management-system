package com.example.deploymentlab.repository;

import com.example.deploymentlab.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    Boolean existsByProjectCode(String projectCode);
    
    @Query("{ 'assignedInternIds' : ?0 }")
    List<Project> findByAssignedInternId(String internId);

    List<Project> findByDepartment(String department);
}
