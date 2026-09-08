package com.citizen.service.dto;

import com.citizen.service.entity.RequestStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class AdminUpdateServiceRequestDto {

    private RequestStatus status;

    @Size(max = 100, message = "Assigned officer name cannot exceed 100 characters.")
    private String assignedOfficer;

    @Size(max = 1000, message = "Admin notes cannot exceed 1000 characters.")
    private String adminNotes;

    private String category;

    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters.")
    private String description;

    @Size(min = 5, max = 250, message = "Location / Address must be between 5 and 250 characters.")
    private String location;

    private LocalDate requiredServiceDate;

    public AdminUpdateServiceRequestDto() {
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
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
