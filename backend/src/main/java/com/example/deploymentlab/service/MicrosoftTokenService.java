package com.example.deploymentlab.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Collections;

@Service
public class MicrosoftTokenService {

    private final JwtDecoder jwtDecoder;
    private final String clientId;
    private final String issuerUri;

    public MicrosoftTokenService(
            @Value("${azure.issuer-uri}") String issuerUri,
            @Value("${azure.client-id}") String clientId) {
        this.issuerUri = issuerUri;
        this.clientId = clientId;
        if (issuerUri != null && !issuerUri.isEmpty() && !issuerUri.contains("com//v2.0")) {
            JwtDecoder tempDecoder = null;
            try {
                tempDecoder = NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
            } catch (Exception e) {
                System.err.println("Warning: Microsoft OAuth2 decoder failed to initialize. Azure Login will not work. Error: " + e.getMessage());
            }
            this.jwtDecoder = tempDecoder;
        } else {
            System.err.println("Warning: Microsoft OAuth2 is not fully configured (missing tenant ID). Azure Login will not work.");
            this.jwtDecoder = null;
        }
    }

    public MicrosoftUserInfo validateAndExtract(String idToken) {
        if (jwtDecoder == null) {
            throw new RuntimeException("Microsoft OAuth2 is not configured");
        }

        Jwt jwt;
        try {
            jwt = jwtDecoder.decode(idToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid Microsoft Token: " + e.getMessage());
        }

        if (!jwt.getAudience().contains(clientId)) {
            throw new RuntimeException("Invalid token audience");
        }
        
        if (!jwt.getIssuer().toString().equals(issuerUri)) {
            throw new RuntimeException("Invalid token issuer");
        }

        String oid = jwt.getClaimAsString("oid");
        
        String email = jwt.getClaimAsString("preferred_username");
        if (email == null || email.isEmpty()) {
            email = jwt.getClaimAsString("email");
        }
        if (email == null || email.isEmpty()) {
            email = jwt.getClaimAsString("upn");
        }
        if (email != null) {
            email = email.toLowerCase();
        }

        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles == null) {
            roles = Collections.emptyList();
        }

        return new MicrosoftUserInfo(oid, email, roles);
    }

    public record MicrosoftUserInfo(String oid, String email, List<String> roles) {}
}
