package com.example.deploymentlab.model;

public enum DepartmentName {
    DIGITAL_PLATFORMS("Digital Platforms"),
    DIGITAL_LABS("Digital Labs"),
    HUMAN_CAPITAL("Human Capital");

    private final String displayName;

    DepartmentName(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static DepartmentName fromString(String text) {
        for (DepartmentName d : DepartmentName.values()) {
            if (d.displayName.equalsIgnoreCase(text) || d.name().equalsIgnoreCase(text)) {
                return d;
            }
        }
        return DIGITAL_PLATFORMS; // Default if not found, based on business rules
    }
}
