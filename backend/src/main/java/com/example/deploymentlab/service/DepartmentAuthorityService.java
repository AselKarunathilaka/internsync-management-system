package com.example.deploymentlab.service;

import com.example.deploymentlab.config.UserDetailsImpl;
import com.example.deploymentlab.model.Employee;
import com.example.deploymentlab.repository.EmployeeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentAuthorityService {

    private final EmployeeRepository employeeRepository;

    public DepartmentAuthorityService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public boolean isAdmin(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return false;
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    public Employee getEmployee(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            if (userDetails.getEmployeeId() != null) {
                return employeeRepository.findById(userDetails.getEmployeeId()).orElse(null);
            }
        }
        return null;
    }

    public boolean isActualGmOrDgm(Authentication auth, String department) {
        Employee emp = getEmployee(auth);
        if (emp == null) return false;

        String normDept = DepartmentHelper.normalizeDepartment(department);
        String empDept = DepartmentHelper.normalizeDepartment(emp.getDepartment());

        if (!normDept.equals(empDept)) return false;

        return "General Manager".equals(emp.getDesignation()) || "Deputy General Manager".equals(emp.getDesignation());
    }

    public boolean hasEntraProxyFull(Authentication auth, String department) {
        if (auth == null || !auth.isAuthenticated()) return false;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            List<String> entraRoles = userDetails.getEntraRoles();
            if (entraRoles == null || entraRoles.isEmpty()) return false;

            Employee emp = getEmployee(auth);
            if (emp == null) return false;

            String normDept = DepartmentHelper.normalizeDepartment(department);
            String empDept = DepartmentHelper.normalizeDepartment(emp.getDepartment());

            if (!normDept.equals(empDept)) return false;

            String code = DepartmentHelper.departmentCode(normDept);
            String requiredRole = "InternSync.Proxy." + code + ".Full";

            return entraRoles.contains(requiredRole);
        }
        return false;
    }

    public boolean canManageDepartmentInterns(Authentication auth, String department) {
        if (isAdmin(auth)) return true;
        return isActualGmOrDgm(auth, department) || hasEntraProxyFull(auth, department);
    }

    public boolean canAssignInternsToProject(Authentication auth, String department) {
        if (isAdmin(auth)) return true;
        return isActualGmOrDgm(auth, department) || hasEntraProxyFull(auth, department);
    }

    public boolean canUpdateStipend(Authentication auth, String department) {
        if (isAdmin(auth)) return true;
        return isActualGmOrDgm(auth, department) || hasEntraProxyFull(auth, department);
    }

    public boolean canViewDepartment(Authentication auth, String department) {
        if (isAdmin(auth)) return true;
        return isActualGmOrDgm(auth, department) || hasEntraProxyFull(auth, department);
    }

    public boolean canCreateOrEditProject(Authentication auth, String department) {
        if (isAdmin(auth)) return true;
        return isActualGmOrDgm(auth, department);
    }

    public boolean canDeleteProject(Authentication auth, String department) {
        if (isAdmin(auth)) return true;
        Employee emp = getEmployee(auth);
        if (emp == null) return false;
        String normDept = DepartmentHelper.normalizeDepartment(department);
        String empDept = DepartmentHelper.normalizeDepartment(emp.getDepartment());
        if (!normDept.equals(empDept)) return false;
        return "General Manager".equals(emp.getDesignation());
    }
}
