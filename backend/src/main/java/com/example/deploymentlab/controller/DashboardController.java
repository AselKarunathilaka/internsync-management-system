package com.example.deploymentlab.controller;

import com.example.deploymentlab.dto.DashboardDTO;
import com.example.deploymentlab.model.Employee;
import com.example.deploymentlab.model.Intern;
import com.example.deploymentlab.model.Project;
import com.example.deploymentlab.repository.EmployeeRepository;
import com.example.deploymentlab.repository.InternRepository;
import com.example.deploymentlab.repository.ProjectRepository;
import com.example.deploymentlab.config.UserDetailsImpl;
import com.example.deploymentlab.service.DepartmentHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private InternRepository internRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private Employee getEmployeeProfile(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        if (userDetails.getEmployeeId() == null) return null;
        return employeeRepository.findById(userDetails.getEmployeeId()).orElse(null);
    }

    private DashboardDTO generateDashboardData(Employee emp) {
        String normalizedDept = DepartmentHelper.normalizeDepartment(emp.getDepartment());

        List<Intern> allInterns = internRepository.findAll();
        List<Project> allProjects = projectRepository.findAll();

        // Filter for department
        List<Intern> deptInterns = allInterns.stream()
                .filter(i -> DepartmentHelper.normalizeDepartment(i.getDepartment()).equals(normalizedDept))
                .collect(Collectors.toList());

        List<Project> deptProjects = allProjects.stream()
                .filter(p -> DepartmentHelper.normalizeDepartment(p.getDepartment()).equals(normalizedDept))
                .collect(Collectors.toList());

        DashboardDTO dto = new DashboardDTO();
        dto.setDepartment(normalizedDept);
        dto.setTotalInterns(deptInterns.size());

        dto.setPendingReviewCount(deptInterns.stream().filter(i -> i.getAssignmentStatus() != null && "PENDING_MANAGER_REVIEW".equals(i.getAssignmentStatus().name())).count());
        dto.setPaidInternCount(deptInterns.stream().filter(i -> i.getStipendType() != null && "PAID".equals(i.getStipendType().name())).count());
        dto.setNonPaidInternCount(deptInterns.stream().filter(i -> i.getStipendType() != null && "NON_PAID".equals(i.getStipendType().name())).count());
        dto.setPendingStipendCount(deptInterns.stream().filter(i -> i.getStipendType() == null || "PENDING".equals(i.getStipendType().name())).count());

        List<Project> activeProjects = deptProjects.stream().filter(p -> "ACTIVE".equals(p.getStatus())).collect(Collectors.toList());
        dto.setActiveProjectCount(activeProjects.size());
        dto.setActiveProjects(activeProjects);

        dto.setAssignedInternCount(deptInterns.stream().filter(i -> i.getAssignmentStatus() != null && "ASSIGNED_TO_PROJECT".equals(i.getAssignmentStatus().name())).count());
        dto.setUnassignedInternCount(deptInterns.stream().filter(i -> i.getAssignmentStatus() == null || "UNASSIGNED".equals(i.getAssignmentStatus().name())).count());

        Map<String, Long> bySpec = deptInterns.stream()
                .filter(i -> i.getSpecialization() != null)
                .collect(Collectors.groupingBy(Intern::getSpecialization, Collectors.counting()));
        dto.setInternsBySpecialization(bySpec);

        Map<String, Long> byStipend = deptInterns.stream()
                .collect(Collectors.groupingBy(i -> i.getStipendType() != null ? i.getStipendType().name() : "PENDING", Collectors.counting()));
        dto.setInternsByStipend(byStipend);

        Map<String, Long> byStatus = deptInterns.stream()
                .collect(Collectors.groupingBy(i -> i.getAssignmentStatus() != null ? i.getAssignmentStatus().name() : "UNKNOWN", Collectors.counting()));
        dto.setInternsByAssignmentStatus(byStatus);

        List<Intern> pendingInterns = deptInterns.stream()
                .filter(i -> i.getAssignmentStatus() != null && "PENDING_MANAGER_REVIEW".equals(i.getAssignmentStatus().name()))
                .limit(10)
                .collect(Collectors.toList());
        dto.setRecentPendingInterns(pendingInterns);

        List<Employee> deptEmployees = employeeRepository.findAll().stream()
                .filter(e -> DepartmentHelper.normalizeDepartment(e.getDepartment()).equals(normalizedDept))
                .collect(Collectors.toList());

        Map<String, Long> staffByDesignation = deptEmployees.stream()
                .filter(e -> e.getDesignation() != null)
                .collect(Collectors.groupingBy(Employee::getDesignation, Collectors.counting()));
        dto.setEmployeesByDesignation(staffByDesignation);

        return dto;
    }

    @GetMapping("/gm")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getGmDashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee emp = getEmployeeProfile(auth);
        if (emp == null || !"General Manager".equalsIgnoreCase(emp.getDesignation())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied: Only General Managers can access this dashboard."));
        }
        return ResponseEntity.ok(generateDashboardData(emp));
    }

    @GetMapping("/dgm")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getDgmDashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee emp = getEmployeeProfile(auth);
        if (emp == null || !"Deputy General Manager".equalsIgnoreCase(emp.getDesignation())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied: Only Deputy General Managers can access this dashboard."));
        }
        return ResponseEntity.ok(generateDashboardData(emp));
    }
}
