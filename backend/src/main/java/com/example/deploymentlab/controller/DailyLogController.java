package com.example.deploymentlab.controller;

import com.example.deploymentlab.model.DailyLog;
import com.example.deploymentlab.repository.DailyLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/daily-logs")
public class DailyLogController {

    @Autowired
    private DailyLogRepository dailyLogRepository;

    @GetMapping("/my-logs")
    public ResponseEntity<?> getMyLogs(
            @RequestParam String internId, 
            @RequestParam String month) { // Format: YYYY-MM
        try {
            YearMonth yearMonth = YearMonth.parse(month);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();
            List<DailyLog> logs = dailyLogRepository.findByInternIdAndDateBetween(internId, startDate, endDate);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid month format. Use YYYY-MM");
        }
    }

    @PostMapping
    public ResponseEntity<?> saveLog(@RequestBody DailyLog dailyLog) {
        if (dailyLog.getInternId() == null || dailyLog.getDate() == null) {
            return ResponseEntity.badRequest().body("internId and date are required");
        }
        
        Optional<DailyLog> existing = dailyLogRepository.findByInternIdAndDate(dailyLog.getInternId(), dailyLog.getDate());
        
        if (existing.isPresent()) {
            DailyLog logToUpdate = existing.get();
            logToUpdate.setStatus(dailyLog.getStatus());
            logToUpdate.setTaskStack(dailyLog.getTaskStack());
            logToUpdate.setTasksCompleted(dailyLog.getTasksCompleted());
            logToUpdate.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(dailyLogRepository.save(logToUpdate));
        }
        
        dailyLog.setCreatedAt(LocalDateTime.now());
        dailyLog.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(dailyLogRepository.save(dailyLog));
    }
}
