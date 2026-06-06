package com.example.deploymentlab.repository;

import com.example.deploymentlab.model.DailyLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyLogRepository extends MongoRepository<DailyLog, String> {
    List<DailyLog> findByInternIdAndDateBetween(String internId, LocalDate startDate, LocalDate endDate);
    Optional<DailyLog> findByInternIdAndDate(String internId, LocalDate date);
}
