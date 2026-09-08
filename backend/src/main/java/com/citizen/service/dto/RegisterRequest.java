package com.citizen.service.dto;

import com.citizen.service.validation.ValidationPatterns;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Pattern(regexp = ValidationPatterns.NAME_REGEX, message = ValidationPatterns.NAME_ERROR_MESSAGE)
    private String firstName;

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Pattern(regexp = ValidationPatterns.NAME_REGEX, message = ValidationPatterns.NAME_ERROR_MESSAGE)
    private String lastName;

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Email(regexp = ValidationPatterns.EMAIL_REGEX, message = ValidationPatterns.EMAIL_ERROR_MESSAGE)
    private String email;

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Pattern(regexp = ValidationPatterns.PHONE_REGEX, message = ValidationPatterns.PHONE_ERROR_MESSAGE)
    private String phoneNumber;

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Size(min = 6, message = "Password must be at least 6 characters.")
    private String password;

    public RegisterRequest() {
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email != null ? email.toLowerCase().trim() : null;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase().trim() : null;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
