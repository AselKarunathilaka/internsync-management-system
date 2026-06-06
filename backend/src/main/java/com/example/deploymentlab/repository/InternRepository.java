package com.example.deploymentlab.repository;

import com.example.deploymentlab.model.Intern;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InternRepository extends MongoRepository<Intern, String> {
    List<Intern> findByInternNumber(String internNumber);
    List<Intern> findByDepartment(String department);
}
