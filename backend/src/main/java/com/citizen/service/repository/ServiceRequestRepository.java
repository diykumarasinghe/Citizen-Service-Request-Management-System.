package com.citizen.service.repository;

import com.citizen.service.entity.RequestStatus;
import com.citizen.service.entity.ServiceRequest;
import com.citizen.service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    Optional<ServiceRequest> findByRequestId(String requestId);

    boolean existsByRequestId(String requestId);

    List<ServiceRequest> findAllByOrderByCreatedDateDesc();

    List<ServiceRequest> findByUserOrderByCreatedDateDesc(User user);

    List<ServiceRequest> findTop10ByOrderByCreatedDateDesc();

    List<ServiceRequest> findTop10ByUserOrderByCreatedDateDesc(User user);

    long countByStatus(RequestStatus status);

    long countByUser(User user);

    long countByUserAndStatus(User user, RequestStatus status);

    @Query("SELECT r FROM ServiceRequest r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:category IS NULL OR :category = '' OR LOWER(r.category) = LOWER(:category)) AND " +
            "(:search IS NULL OR :search = '' OR " +
            " LOWER(r.requestId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.citizenName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.citizenEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY r.createdDate DESC")
    List<ServiceRequest> filterAdminRequests(
            @Param("status") RequestStatus status,
            @Param("category") String category,
            @Param("search") String search);

    @Query("SELECT r FROM ServiceRequest r WHERE r.user = :user AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:category IS NULL OR :category = '' OR LOWER(r.category) = LOWER(:category)) AND " +
            "(:search IS NULL OR :search = '' OR " +
            " LOWER(r.requestId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY r.createdDate DESC")
    List<ServiceRequest> filterCitizenRequests(
            @Param("user") User user,
            @Param("status") RequestStatus status,
            @Param("category") String category,
            @Param("search") String search);
}
