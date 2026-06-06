package com.example.deploymentlab.controller;

import com.example.deploymentlab.config.UserDetailsImpl;
import com.example.deploymentlab.model.Intern;
import com.example.deploymentlab.repository.InternRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/interns")
public class InternController {

    private final InternRepository internRepository;

    public InternController(InternRepository internRepository) {
        this.internRepository = internRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Intern> getAllInterns() {
        return internRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'INTERN')")
    public ResponseEntity<Intern> getInternById(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        // If INTERN, can only view their own
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_INTERN"))) {
            if (userDetails.getInternId() == null || !userDetails.getInternId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        Optional<Intern> intern = internRepository.findById(id);
        return intern.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Intern> searchInternByNumber(@RequestParam String internNumber) {
        return internRepository.findByInternNumber(internNumber);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Intern> createIntern(@Valid @RequestBody Intern intern) {
        intern.setCreatedAt(LocalDateTime.now());
        intern.setUpdatedAt(LocalDateTime.now());
        Intern savedIntern = internRepository.save(intern);
        return new ResponseEntity<>(savedIntern, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Intern> updateIntern(@PathVariable String id, @Valid @RequestBody Intern internDetails) {
        Optional<Intern> optionalIntern = internRepository.findById(id);
        if (optionalIntern.isPresent()) {
            Intern intern = optionalIntern.get();
            intern.setInternNumber(internDetails.getInternNumber());
            intern.setFullName(internDetails.getFullName());
            intern.setEmail(internDetails.getEmail());
            intern.setDepartment(internDetails.getDepartment());
            intern.setSpecialization(internDetails.getSpecialization());
            intern.setUniversity(internDetails.getUniversity());
            intern.setPhoneNumber(internDetails.getPhoneNumber());
            intern.setStartDate(internDetails.getStartDate());
            intern.setEndDate(internDetails.getEndDate());
            intern.setStatus(internDetails.getStatus());
            intern.setUpdatedAt(LocalDateTime.now());
            
            return ResponseEntity.ok(internRepository.save(intern));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteIntern(@PathVariable String id) {
        if (internRepository.existsById(id)) {
            internRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
