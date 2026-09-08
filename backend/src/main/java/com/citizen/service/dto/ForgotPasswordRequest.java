package com.citizen.service.dto;

import com.citizen.service.validation.ValidationPatterns;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ForgotPasswordRequest {

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Email(regexp = ValidationPatterns.EMAIL_REGEX, message = ValidationPatterns.EMAIL_ERROR_MESSAGE)
    private String email;

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Size(min = 6, message = "Password must be at least 6 characters.")
    private String newPassword;

    public ForgotPasswordRequest() {
    }

    public String getEmail() {
        return email != null ? email.toLowerCase().trim() : null;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase().trim() : null;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
