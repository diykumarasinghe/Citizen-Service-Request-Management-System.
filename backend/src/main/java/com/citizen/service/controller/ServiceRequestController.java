package com.citizen.service.controller;

import com.citizen.service.dto.*;
import com.citizen.service.entity.RequestStatus;
import com.citizen.service.service.ServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    public ServiceRequestController(ServiceRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    public ResponseEntity<ServiceRequestResponseDto> createRequest(
            @Valid @RequestBody CreateServiceRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        ServiceRequestResponseDto response = requestService.createRequest(dto, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestResponseDto>> getRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ServiceRequestResponseDto> list = requestService.getRequests(userDetails.getUsername(), status, category, search);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestResponseDto> getRequestById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ServiceRequestResponseDto response = requestService.getRequestById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequestResponseDto> updateRequestByCitizen(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        ServiceRequestResponseDto response = requestService.updateRequestByCitizen(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ServiceRequestResponseDto> updateRequestByAdmin(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateServiceRequestDto dto) {
        ServiceRequestResponseDto response = requestService.updateRequestByAdmin(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        requestService.deleteRequest(id, userDetails.getUsername());
        return ResponseEntity.ok(Collections.singletonMap("message", "Service request deleted successfully."));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        DashboardStatsDto stats = requestService.getDashboardStats(userDetails.getUsername());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ServiceRequestResponseDto>> getRecentRequests(@AuthenticationPrincipal UserDetails userDetails) {
        List<ServiceRequestResponseDto> recent = requestService.getRecentRequests(userDetails.getUsername());
        return ResponseEntity.ok(recent);
    }
}
