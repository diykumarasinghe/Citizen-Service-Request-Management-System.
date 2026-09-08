package com.citizen.service.service;

import com.citizen.service.dto.ProfileUpdateDto;
import com.citizen.service.dto.UserResponseDto;
import com.citizen.service.entity.User;
import com.citizen.service.exception.BadRequestException;
import com.citizen.service.exception.ResourceNotFoundException;
import com.citizen.service.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("image/jpeg", "image/png", "image/jpg");
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponseDto getProfile(String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        return UserResponseDto.fromEntity(user);
    }

    @Transactional
    public UserResponseDto updateProfile(String currentEmail, ProfileUpdateDto dto) {
        User user = userRepository.findByEmailIgnoreCase(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentEmail));

        String newEmail = dto.getEmail().toLowerCase().trim();

        // Check if new email is used by another user
        userRepository.findByEmailIgnoreCase(newEmail).ifPresent(existing -> {
            if (!existing.getId().equals(user.getId())) {
                throw new BadRequestException("This email address is already in use by another account.");
            }
        });

        user.setFirstName(dto.getFirstName().trim());
        user.setLastName(dto.getLastName().trim());
        user.setEmail(newEmail);
        user.setPhoneNumber(dto.getPhoneNumber().trim());
        // User cannot change their own role!

        User updated = userRepository.save(user);
        return UserResponseDto.fromEntity(updated);
    }

    @Transactional
    public UserResponseDto uploadAvatar(String userEmail, MultipartFile file) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload.");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_EXTENSIONS.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Only JPG, JPEG, and PNG images are allowed.");
        }

        // Validate size (2MB)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds the 2MB limit.");
        }

        try {
            byte[] bytes = file.getBytes();
            String base64Avatar = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(bytes);
            user.setAvatar(base64Avatar);
            User updated = userRepository.save(user);
            return UserResponseDto.fromEntity(updated);
        } catch (IOException e) {
            throw new BadRequestException("Failed to read image file. Please try again.");
        }
    }
}
