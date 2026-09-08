package com.citizen.service.dto;

import com.citizen.service.entity.Role;
import jakarta.validation.constraints.NotNull;

public class ChangeRoleDto {

    @NotNull(message = "Role is required.")
    private Role role;

    public ChangeRoleDto() {
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
