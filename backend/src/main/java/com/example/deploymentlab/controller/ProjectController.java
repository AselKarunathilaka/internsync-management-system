package com.example.deploymentlab.controller;

import com.example.deploymentlab.config.UserDetailsImpl;
import com.example.deploymentlab.model.Project;
import com.example.deploymentlab.repository.ProjectRepository;
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

    public ProjectController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProject(@Valid @RequestBody Project project) {
        if (projectRepository.existsByProjectCode(project.getProjectCode())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Project code already exists."));
        }
        
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        Project savedProject = projectRepository.save(project);
        return new ResponseEntity<>(savedProject, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        Optional<Project> project = projectRepository.findById(id);
        return project.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> updateProject(@PathVariable String id, @Valid @RequestBody Project projectDetails) {
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/assign-interns")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignInterns(@PathVariable String id, @RequestBody Map<String, List<String>> payload) {
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            List<String> newInternIds = payload.get("internIds");
            if (newInternIds != null) {
                for(String internId : newInternIds) {
                    if (!project.getAssignedInternIds().contains(internId)) {
                        project.getAssignedInternIds().add(internId);
                    }
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeIntern(@PathVariable String id, @PathVariable String internId) {
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
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
}
