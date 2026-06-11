package com.example.proxy.dto;

import jakarta.validation.constraints.NotBlank;

public class ReasonRequest {
    @NotBlank
    private String reason;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

