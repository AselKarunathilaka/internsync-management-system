package com.example.deploymentlab.controller;

import com.example.deploymentlab.model.EmployeeTask;
import com.example.deploymentlab.repository.EmployeeTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employee-tasks")
public class EmployeeTaskController {

    @Autowired
    private EmployeeTaskRepository employeeTaskRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyTasks(@RequestParam String employeeId) {
        List<EmployeeTask> tasks = employeeTaskRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<?> saveTask(@RequestBody EmployeeTask task) {
        if (task.getEmployeeId() == null || task.getTitle() == null) {
            return ResponseEntity.badRequest().body("employeeId and title are required");
        }
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(employeeTaskRepository.save(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable String id, @RequestBody EmployeeTask updatedTask) {
        Optional<EmployeeTask> existing = employeeTaskRepository.findById(id);
        if (existing.isPresent()) {
            EmployeeTask task = existing.get();
            task.setTitle(updatedTask.getTitle() != null ? updatedTask.getTitle() : task.getTitle());
            task.setCompleted(updatedTask.isCompleted());
            task.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(employeeTaskRepository.save(task));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        employeeTaskRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
