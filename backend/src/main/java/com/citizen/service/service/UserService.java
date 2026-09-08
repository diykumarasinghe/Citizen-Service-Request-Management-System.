package com.citizen.service.service;

import com.citizen.service.dto.ChangeRoleDto;
import com.citizen.service.dto.UserResponseDto;
import com.citizen.service.entity.Role;
import com.citizen.service.entity.User;
import com.citizen.service.exception.BadRequestException;
import com.citizen.service.exception.ResourceNotFoundException;
import com.citizen.service.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponseDto.fromEntity(user);
    }

    @Transactional
    public UserResponseDto toggleActiveStatus(Long id, String adminEmail) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Rule: Do not allow an admin to deactivate themselves
        if (targetUser.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new BadRequestException("You cannot deactivate your own account.");
        }

        targetUser.setActive(!targetUser.isActive());
        User updated = userRepository.save(targetUser);
        return UserResponseDto.fromEntity(updated);
    }

    @Transactional
    public UserResponseDto changeUserRole(Long id, ChangeRoleDto dto, String adminEmail) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Rule: Do not allow an admin to remove their own ADMIN role
        if (targetUser.getEmail().equalsIgnoreCase(adminEmail) && dto.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You cannot remove your own ADMIN role.");
        }

        targetUser.setRole(dto.getRole());
        User updated = userRepository.save(targetUser);
        return UserResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteUser(Long id, String adminEmail) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Rule: Do not allow an admin to delete themselves
        if (targetUser.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new BadRequestException("You cannot delete your own account.");
        }

        userRepository.delete(targetUser);
    }
}
