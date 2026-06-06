package com.example.deploymentlab.service;

import com.example.deploymentlab.model.DepartmentName;

public class DepartmentHelper {

    public static DepartmentName resolveDepartmentFromSpecialization(String specialization) {
        if (specialization == null || specialization.trim().isEmpty()) {
            return DepartmentName.DIGITAL_PLATFORMS;
        }

        String spec = specialization.trim().toUpperCase();

        switch (spec) {
            case "AI":
                return DepartmentName.DIGITAL_LABS;
            case "BA":
            case "OTHER":
                return DepartmentName.HUMAN_CAPITAL;
            default:
                // MERN, QA, Cloud, CICD, C#, Flutter, FullStack, JAVA, PHP, PM, etc.
                return DepartmentName.DIGITAL_PLATFORMS;
        }
    }
}
