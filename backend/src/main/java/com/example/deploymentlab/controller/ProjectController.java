package com.example.deploymentlab.controller;

import com.example.deploymentlab.config.UserDetailsImpl;
import com.example.deploymentlab.model.Project;
import com.example.deploymentlab.model.Employee;
import com.example.deploymentlab.model.Intern;
import com.example.deploymentlab.model.InternAssignmentStatus;
import com.example.deploymentlab.repository.ProjectRepository;
import com.example.deploymentlab.repository.EmployeeRepository;
import com.example.deploymentlab.repository.InternRepository;
import com.example.deploymentlab.service.DepartmentAuthorityService;
import com.example.deploymentlab.service.DepartmentHelper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final InternRepository internRepository;
    private final DepartmentAuthorityService authorityService;

    public ProjectController(ProjectRepository projectRepository, EmployeeRepository employeeRepository, 
                             InternRepository internRepository, DepartmentAuthorityService authorityService) {
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
        this.internRepository = internRepository;
        this.authorityService = authorityService;
    }

    private boolean hasAdminRole(Authentication auth) {
        return authorityService.isAdmin(auth);
    }

    private Employee getEmployeeProfile(Authentication auth) {
        return authorityService.getEmployee(auth);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> createProject(@Valid @RequestBody Project project) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!authorityService.canCreateOrEditProject(auth, project.getDepartment())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to create projects in this department."));
        }

        if (projectRepository.existsByProjectCode(project.getProjectCode())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Project code already exists."));
        }
        
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        Project savedProject = projectRepository.save(project);
        return new ResponseEntity<>(savedProject, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'INTERN')")
    public ResponseEntity<?> getProjectById(@PathVariable String id) {
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Project project = optionalProject.get();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (hasAdminRole(auth)) {
            return ResponseEntity.ok(project);
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        // If INTERN, can only view their assigned projects
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_INTERN"))) {
            if (project.getAssignedInternIds() != null && project.getAssignedInternIds().contains(userDetails.getInternId())) {
                return ResponseEntity.ok(project);
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to view this project."));
        }
        
        // If EMPLOYEE
        Employee emp = getEmployeeProfile(auth);
        if (emp != null) {
            if (authorityService.canViewDepartment(auth, project.getDepartment())) {
                return ResponseEntity.ok(project);
            }
            
            // Regular employee assigned check
            if (project.getAssignedEmployeeIds() != null && project.getAssignedEmployeeIds().contains(emp.getId())) {
                return ResponseEntity.ok(project);
            }
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to view this project."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> updateProject(@PathVariable String id, @Valid @RequestBody Project projectDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            
            if (!authorityService.canCreateOrEditProject(auth, project.getDepartment())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to edit this project."));
            }

            // If changing department, check permission for the NEW department too
            if (!project.getDepartment().equalsIgnoreCase(projectDetails.getDepartment()) && !authorityService.canCreateOrEditProject(auth, projectDetails.getDepartment())) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You cannot move a project to a department you do not manage."));
            }

            // Don't update project code
            project.setProjectName(projectDetails.getProjectName());
            project.setDescription(projectDetails.getDescription());
            project.setSupervisor(projectDetails.getSupervisor());
            project.setDepartment(projectDetails.getDepartment());
            project.setStatus(projectDetails.getStatus());
            project.setStartDate(projectDetails.getStartDate());
            project.setEndDate(projectDetails.getEndDate());
            project.setUpdatedAt(LocalDateTime.now());
            
            return ResponseEntity.ok(projectRepository.save(project));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            if (!authorityService.canDeleteProject(auth, project.getDepartment())) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to delete this project."));
            }
            projectRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/assign-interns")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> assignInterns(@PathVariable String id, @RequestBody Map<String, List<String>> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            if (!authorityService.canAssignInternsToProject(auth, project.getDepartment())) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to manage this project."));
            }

            List<String> newInternIds = payload.get("internIds");
            if (newInternIds != null) {
                for(String internId : newInternIds) {
                    // Check if intern exists and is same department
                    Optional<Intern> intOpt = internRepository.findById(internId);
                    if (intOpt.isPresent()) {
                        if (!DepartmentHelper.normalizeDepartment(project.getDepartment()).equals(DepartmentHelper.normalizeDepartment(intOpt.get().getDepartment()))) {
                            continue;
                        }
                    } else {
                        continue;
                    }

                    if (!project.getAssignedInternIds().contains(internId)) {
                        project.getAssignedInternIds().add(internId);
                    }
                    // Sync the intern's own record
                    internRepository.findById(internId).ifPresent(intern -> {
                        if (!intern.getAssignedProjectIds().contains(id)) {
                            intern.getAssignedProjectIds().add(id);
                        }
                        intern.setAssignmentStatus(InternAssignmentStatus.ASSIGNED_TO_PROJECT);
                        intern.setUpdatedAt(LocalDateTime.now());
                        internRepository.save(intern);
                    });
                }
                project.setUpdatedAt(LocalDateTime.now());
                projectRepository.save(project);
            }
            return ResponseEntity.ok(project);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/remove-intern/{internId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> removeIntern(@PathVariable String id, @PathVariable String internId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            if (!authorityService.canAssignInternsToProject(auth, project.getDepartment())) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to manage this project."));
            }

            // Sync the intern's own record
            internRepository.findById(internId).ifPresent(intern -> {
                intern.getAssignedProjectIds().remove(id);
                if (intern.getAssignedProjectIds().isEmpty()) {
                    intern.setAssignmentStatus(InternAssignmentStatus.PENDING_MANAGER_REVIEW);
                }
                intern.setUpdatedAt(LocalDateTime.now());
                internRepository.save(intern);
            });

            if (project.getAssignedInternIds().contains(internId)) {
                project.getAssignedInternIds().remove(internId);
                project.setUpdatedAt(LocalDateTime.now());
                projectRepository.save(project);
            }
            return ResponseEntity.ok(project);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my-projects")
    @PreAuthorize("hasRole('INTERN')")
    public ResponseEntity<?> getMyProjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        String internId = userDetails.getInternId();
        if (internId == null || internId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: No intern profile associated with this user."));
        }

        List<Project> projects = projectRepository.findByAssignedInternId(internId);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/intern/{internId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<Project>> getProjectsByInternId(@PathVariable String internId) {
        List<Project> projects = projectRepository.findByAssignedInternId(internId);
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/{id}/assign-employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> assignEmployees(@PathVariable String id, @RequestBody Map<String, List<String>> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = optionalProject.get();
        if (!authorityService.canCreateOrEditProject(auth, project.getDepartment())) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to manage this project."));
        }

        List<String> newEmployeeIds = payload.get("employeeIds");
        if (newEmployeeIds != null) {
            for (String empId : newEmployeeIds) {
                Optional<Employee> empOpt = employeeRepository.findById(empId);
                if (empOpt.isPresent()) {
                    Employee emp = empOpt.get();
                    if (emp.getDesignation().equals("General Manager") || emp.getDesignation().equals("Deputy General Manager")) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Error: General Manager and Deputy General Manager cannot be assigned to projects."));
                    }
                    if (!project.getAssignedEmployeeIds().contains(empId)) {
                        project.getAssignedEmployeeIds().add(empId);
                    }
                }
            }
            project.setUpdatedAt(LocalDateTime.now());
            projectRepository.save(project);
        }
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}/remove-employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> removeEmployee(@PathVariable String id, @PathVariable String employeeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            if (!authorityService.canCreateOrEditProject(auth, project.getDepartment())) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to manage this project."));
            }

            if (project.getAssignedEmployeeIds().contains(employeeId)) {
                project.getAssignedEmployeeIds().remove(employeeId);
                project.setUpdatedAt(LocalDateTime.now());
                projectRepository.save(project);
            }
            return ResponseEntity.ok(project);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
