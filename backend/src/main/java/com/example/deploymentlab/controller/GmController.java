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
import com.example.deploymentlab.service.DepartmentAuthorityService;
import com.example.deploymentlab.service.DepartmentHelper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gm")
@PreAuthorize("hasRole('EMPLOYEE')")
public class GmController {

    private final InternRepository internRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final DepartmentAuthorityService authorityService;

    public GmController(InternRepository internRepository, EmployeeRepository employeeRepository, 
                        ProjectRepository projectRepository, DepartmentAuthorityService authorityService) {
        this.internRepository = internRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.authorityService = authorityService;
    }

    private Employee getDepartmentActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Employee emp = authorityService.getEmployee(auth);
        if (emp == null) {
            throw new RuntimeException("Logged in user is not associated with an Employee profile.");
        }
        return emp;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee actor = getDepartmentActor();
            String dept = actor.getDepartment();

            if (!authorityService.canViewDepartment(auth, dept)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to view this department."));
            }

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
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee actor = getDepartmentActor();
            String dept = actor.getDepartment();

            if (!authorityService.canViewDepartment(auth, dept)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to view this department."));
            }

            List<Intern> deptInterns = internRepository.findAll().stream()
                    .filter(i -> dept.equalsIgnoreCase(i.getDepartment()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(deptInterns);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pending-interns")
    public ResponseEntity<?> getPendingInterns() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee actor = getDepartmentActor();
            String dept = actor.getDepartment();

            if (!authorityService.canViewDepartment(auth, dept)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to view this department."));
            }

            List<Intern> pendingInterns = internRepository.findAll().stream()
                    .filter(i -> dept.equalsIgnoreCase(i.getDepartment()) && i.getAssignmentStatus() == InternAssignmentStatus.PENDING_MANAGER_REVIEW)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(pendingInterns);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/department-projects")
    public ResponseEntity<?> getDepartmentProjects() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee actor = getDepartmentActor();
            String dept = actor.getDepartment();

            if (!authorityService.canViewDepartment(auth, dept)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to view this department."));
            }

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
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee actor = getDepartmentActor();
            String dept = actor.getDepartment();

            if (!authorityService.canViewDepartment(auth, dept)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to view this department."));
            }

            List<Employee> deptEmployees = employeeRepository.findAll().stream()
                    .filter(e -> dept.equalsIgnoreCase(e.getDepartment()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(deptEmployees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/interns/{internId}/stipend-type")
    public ResponseEntity<?> updateStipendType(@PathVariable String internId, @RequestBody Map<String, String> body) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee actor = getDepartmentActor();
            String stipendTypeStr = body.get("stipendType");

            Optional<Intern> optionalIntern = internRepository.findById(internId);
            if (optionalIntern.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Intern not found."));
            }

            Intern intern = optionalIntern.get();
            if (!authorityService.canUpdateStipend(auth, intern.getDepartment())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized: Cannot update stipend for this department."));
            }
            if (!authorityService.isAdmin(auth) && !DepartmentHelper.normalizeDepartment(actor.getDepartment()).equals(DepartmentHelper.normalizeDepartment(intern.getDepartment()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized: Intern belongs to another department."));
            }

            try {
                InternStipendType type = InternStipendType.valueOf(stipendTypeStr);
                intern.setStipendType(type);
                intern.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(internRepository.save(intern));
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid stipend type. Must be PENDING, PAID, or NON_PAID."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/projects/{projectId}/assign-interns")
    public ResponseEntity<?> assignInternToProject(@PathVariable String projectId, @RequestBody Map<String, String> body) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee actor = getDepartmentActor();
            String internId = body.get("internId");

            Optional<Project> optionalProject = projectRepository.findById(projectId);
            if (optionalProject.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Project not found."));
            }

            Project project = optionalProject.get();
            if (!authorityService.canAssignInternsToProject(auth, project.getDepartment())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to manage this project."));
            }

            Optional<Intern> optionalIntern = internRepository.findById(internId);
            if (optionalIntern.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Intern not found."));
            }

            Intern intern = optionalIntern.get();
            if (!DepartmentHelper.normalizeDepartment(project.getDepartment()).equals(DepartmentHelper.normalizeDepartment(intern.getDepartment()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized: Intern belongs to another department."));
            }

            // Assign
            if (!project.getAssignedInternIds().contains(internId)) {
                project.getAssignedInternIds().add(internId);
                project.setUpdatedAt(LocalDateTime.now());
                projectRepository.save(project);
            }

            if (!intern.getAssignedProjectIds().contains(projectId)) {
                intern.getAssignedProjectIds().add(projectId);
            }
            intern.setAssignmentStatus(InternAssignmentStatus.ASSIGNED_TO_PROJECT);
            intern.setAssignedManagerId(actor.getId());
            intern.setUpdatedAt(LocalDateTime.now());
            internRepository.save(intern);

            return ResponseEntity.ok(Map.of("message", "Intern assigned to project successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/projects/{projectId}/remove-intern/{internId}")
    public ResponseEntity<?> removeInternFromProject(@PathVariable String projectId, @PathVariable String internId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            Optional<Project> optionalProject = projectRepository.findById(projectId);
            if (optionalProject.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Project not found."));
            }

            Project project = optionalProject.get();
            if (!authorityService.canAssignInternsToProject(auth, project.getDepartment())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to manage this project."));
            }

            Optional<Intern> optionalIntern = internRepository.findById(internId);
            if (optionalIntern.isPresent()) {
                Intern intern = optionalIntern.get();
                intern.getAssignedProjectIds().remove(projectId);
                
                // If intern has no other projects, change status back to pending
                if (intern.getAssignedProjectIds().isEmpty()) {
                    intern.setAssignmentStatus(InternAssignmentStatus.PENDING_MANAGER_REVIEW);
                }
                intern.setUpdatedAt(LocalDateTime.now());
                internRepository.save(intern);
            }

            if (project.getAssignedInternIds().contains(internId)) {
                project.getAssignedInternIds().remove(internId);
                project.setUpdatedAt(LocalDateTime.now());
                projectRepository.save(project);
            }

            return ResponseEntity.ok(Map.of("message", "Intern removed from project successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}
