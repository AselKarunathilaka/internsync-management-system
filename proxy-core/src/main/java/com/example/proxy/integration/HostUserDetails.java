package com.example.proxy.integration;

import java.util.List;

public class HostUserDetails {
    private String id;
    private String username;
    private String email;
    private String designation;
    private String employeeId;       // MongoDB _id of the linked Employee document
    private String employeeNumber;   // Human-readable employee number (e.g. 001234)
    private List<String> authorities;

    public HostUserDetails() {}

    public HostUserDetails(String id, String username, String email, String designation, List<String> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.designation = designation;
        this.authorities = authorities;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }

    public List<String> getAuthorities() { return authorities; }
    public void setAuthorities(List<String> authorities) { this.authorities = authorities; }
}

