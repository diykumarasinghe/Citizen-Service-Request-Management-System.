package com.citizen.service.controller;

import com.citizen.service.dto.ChangeRoleDto;
import com.citizen.service.dto.UserResponseDto;
import com.citizen.service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<UserResponseDto> toggleActiveStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponseDto updated = userService.toggleActiveStatus(id, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponseDto> changeUserRole(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRoleDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponseDto updated = userService.changeUserRole(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteUser(id, userDetails.getUsername());
        return ResponseEntity.ok(Collections.singletonMap("message", "User deleted successfully."));
    }
}
