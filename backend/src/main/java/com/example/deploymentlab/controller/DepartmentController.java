package com.example.deploymentlab.controller;

import com.example.deploymentlab.model.Department;
import com.example.deploymentlab.model.Employee;
import com.example.deploymentlab.repository.DepartmentRepository;
import com.example.deploymentlab.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentController(DepartmentRepository departmentRepository, EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    private boolean hasAdminOrManagerRole(org.springframework.security.core.Authentication auth) {
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }
        com.example.deploymentlab.config.UserDetailsImpl userDetails = (com.example.deploymentlab.config.UserDetailsImpl) auth.getPrincipal();
        if (userDetails.getEmployeeId() == null) return false;
        
        Optional<Employee> empOpt = employeeRepository.findById(userDetails.getEmployeeId());
        if (empOpt.isPresent()) {
            String desig = empOpt.get().getDesignation();
            return "General Manager".equalsIgnoreCase(desig) || "Deputy General Manager".equalsIgnoreCase(desig);
        }
        return false;
    }

    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> createDepartment(@Valid @RequestBody Department department) {
        if (!hasAdminOrManagerRole(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: Only Admins or Managers can create departments."));
        }
        if (departmentRepository.existsByName(department.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Department name already exists."));
        }
        
        department.setCreatedAt(LocalDateTime.now());
        department.setUpdatedAt(LocalDateTime.now());
        Department savedDepartment = departmentRepository.save(department);
        return new ResponseEntity<>(savedDepartment, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable String id) {
        Optional<Department> department = departmentRepository.findById(id);
        return department.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> updateDepartment(@PathVariable String id, @Valid @RequestBody Department departmentDetails) {
        if (!hasAdminOrManagerRole(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: Only Admins or Managers can update departments."));
        }
        Optional<Department> optionalDepartment = departmentRepository.findById(id);
        if (optionalDepartment.isPresent()) {
            Department department = optionalDepartment.get();
            department.setName(departmentDetails.getName());
            department.setDescription(departmentDetails.getDescription());
            department.setGmId(departmentDetails.getGmId());
            department.setDeputyGmId(departmentDetails.getDeputyGmId());
            department.setUpdatedAt(LocalDateTime.now());
            
            return ResponseEntity.ok(departmentRepository.save(department));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> deleteDepartment(@PathVariable String id) {
        if (!hasAdminOrManagerRole(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: Only Admins or Managers can delete departments."));
        }
        if (departmentRepository.existsById(id)) {
            departmentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
