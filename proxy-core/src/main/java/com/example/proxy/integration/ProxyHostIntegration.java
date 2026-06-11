package com.example.proxy.integration;

public interface ProxyHostIntegration {
    
    /**
     * Determines if the assigning user is permitted to manage the proxy assignment for the specified scope.
     *
     * @param assignerId The user ID of the person making the assignment.
     * @param scopeType The type of scope (e.g., "DEPARTMENT").
     * @param scopeValue The value of the scope (e.g., "Digital Platforms").
     * @return true if authorized, false otherwise.
     */
    boolean canManageProxyAssignments(String assignerId, String scopeType, String scopeValue);

    /**
     * Determines if the assigning user is permitted to assign the specific target user as a proxy for the given scope.
     *
     * @param assignerId The user ID of the person making the assignment.
     * @param targetUserId The user ID of the person being assigned the proxy role.
     * @param scopeType The type of scope (e.g., "DEPARTMENT").
     * @param scopeValue The value of the scope (e.g., "Digital Platforms").
     * @return true if authorized, false otherwise.
     */
    boolean canAssignUserAsProxy(String assignerId, String targetUserId, String scopeType, String scopeValue);

    /**
     * Retrieves essential details about a user to populate audit logs and display fields.
     *
     * @param userId The ID of the user.
     * @return HostUserDetails object containing username, email, etc. Null if user not found.
     */
    HostUserDetails getUserDetails(String userId);
}

