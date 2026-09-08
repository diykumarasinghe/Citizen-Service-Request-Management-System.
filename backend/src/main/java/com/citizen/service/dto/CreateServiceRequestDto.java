package com.citizen.service.dto;

import com.citizen.service.validation.ValidationPatterns;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateServiceRequestDto {

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    private String category;

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters.")
    private String description;

    @NotBlank(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @Size(min = 5, max = 250, message = "Location / Address must be between 5 and 250 characters.")
    private String location;

    @NotNull(message = ValidationPatterns.REQUIRED_ERROR_MESSAGE)
    @FutureOrPresent(message = ValidationPatterns.FUTURE_DATE_ERROR_MESSAGE)
    private LocalDate requiredServiceDate;

    public CreateServiceRequestDto() {
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getRequiredServiceDate() {
        return requiredServiceDate;
    }

    public void setRequiredServiceDate(LocalDate requiredServiceDate) {
        this.requiredServiceDate = requiredServiceDate;
    }
}
