package com.citizen.service.dto;

import com.citizen.service.validation.ValidationPatterns;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Email(regexp = ValidationPatterns.EMAIL_REGEX, message = ValidationPatterns.EMAIL_ERROR_MESSAGE)
    private String email;

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    private String password;

    public LoginRequest() {
    }

    public String getEmail() {
        return email != null ? email.toLowerCase().trim() : null;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase().trim() : null;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
