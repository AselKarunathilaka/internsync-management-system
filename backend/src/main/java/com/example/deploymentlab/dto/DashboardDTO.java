package com.example.deploymentlab.dto;

import com.example.deploymentlab.model.Intern;
import com.example.deploymentlab.model.Project;
import java.util.List;
import java.util.Map;

public class DashboardDTO {
    private String department;
    private long totalInterns;
    private long pendingReviewCount;
    private long paidInternCount;
    private long nonPaidInternCount;
    private long pendingStipendCount;
    private long activeProjectCount;
    private long assignedInternCount;
    private long unassignedInternCount;
    private Map<String, Long> internsBySpecialization;
    private Map<String, Long> internsByStipend;
    private Map<String, Long> internsByAssignmentStatus;
    private Map<String, Long> employeesByDesignation;
    private List<Intern> recentPendingInterns;
    private List<Project> activeProjects;

    public DashboardDTO() {}

    public Map<String, Long> getEmployeesByDesignation() { return employeesByDesignation; }
    public void setEmployeesByDesignation(Map<String, Long> employeesByDesignation) { this.employeesByDesignation = employeesByDesignation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public long getTotalInterns() { return totalInterns; }
    public void setTotalInterns(long totalInterns) { this.totalInterns = totalInterns; }

    public long getPendingReviewCount() { return pendingReviewCount; }
    public void setPendingReviewCount(long pendingReviewCount) { this.pendingReviewCount = pendingReviewCount; }

    public long getPaidInternCount() { return paidInternCount; }
    public void setPaidInternCount(long paidInternCount) { this.paidInternCount = paidInternCount; }

    public long getNonPaidInternCount() { return nonPaidInternCount; }
    public void setNonPaidInternCount(long nonPaidInternCount) { this.nonPaidInternCount = nonPaidInternCount; }

    public long getPendingStipendCount() { return pendingStipendCount; }
    public void setPendingStipendCount(long pendingStipendCount) { this.pendingStipendCount = pendingStipendCount; }

    public long getActiveProjectCount() { return activeProjectCount; }
    public void setActiveProjectCount(long activeProjectCount) { this.activeProjectCount = activeProjectCount; }

    public long getAssignedInternCount() { return assignedInternCount; }
    public void setAssignedInternCount(long assignedInternCount) { this.assignedInternCount = assignedInternCount; }

    public long getUnassignedInternCount() { return unassignedInternCount; }
    public void setUnassignedInternCount(long unassignedInternCount) { this.unassignedInternCount = unassignedInternCount; }

    public Map<String, Long> getInternsBySpecialization() { return internsBySpecialization; }
    public void setInternsBySpecialization(Map<String, Long> internsBySpecialization) { this.internsBySpecialization = internsBySpecialization; }

    public Map<String, Long> getInternsByStipend() { return internsByStipend; }
    public void setInternsByStipend(Map<String, Long> internsByStipend) { this.internsByStipend = internsByStipend; }

    public Map<String, Long> getInternsByAssignmentStatus() { return internsByAssignmentStatus; }
    public void setInternsByAssignmentStatus(Map<String, Long> internsByAssignmentStatus) { this.internsByAssignmentStatus = internsByAssignmentStatus; }

    public List<Intern> getRecentPendingInterns() { return recentPendingInterns; }
    public void setRecentPendingInterns(List<Intern> recentPendingInterns) { this.recentPendingInterns = recentPendingInterns; }

    public List<Project> getActiveProjects() { return activeProjects; }
    public void setActiveProjects(List<Project> activeProjects) { this.activeProjects = activeProjects; }
}
