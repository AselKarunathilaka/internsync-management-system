package com.example.proxy.dto;

import java.util.List;

public class BulkProxyAssignmentResult {
    private int totalRequested;
    private int successCount;
    private int failureCount;
    private List<ResultDetail> results;

    public BulkProxyAssignmentResult(int totalRequested, int successCount, int failureCount, List<ResultDetail> results) {
        this.totalRequested = totalRequested;
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.results = results;
    }

    public int getTotalRequested() { return totalRequested; }
    public int getSuccessCount() { return successCount; }
    public int getFailureCount() { return failureCount; }
    public List<ResultDetail> getResults() { return results; }

    public static class ResultDetail {
        private String proxyUserId;
        private String status;
        private String message;

        public ResultDetail(String proxyUserId, String status, String message) {
            this.proxyUserId = proxyUserId;
            this.status = status;
            this.message = message;
        }

        public String getProxyUserId() { return proxyUserId; }
        public String getStatus() { return status; }
        public String getMessage() { return message; }
    }
}

