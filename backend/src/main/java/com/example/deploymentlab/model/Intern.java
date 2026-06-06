package com.example.deploymentlab.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "interns")
public class Intern {

    @Id
    private String id;

    @NotBlank(message = "Intern number is required")
    private String internNumber;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    private String university;
    private String phoneNumber;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, COMPLETED, TERMINATED

    private InternStipendType stipendType;
    private InternAssignmentStatus assignmentStatus;
    private String assignedManagerId;
    private List<String> assignedProjectIds = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Intern() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.stipendType = InternStipendType.PENDING;
        this.assignmentStatus = InternAssignmentStatus.PENDING_MANAGER_REVIEW;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInternNumber() { return internNumber; }
    public void setInternNumber(String internNumber) { this.internNumber = internNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public InternStipendType getStipendType() { return stipendType; }
    public void setStipendType(InternStipendType stipendType) { this.stipendType = stipendType; }

    public InternAssignmentStatus getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(InternAssignmentStatus assignmentStatus) { this.assignmentStatus = assignmentStatus; }

    public String getAssignedManagerId() { return assignedManagerId; }
    public void setAssignedManagerId(String assignedManagerId) { this.assignedManagerId = assignedManagerId; }

    public List<String> getAssignedProjectIds() { return assignedProjectIds; }
    public void setAssignedProjectIds(List<String> assignedProjectIds) { this.assignedProjectIds = assignedProjectIds; }
}
