package com.citizen.service.service;

import com.citizen.service.dto.*;
import com.citizen.service.entity.RequestStatus;
import com.citizen.service.entity.Role;
import com.citizen.service.entity.ServiceRequest;
import com.citizen.service.entity.User;
import com.citizen.service.exception.BadRequestException;
import com.citizen.service.exception.ResourceNotFoundException;
import com.citizen.service.exception.UnauthorizedException;
import com.citizen.service.repository.ServiceRequestRepository;
import com.citizen.service.repository.UserRepository;
import com.citizen.service.validation.ValidationPatterns;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;

    private static final Pattern SEARCH_PATTERN = Pattern.compile(ValidationPatterns.SEARCH_REGEX);

    public ServiceRequestService(ServiceRequestRepository requestRepository,
                                 UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private void validateSearchTerm(String search) {
        if (search != null && !search.trim().isEmpty()) {
            if (!SEARCH_PATTERN.matcher(search).matches()) {
                throw new BadRequestException(ValidationPatterns.SEARCH_ERROR_MESSAGE);
            }
        }
    }

    private synchronized String generateRequestId() {
        long count = requestRepository.count() + 1;
        String reqId = String.format("CSR-%04d", count);
        while (requestRepository.existsByRequestId(reqId)) {
            count++;
            reqId = String.format("CSR-%04d", count);
        }
        return reqId;
    }

    @Transactional
    public ServiceRequestResponseDto createRequest(CreateServiceRequestDto dto, String userEmail) {
        User user = getUserByEmail(userEmail);

        if (dto.getRequiredServiceDate().isBefore(LocalDate.now())) {
            throw new BadRequestException(ValidationPatterns.FUTURE_DATE_ERROR_MESSAGE);
        }

        ServiceRequest request = new ServiceRequest();
        request.setRequestId(generateRequestId());
        request.setCitizenName(user.getFullName());
        request.setCitizenEmail(user.getEmail());
        request.setPhoneNumber(user.getPhoneNumber());
        request.setCategory(dto.getCategory().trim());
        request.setDescription(dto.getDescription().trim());
        request.setLocation(dto.getLocation().trim());
        request.setRequiredServiceDate(dto.getRequiredServiceDate());
        request.setStatus(RequestStatus.PENDING);
        request.setUser(user);

        ServiceRequest saved = requestRepository.save(request);
        return ServiceRequestResponseDto.fromEntity(saved);
    }

    public List<ServiceRequestResponseDto> getRequests(String userEmail, RequestStatus status, String category, String search) {
        validateSearchTerm(search);
        User user = getUserByEmail(userEmail);

        List<ServiceRequest> requests;
        if (user.getRole() == Role.ROLE_ADMIN) {
            requests = requestRepository.filterAdminRequests(status, category, search != null ? search.trim() : null);
        } else {
            requests = requestRepository.filterCitizenRequests(user, status, category, search != null ? search.trim() : null);
        }

        return requests.stream()
                .map(ServiceRequestResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ServiceRequestResponseDto getRequestById(Long id, String userEmail) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        User currentUser = getUserByEmail(userEmail);

        // Strict ownership check for citizens
        if (currentUser.getRole() != Role.ROLE_ADMIN && !request.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied: You can only view your own service requests.");
        }

        return ServiceRequestResponseDto.fromEntity(request);
    }

    @Transactional
    public ServiceRequestResponseDto updateRequestByCitizen(Long id, UpdateServiceRequestDto dto, String userEmail) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        User currentUser = getUserByEmail(userEmail);

        // Ownership verification
        if (!request.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied: You can only edit your own service requests.");
        }

        // Cannot edit if completed
        if (request.getStatus() == RequestStatus.COMPLETED) {
            throw new BadRequestException("Service requests cannot be edited once they are COMPLETED.");
        }

        if (dto.getRequiredServiceDate().isBefore(LocalDate.now())) {
            throw new BadRequestException(ValidationPatterns.FUTURE_DATE_ERROR_MESSAGE);
        }

        request.setCategory(dto.getCategory().trim());
        request.setDescription(dto.getDescription().trim());
        request.setLocation(dto.getLocation().trim());
        request.setRequiredServiceDate(dto.getRequiredServiceDate());

        ServiceRequest updated = requestRepository.save(request);
        return ServiceRequestResponseDto.fromEntity(updated);
    }

    @Transactional
    public ServiceRequestResponseDto updateRequestByAdmin(Long id, AdminUpdateServiceRequestDto dto) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        if (dto.getStatus() != null) {
            request.setStatus(dto.getStatus());
        }
        if (dto.getAssignedOfficer() != null) {
            request.setAssignedOfficer(dto.getAssignedOfficer().trim());
        }
        if (dto.getAdminNotes() != null) {
            request.setAdminNotes(dto.getAdminNotes().trim());
        }
        if (dto.getCategory() != null && !dto.getCategory().trim().isEmpty()) {
            request.setCategory(dto.getCategory().trim());
        }
        if (dto.getDescription() != null && !dto.getDescription().trim().isEmpty()) {
            request.setDescription(dto.getDescription().trim());
        }
        if (dto.getLocation() != null && !dto.getLocation().trim().isEmpty()) {
            request.setLocation(dto.getLocation().trim());
        }
        if (dto.getRequiredServiceDate() != null) {
            request.setRequiredServiceDate(dto.getRequiredServiceDate());
        }

        ServiceRequest updated = requestRepository.save(request);
        return ServiceRequestResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteRequest(Long id, String userEmail) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        User currentUser = getUserByEmail(userEmail);

        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            requestRepository.delete(request);
        } else {
            // Citizen trying to delete
            if (!request.getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("Access denied: You can only delete your own service requests.");
            }
            if (request.getStatus() == RequestStatus.COMPLETED) {
                throw new BadRequestException("Completed service requests cannot be deleted.");
            }
            requestRepository.delete(request);
        }
    }

    public DashboardStatsDto getDashboardStats(String userEmail) {
        User user = getUserByEmail(userEmail);
        DashboardStatsDto stats = new DashboardStatsDto();

        List<ServiceRequest> requests;
        if (user.getRole() == Role.ROLE_ADMIN) {
            stats.setTotalRequests(requestRepository.count());
            stats.setPendingRequests(requestRepository.countByStatus(RequestStatus.PENDING));
            stats.setInProgressRequests(requestRepository.countByStatus(RequestStatus.IN_PROGRESS));
            stats.setCompletedRequests(requestRepository.countByStatus(RequestStatus.COMPLETED));
            stats.setRejectedRequests(requestRepository.countByStatus(RequestStatus.REJECTED));
            stats.setTotalUsers(userRepository.count());
            requests = requestRepository.findAllByOrderByCreatedDateDesc();
        } else {
            stats.setTotalRequests(requestRepository.countByUser(user));
            stats.setPendingRequests(requestRepository.countByUserAndStatus(user, RequestStatus.PENDING));
            stats.setInProgressRequests(requestRepository.countByUserAndStatus(user, RequestStatus.IN_PROGRESS));
            stats.setCompletedRequests(requestRepository.countByUserAndStatus(user, RequestStatus.COMPLETED));
            stats.setRejectedRequests(requestRepository.countByUserAndStatus(user, RequestStatus.REJECTED));
            stats.setTotalUsers(0);
            requests = requestRepository.findByUserOrderByCreatedDateDesc(user);
        }

        // Category distribution
        Map<String, Long> categoryCount = requests.stream()
                .collect(Collectors.groupingBy(ServiceRequest::getCategory, Collectors.counting()));
        stats.setCategoryDistribution(categoryCount);

        // Monthly trends for recent 6 months
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, Long> trends = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            trends.put(month.format(monthFormatter), 0L);
        }

        for (ServiceRequest req : requests) {
            String monthKey = req.getCreatedDate().format(monthFormatter);
            if (trends.containsKey(monthKey)) {
                trends.put(monthKey, trends.get(monthKey) + 1);
            }
        }
        stats.setMonthlyTrends(trends);

        return stats;
    }

    public List<ServiceRequestResponseDto> getRecentRequests(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<ServiceRequest> recent;
        if (user.getRole() == Role.ROLE_ADMIN) {
            recent = requestRepository.findTop10ByOrderByCreatedDateDesc();
        } else {
            recent = requestRepository.findTop10ByUserOrderByCreatedDateDesc(user);
        }
        return recent.stream().map(ServiceRequestResponseDto::fromEntity).collect(Collectors.toList());
    }
}
