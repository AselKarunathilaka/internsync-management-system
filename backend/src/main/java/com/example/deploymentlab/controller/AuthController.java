package com.example.deploymentlab.controller;

import com.example.deploymentlab.config.JwtUtils;
import com.example.deploymentlab.config.UserDetailsImpl;
import com.example.deploymentlab.model.Intern;
import com.example.deploymentlab.model.Employee;
import com.example.deploymentlab.model.PasswordResetToken;
import com.example.deploymentlab.model.User;
import com.example.deploymentlab.repository.InternRepository;
import com.example.deploymentlab.repository.EmployeeRepository;
import com.example.deploymentlab.repository.PasswordResetTokenRepository;
import com.example.deploymentlab.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final PasswordResetTokenRepository tokenRepository;
    private final InternRepository internRepository;
    private final EmployeeRepository employeeRepository;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PasswordEncoder encoder, JwtUtils jwtUtils, PasswordResetTokenRepository tokenRepository, 
                          InternRepository internRepository, EmployeeRepository employeeRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.tokenRepository = tokenRepository;
        this.internRepository = internRepository;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Resolve username from email if needed
        String username = loginRequest.getUsernameOrEmail();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
            if (userOpt.isPresent()) {
                username = userOpt.get().getUsername();
            } else {
                // Check if it's an employee number
                Optional<Employee> empOpt = employeeRepository.findByEmployeeNumber(username);
                if (empOpt.isPresent() && empOpt.get().getUserId() != null) {
                    Optional<User> uOpt = userRepository.findById(empOpt.get().getUserId());
                    if (uOpt.isPresent()) {
                        username = uOpt.get().getUsername();
                    }
                }
            }
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("id", userDetails.getId());
        response.put("username", userDetails.getUsername());
        response.put("email", userDetails.getEmail());
        response.put("roles", userDetails.getAuthorities());
        response.put("internId", userDetails.getInternId());
        response.put("employeeId", userDetails.getEmployeeId());

        if (userDetails.getEmployeeId() != null) {
            employeeRepository.findById(userDetails.getEmployeeId())
                .ifPresent(emp -> {
                    response.put("designation", emp.getDesignation());
                    response.put("department", emp.getDepartment());
                });
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email not found"));
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();

        // Delete existing token if any
        tokenRepository.deleteByUserId(user.getId());

        PasswordResetToken resetToken = new PasswordResetToken(user.getId(), token, LocalDateTime.now().plusHours(1));
        tokenRepository.save(resetToken);

        // Returning token in response for testing
        return ResponseEntity.ok(Map.of(
            "message", "Password reset token generated successfully.",
            "token", token
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(request.getToken());
        
        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Token is invalid or expired."));
        }

        PasswordResetToken resetToken = tokenOpt.get();
        Optional<User> userOpt = userRepository.findById(resetToken.getUserId());

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: User not found."));
        }

        User user = userOpt.get();
        user.setPasswordHash(encoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", userDetails.getId());
        response.put("username", userDetails.getUsername());
        response.put("email", userDetails.getEmail());
        response.put("roles", userDetails.getAuthorities());
        response.put("internId", userDetails.getInternId());
        response.put("employeeId", userDetails.getEmployeeId());

        if (userDetails.getEmployeeId() != null) {
            employeeRepository.findById(userDetails.getEmployeeId())
                .ifPresent(emp -> {
                    response.put("designation", emp.getDesignation());
                    response.put("department", emp.getDepartment());
                });
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();

        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
        }

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(encoder.encode(request.getPassword()));
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PostMapping("/create-intern-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createInternUser(@Valid @RequestBody CreateInternUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(encoder.encode(request.getPassword()));
        user.setRole("INTERN");
        user.setInternId(request.getInternId());
        
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Intern user registered successfully!"));
    }

    @PostMapping("/register-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerEmployeeUser(@Valid @RequestBody RegisterEmployeeRequest request) {
        if (request.isCreateLoginAccount()) {
            if (request.getUsername() == null || request.getUsername().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is required for login account!"));
            }
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Password is required for login account!"));
            }
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use for user account!"));
            }
        }

        if (employeeRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use for employee profile!"));
        }

        String empNum = request.getEmployeeNumber();
        if (empNum == null || empNum.trim().isEmpty() || !empNum.matches("^00\\d{4}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Employee Number must be exactly 6 digits starting with 00."));
        }
        if (employeeRepository.existsByEmployeeNumber(empNum)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Employee Number is already in use."));
        }

        // 1. Create Employee
        Employee employee = new Employee();
        employee.setEmployeeNumber(empNum);
        employee.setFullName(request.getFullName());
        employee.setEmail(request.getEmail());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());
        employee.setPhoneNumber(request.getPhoneNumber());
        
        // Handle specialization logic
        if (!request.getDesignation().equals("General Manager") && !request.getDesignation().equals("Deputy General Manager")) {
            employee.setSpecialization(request.getSpecialization());
        } else {
            employee.setSpecialization(null); // Ensure cleared for GM/DGM
        }

        Employee savedEmployee = employeeRepository.save(employee);

        if (request.isCreateLoginAccount()) {
            // 2. Create User
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPasswordHash(encoder.encode(request.getPassword()));
            user.setRole("EMPLOYEE");
            user.setEmployeeId(savedEmployee.getId());
            
            User savedUser = userRepository.save(user);

            // 3. Link User ID back to Employee
            savedEmployee.setUserId(savedUser.getId());
            employeeRepository.save(savedEmployee);
            return ResponseEntity.ok(Map.of("message", "Employee and user account registered successfully!"));
        }

        return ResponseEntity.ok(Map.of("message", "Employee registered successfully without login account!"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(encoder.encode(request.getPassword()));

        if ("INTERN".equalsIgnoreCase(request.getRole())) {
            if (request.getInternNumber() == null || request.getInternNumber().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Intern Number is required for Interns."));
            }
            java.util.List<Intern> interns = internRepository.findByInternNumber(request.getInternNumber());
            if (interns.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Invalid Intern Number. No matching intern profile found."));
            }
            Intern intern = interns.get(0);
            
            if (!intern.getEmail().equalsIgnoreCase(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: The email does not match the registered intern profile."));
            }
            
            if (userRepository.existsByInternId(intern.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: A login account already exists for this intern profile."));
            }
            
            user.setRole("INTERN");
            user.setInternId(intern.getId());
        } else if ("EMPLOYEE".equalsIgnoreCase(request.getRole())) {
            if (request.getEmployeeNumber() == null || request.getEmployeeNumber().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Employee Number is required for Employees."));
            }
            Optional<Employee> empOpt = employeeRepository.findByEmployeeNumber(request.getEmployeeNumber());
            if (empOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: Invalid Employee Number. No matching employee profile found."));
            }
            Employee employee = empOpt.get();

            if (!employee.getEmail().equalsIgnoreCase(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: The email does not match the registered employee profile."));
            }

            if (userRepository.existsByEmployeeId(employee.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Error: A login account already exists for this employee profile."));
            }

            user.setRole("EMPLOYEE");
            user.setEmployeeId(employee.getId());
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Public registration only allowed for INTERN or EMPLOYEE roles."));
        }

        User savedUser = userRepository.save(user);

        if ("EMPLOYEE".equalsIgnoreCase(request.getRole())) {
            Optional<Employee> empOpt = employeeRepository.findByEmployeeNumber(request.getEmployeeNumber());
            if (empOpt.isPresent()) {
                Employee e = empOpt.get();
                e.setUserId(savedUser.getId());
                employeeRepository.save(e);
            }
        }

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/register-employee-public")
    public ResponseEntity<?> registerEmployeePublicUser(@Valid @RequestBody RegisterEmployeePublicRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use for a login account!"));
        }

        Optional<Employee> optionalEmployee = employeeRepository.findByEmail(request.getEmail());
        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: No employee profile found with this email. Please contact an Administrator to create your employee profile first."));
        }

        Employee employee = optionalEmployee.get();
        
        if (userRepository.existsByEmployeeId(employee.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: A login account already exists for this employee profile."));
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

        return ResponseEntity.ok(Map.of("message", "Employee login account created successfully!"));
    }

    // DTOs
    public static class LoginRequest {
        @NotBlank
        private String usernameOrEmail;

        @NotBlank
        private String password;

        public String getUsernameOrEmail() { return usernameOrEmail; }
        public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ForgotPasswordRequest {
        @NotBlank
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordRequest {
        @NotBlank
        private String token;

        @NotBlank
        private String newPassword;

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class CreateInternUserRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String email;
        @NotBlank
        private String password;
        @NotBlank
        private String internId;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getInternId() { return internId; }
        public void setInternId(String internId) { this.internId = internId; }
    }

    public static class RegisterRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String email;
        @NotBlank
        private String password;
        @NotBlank
        private String role;
        
        private String internNumber;
        private String employeeNumber;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getInternNumber() { return internNumber; }
        public void setInternNumber(String internNumber) { this.internNumber = internNumber; }
        public String getEmployeeNumber() { return employeeNumber; }
        public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
    }

    public static class UpdateProfileRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String email;
        
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterEmployeeRequest {
        private String username;
        @NotBlank
        private String email;
        private String password;
        @NotBlank
        private String fullName;
        @NotBlank
        private String department;
        @NotBlank
        private String designation;
        
        private String employeeNumber;
        private String phoneNumber;
        private String specialization;
        private boolean createLoginAccount;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public boolean isCreateLoginAccount() { return createLoginAccount; }
        public void setCreateLoginAccount(boolean createLoginAccount) { this.createLoginAccount = createLoginAccount; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public String getEmployeeNumber() { return employeeNumber; }
        public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
    }

    public static class RegisterEmployeePublicRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String email;
        @NotBlank
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
