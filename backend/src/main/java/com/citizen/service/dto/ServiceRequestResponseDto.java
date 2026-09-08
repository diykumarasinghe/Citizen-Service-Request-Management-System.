package com.citizen.service.dto;

import com.citizen.service.entity.RequestStatus;
import com.citizen.service.entity.ServiceRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ServiceRequestResponseDto {

    private Long id;
    private String requestId;
    private String citizenName;
    private String citizenEmail;
    private String phoneNumber;
    private String category;
    private String description;
    private String location;
    private LocalDate requiredServiceDate;
    private RequestStatus status;
    private String assignedOfficer;
    private String adminNotes;
    private Long userId;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    public ServiceRequestResponseDto() {
    }

    public static ServiceRequestResponseDto fromEntity(ServiceRequest req) {
        ServiceRequestResponseDto dto = new ServiceRequestResponseDto();
        dto.setId(req.getId());
        dto.setRequestId(req.getRequestId());
        dto.setCitizenName(req.getCitizenName());
        dto.setCitizenEmail(req.getCitizenEmail());
        dto.setPhoneNumber(req.getPhoneNumber());
        dto.setCategory(req.getCategory());
        dto.setDescription(req.getDescription());
        dto.setLocation(req.getLocation());
        dto.setRequiredServiceDate(req.getRequiredServiceDate());
        dto.setStatus(req.getStatus());
        dto.setAssignedOfficer(req.getAssignedOfficer());
        dto.setAdminNotes(req.getAdminNotes());
        if (req.getUser() != null) {
            dto.setUserId(req.getUser().getId());
        }
        dto.setCreatedDate(req.getCreatedDate());
        dto.setUpdatedDate(req.getUpdatedDate());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public void setCitizenName(String citizenName) {
        this.citizenName = citizenName;
    }

    public String getCitizenEmail() {
        return citizenEmail;
    }

    public void setCitizenEmail(String citizenEmail) {
        this.citizenEmail = citizenEmail;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
}
