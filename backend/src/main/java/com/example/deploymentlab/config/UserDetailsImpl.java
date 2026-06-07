package com.example.deploymentlab.config;

import com.example.deploymentlab.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
    private String id;
    private String username;
    private String email;
    private String password;
    private String internId;
    private String employeeId;
    private List<String> entraRoles;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(String id, String username, String email, String password, String internId, String employeeId,
                           List<String> entraRoles, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.internId = internId;
        this.employeeId = employeeId;
        this.entraRoles = entraRoles;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getInternId(),
                user.getEmployeeId(),
                List.of(),
                authorities);
    }

    public static UserDetailsImpl buildWithEntra(User user, List<String> entraRoles) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getInternId(),
                user.getEmployeeId(),
                entraRoles != null ? entraRoles : List.of(),
                authorities);
    }

    public List<String> getEntraRoles() {
        return entraRoles;
    }

    public void setEntraRoles(List<String> entraRoles) {
        this.entraRoles = entraRoles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getInternId() {
        return internId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
