package com.example.deploymentlab.repository;

import com.example.deploymentlab.model.EmployeeSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface EmployeeScheduleRepository extends MongoRepository<EmployeeSchedule, String> {
    List<EmployeeSchedule> findByEmployeeIdAndDateBetween(String employeeId, LocalDate startDate, LocalDate endDate);
    List<EmployeeSchedule> findByEmployeeIdAndDate(String employeeId, LocalDate date);
}
