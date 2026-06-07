package com.example.deploymentlab.controller;

import com.example.deploymentlab.model.Employee;
import com.example.deploymentlab.repository.EmployeeRepository;
import com.example.deploymentlab.model.Project;
import com.example.deploymentlab.repository.ProjectRepository;
import com.example.deploymentlab.model.User;
import com.example.deploymentlab.repository.UserRepository;
import com.example.deploymentlab.config.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    public EmployeeController(EmployeeRepository employeeRepository, ProjectRepository projectRepository, UserRepository userRepository, PasswordEncoder encoder) {
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    private boolean hasAdminRole(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private Employee getEmployeeProfile(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        if (userDetails.getEmployeeId() == null) return null;
        return employeeRepository.findById(userDetails.getEmployeeId()).orElse(null);
    }

    private boolean canManageEmployee(Authentication auth, String targetDepartment) {
        if (hasAdminRole(auth)) return true;
        Employee emp = getEmployeeProfile(auth);
        if (emp == null) return false;
        
        boolean isManager = "General Manager".equalsIgnoreCase(emp.getDesignation()) || "Deputy General Manager".equalsIgnoreCase(emp.getDesignation());
        return isManager && emp.getDepartment().equalsIgnoreCase(targetDepartment);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/supervisors")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Employee> getAllSupervisors() {
        // Find all employees with designation 'Supervisor'
        return employeeRepository.findByDesignationIgnoreCase("Supervisor");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> createEmployee(@Valid @RequestBody Employee employee) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!canManageEmployee(auth, employee.getDepartment())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to create employees in this department."));
        }

        // Enforce specialization rules
        if (!employee.getDesignation().equals("General Manager") && !employee.getDesignation().equals("Deputy General Manager")) {
            if (employee.getSpecialization() == null || employee.getSpecialization().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Specialization is required for this designation.");
            }
        } else {
            employee.setSpecialization(null); // Clear it
        }
        
        employee.setCreatedAt(LocalDateTime.now());
        employee.setUpdatedAt(LocalDateTime.now());
        Employee savedEmployee = employeeRepository.save(employee);
        return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        Optional<Employee> employee = employeeRepository.findById(id);
        return employee.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> updateEmployee(@PathVariable String id, @Valid @RequestBody Employee employeeDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<Employee> optionalEmployee = employeeRepository.findById(id);
        if (optionalEmployee.isPresent()) {
            Employee employee = optionalEmployee.get();
            
            if (!canManageEmployee(auth, employee.getDepartment())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to edit this employee."));
            }

            if (!employee.getDepartment().equalsIgnoreCase(employeeDetails.getDepartment()) && !canManageEmployee(auth, employeeDetails.getDepartment())) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You cannot move an employee to a department you do not manage."));
            }

            employee.setFullName(employeeDetails.getFullName());
            employee.setEmail(employeeDetails.getEmail());
            employee.setDepartment(employeeDetails.getDepartment());
            employee.setDesignation(employeeDetails.getDesignation());
            employee.setPhoneNumber(employeeDetails.getPhoneNumber());
            
            // Enforce specialization rules
            if (!employeeDetails.getDesignation().equals("General Manager") && !employeeDetails.getDesignation().equals("Deputy General Manager")) {
                if (employeeDetails.getSpecialization() == null || employeeDetails.getSpecialization().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Specialization is required for this designation.");
                }
                employee.setSpecialization(employeeDetails.getSpecialization());
            } else {
                employee.setSpecialization(null);
            }

            employee.setUpdatedAt(LocalDateTime.now());
            
            return ResponseEntity.ok(employeeRepository.save(employee));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> deleteEmployee(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<Employee> optionalEmployee = employeeRepository.findById(id);
        
        if (optionalEmployee.isPresent()) {
            Employee employee = optionalEmployee.get();
            if (!canManageEmployee(auth, employee.getDepartment())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Error: You do not have permission to delete this employee."));
            }
            employeeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/create-account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createEmployeeAccount(@PathVariable String id, @Valid @RequestBody CreateAccountRequest request) {
        Optional<Employee> optionalEmployee = employeeRepository.findById(id);
        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found."));
        }

        Employee employee = optionalEmployee.get();

        if (userRepository.existsByEmployeeId(employee.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "An account already exists for this employee."));
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use for a login account."));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(encoder.encode(request.getPassword()));
        user.setRole("EMPLOYEE");
        user.setEmployeeId(employee.getId());
        User savedUser = userRepository.save(user);

        // Link User ID back to Employee
        employee.setUserId(savedUser.getId());
        employeeRepository.save(employee);

        return ResponseEntity.ok(Map.of("message", "Login account created successfully for employee."));
    }

    public static class CreateAccountRequest {
        @jakarta.validation.constraints.NotBlank
        private String username;
        @jakarta.validation.constraints.NotBlank
        private String email;
        @jakarta.validation.constraints.NotBlank
        private String password;
        @jakarta.validation.constraints.NotBlank
        private String confirmPassword;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        String employeeId = userDetails.getEmployeeId();

        if (employeeId == null) {
            return ResponseEntity.badRequest().body("User is not linked to an employee profile.");
        }

        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(employeeOpt.get());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> updateMyProfile(@RequestBody Employee updateRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        String employeeId = userDetails.getEmployeeId();

        if (employeeId == null) {
            return ResponseEntity.badRequest().body("User is not linked to an employee profile. Please ask an Admin to link your profile first.");
        }

        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Employee employee = employeeOpt.get();
        if (updateRequest.getFullName() != null) employee.setFullName(updateRequest.getFullName());
        if (updateRequest.getEmail() != null) employee.setEmail(updateRequest.getEmail());
        if (updateRequest.getPhoneNumber() != null) employee.setPhoneNumber(updateRequest.getPhoneNumber());
        employee.setUpdatedAt(LocalDateTime.now());
        
        Employee savedEmployee = employeeRepository.save(employee);

        // Sync with User document to ensure JWT and global identity reflect changes immediately
        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean userChanged = false;
            if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
                user.setEmail(updateRequest.getEmail());
                userChanged = true;
            }
            if (updateRequest.getFullName() != null && !updateRequest.getFullName().equals(user.getUsername())) {
                user.setUsername(updateRequest.getFullName());
                userChanged = true;
            }
            if (userChanged) {
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            }
        }

        return ResponseEntity.ok(savedEmployee);
    }

    @GetMapping("/me/projects")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getMyProjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        String employeeId = userDetails.getEmployeeId();

        if (employeeId == null) {
            return ResponseEntity.badRequest().body("User is not linked to an employee profile.");
        }

        List<Project> projects = projectRepository.findAll().stream()
                .filter(p -> p.getAssignedEmployeeIds() != null && p.getAssignedEmployeeIds().contains(employeeId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}/projects")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<?> getEmployeeProjects(@PathVariable String id) {
        List<Project> projects = projectRepository.findAll().stream()
                .filter(p -> p.getAssignedEmployeeIds() != null && p.getAssignedEmployeeIds().contains(id))
                .collect(Collectors.toList());

        return ResponseEntity.ok(projects);
    }
}
