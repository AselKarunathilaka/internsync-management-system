package com.example.deploymentlab.proxy;

import com.example.deploymentlab.model.Employee;
import com.example.deploymentlab.model.User;
import com.example.deploymentlab.repository.EmployeeRepository;
import com.example.deploymentlab.repository.UserRepository;
import com.example.proxy.integration.HostUserDetails;
import com.example.proxy.integration.ProxyHostIntegration;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InternSyncProxyIntegration implements ProxyHostIntegration {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public InternSyncProxyIntegration(UserRepository userRepository, EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public boolean canManageProxyAssignments(String assignerId, String scopeType, String scopeValue) {
        HostUserDetails user = getUserDetails(assignerId);
        if (user == null) return false;

        if (user.getAuthorities().contains("ROLE_ADMIN")) {
            return true;
        }

        if (("General Manager".equals(user.getDesignation()) || "Deputy General Manager".equals(user.getDesignation())) 
            && "DEPARTMENT".equals(scopeType)) {
            
            Employee emp = getEmployeeForUser(assignerId);
            return emp != null && emp.getDepartment().equals(scopeValue);
        }

        return false;
    }

    @Override
    public boolean canAssignUserAsProxy(String assignerId, String targetUserId, String scopeType, String scopeValue) {
        HostUserDetails user = getUserDetails(assignerId);
        if (user == null) return false;

        if (user.getAuthorities().contains("ROLE_ADMIN")) {
            return true;
        }

        if ("DEPARTMENT".equals(scopeType)) {
            Employee assignerEmp = getEmployeeForUser(assignerId);
            Employee targetEmp = getEmployeeForUser(targetUserId);

            if (assignerEmp != null && targetEmp != null) {
                return assignerEmp.getDepartment().equals(scopeValue) && 
                       assignerEmp.getDepartment().equals(targetEmp.getDepartment());
            }
        }

        return false;
    }

    @Override
    public HostUserDetails getUserDetails(String userId) {
        // Try to find by MongoDB user ID first
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            // principal.getName() returns the JWT subject which is the USERNAME string —
            // try by username next (this is the most common path from @Principal)
            userOpt = userRepository.findByUsername(userId);
        }

        if (userOpt.isEmpty()) {
            // Maybe it's an employee number
            Optional<Employee> emp = employeeRepository.findByEmployeeNumber(userId);
            if (emp.isPresent() && emp.get().getUserId() != null) {
                userOpt = userRepository.findById(emp.get().getUserId());
            }
        }

        if (userOpt.isEmpty()) {
            // Maybe it's a MongoDB employee document ID
            Optional<Employee> emp = employeeRepository.findById(userId);
            if (emp.isPresent() && emp.get().getUserId() != null) {
                userOpt = userRepository.findById(emp.get().getUserId());
            }
        }

        if (userOpt.isPresent()) {
            User u = userOpt.get();
            HostUserDetails details = new HostUserDetails();
            details.setId(u.getId());
            details.setUsername(u.getUsername());
            details.setEmail(u.getEmail());
            
            List<String> roles = new ArrayList<>();
            if (u.getRole() != null) {
                roles.add("ROLE_" + u.getRole());
            }
            details.setAuthorities(roles);

            if (u.getEmployeeId() != null) {
                Optional<Employee> emp = employeeRepository.findById(u.getEmployeeId());
                if (emp.isPresent()) {
                    details.setDesignation(emp.get().getDesignation());
                    details.setEmployeeId(emp.get().getId());
                    details.setEmployeeNumber(emp.get().getEmployeeNumber()); // human-readable ID
                }
            }

            return details;
        }
        return null;
    }

    private Employee getEmployeeForUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getEmployeeId() != null) {
            return employeeRepository.findById(userOpt.get().getEmployeeId()).orElse(null);
        }
        return null;
    }
}
