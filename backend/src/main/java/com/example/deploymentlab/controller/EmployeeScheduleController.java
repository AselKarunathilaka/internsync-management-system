package com.example.deploymentlab.controller;

import com.example.deploymentlab.model.EmployeeSchedule;
import com.example.deploymentlab.repository.EmployeeScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/employee-schedules")
public class EmployeeScheduleController {

    @Autowired
    private EmployeeScheduleRepository employeeScheduleRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMySchedule(
            @RequestParam String employeeId, 
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<EmployeeSchedule> schedules = employeeScheduleRepository.findByEmployeeIdAndDateBetween(employeeId, start, end);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use YYYY-MM-DD");
        }
    }

    @PostMapping
    public ResponseEntity<?> saveSchedule(@RequestBody EmployeeSchedule schedule) {
        if (schedule.getEmployeeId() == null || schedule.getDate() == null) {
            return ResponseEntity.badRequest().body("employeeId and date are required");
        }
        
        List<EmployeeSchedule> existingList = employeeScheduleRepository.findByEmployeeIdAndDate(schedule.getEmployeeId(), schedule.getDate());
        
        if (!existingList.isEmpty()) {
            EmployeeSchedule scheduleToUpdate = existingList.get(0);
            scheduleToUpdate.setStatus(schedule.getStatus());
            scheduleToUpdate.setUpdatedAt(LocalDateTime.now());
            EmployeeSchedule saved = employeeScheduleRepository.save(scheduleToUpdate);
            
            // Delete duplicates if any
            if (existingList.size() > 1) {
                for (int i = 1; i < existingList.size(); i++) {
                    employeeScheduleRepository.delete(existingList.get(i));
                }
            }
            return ResponseEntity.ok(saved);
        }
        
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(employeeScheduleRepository.save(schedule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable String id) {
        employeeScheduleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
