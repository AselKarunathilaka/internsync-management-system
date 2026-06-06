package com.example.deploymentlab.controller;

import com.example.deploymentlab.config.UserDetailsImpl;
import com.example.deploymentlab.model.Employee;
import com.example.deploymentlab.model.Intern;
import com.example.deploymentlab.model.InternAssignmentStatus;
import com.example.deploymentlab.model.InternStipendType;
import com.example.deploymentlab.model.Project;
import com.example.deploymentlab.repository.EmployeeRepository;
import com.example.deploymentlab.repository.InternRepository;
import com.example.deploymentlab.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dgm")
@PreAuthorize("hasRole('EMPLOYEE')")
public class DgmController {

    private final InternRepository internRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;

    public DgmController(InternRepository internRepository, EmployeeRepository employeeRepository, ProjectRepository projectRepository) {
        this.internRepository = internRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
    }

    private Employee getDgmEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        if (userDetails.getEmployeeId() == null) {
            throw new RuntimeException("Logged in user is not associated with an Employee profile.");
        }

        Employee emp = employeeRepository.findById(userDetails.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee profile not found."));

        if (!"Deputy General Manager".equalsIgnoreCase(emp.getDesignation())) {
            throw new RuntimeException("Unauthorized: User is not a Deputy General Manager.");
        }

        return emp;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            Employee dgm = getDgmEmployee();
            String dept = dgm.getDepartment();

            List<Intern> deptInterns = internRepository.findAll().stream()
                    .filter(i -> dept.equalsIgnoreCase(i.getDepartment()))
                    .collect(Collectors.toList());

            long pendingInterns = deptInterns.stream().filter(i -> i.getAssignmentStatus() == InternAssignmentStatus.PENDING_MANAGER_REVIEW).count();
            long paidInterns = deptInterns.stream().filter(i -> i.getStipendType() == InternStipendType.PAID).count();
            long nonPaidInterns = deptInterns.stream().filter(i -> i.getStipendType() == InternStipendType.NON_PAID).count();

            List<Project> deptProjects = projectRepository.findAll().stream()
                    .filter(p -> dept.equalsIgnoreCase(p.getDepartment()) && "ACTIVE".equalsIgnoreCase(p.getStatus()))
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("department", dept);
            response.put("totalInterns", deptInterns.size());
            response.put("pendingInterns", pendingInterns);
            response.put("paidInterns", paidInterns);
            response.put("nonPaidInterns", nonPaidInterns);
            response.put("activeProjects", deptProjects.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/department-interns")
    public ResponseEntity<?> getDepartmentInterns() {
        try {
            Employee dgm = getDgmEmployee();
            String dept = dgm.getDepartment();

            List<Intern> deptInterns = internRepository.findAll().stream()
                    .filter(i -> dept.equalsIgnoreCase(i.getDepartment()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(deptInterns);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/department-projects")
    public ResponseEntity<?> getDepartmentProjects() {
        try {
            Employee dgm = getDgmEmployee();
            String dept = dgm.getDepartment();

            List<Project> deptProjects = projectRepository.findAll().stream()
                    .filter(p -> dept.equalsIgnoreCase(p.getDepartment()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(deptProjects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/department-employees")
    public ResponseEntity<?> getDepartmentEmployees() {
        try {
            Employee dgm = getDgmEmployee();
            String dept = dgm.getDepartment();

            List<Employee> deptEmployees = employeeRepository.findAll().stream()
                    .filter(e -> dept.equalsIgnoreCase(e.getDepartment()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(deptEmployees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}
