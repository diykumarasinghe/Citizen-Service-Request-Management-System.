package com.citizen.service.service;

import com.citizen.service.dto.*;
import com.citizen.service.entity.Role;
import com.citizen.service.entity.User;
import com.citizen.service.exception.BadRequestException;
import com.citizen.service.exception.ResourceNotFoundException;
import com.citizen.service.repository.UserRepository;
import com.citizen.service.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        // New registrations always receive the USER role. Public users can NEVER create ADMIN role.
        User user = new User(
                request.getFirstName().trim(),
                request.getLastName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber().trim(),
                Role.ROLE_USER
        );

        User savedUser = userRepository.save(user);

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        savedUser.getEmail(),
                        savedUser.getPassword(),
                        java.util.Collections.emptyList()
                );

        String token = jwtService.generateToken(userDetails, savedUser.getRole().name());
        return new AuthResponse(token, UserResponseDto.fromEntity(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        if (!user.isActive()) {
            throw new BadRequestException("Your account is currently inactive. Please contact an administrator.");
        }

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        java.util.Collections.emptyList()
                );

        String token = jwtService.generateToken(userDetails, user.getRole().name());
        return new AuthResponse(token, UserResponseDto.fromEntity(user));
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        // Safely check and update password without leaking user existence info
        userRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
        });

        return "If your email is registered in our system, your password has been reset successfully. You may now log in.";
    }

    public UserResponseDto getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponseDto.fromEntity(user);
    }
}
