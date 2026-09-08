package com.citizen.service;

import com.citizen.service.dto.AuthResponse;
import com.citizen.service.dto.CreateServiceRequestDto;
import com.citizen.service.dto.RegisterRequest;
import com.citizen.service.dto.ServiceRequestResponseDto;
import com.citizen.service.entity.RequestStatus;
import com.citizen.service.service.AuthService;
import com.citizen.service.service.ServiceRequestService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

@SpringBootTest
@ActiveProfiles("test")
class CitizenServiceApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private ServiceRequestService requestService;

    @Test
    void contextLoads() {
        Assertions.assertNotNull(authService);
        Assertions.assertNotNull(requestService);
    }

    @Test
    void testRegisterAndCreateRequestFlow() {
        // 1. Register a new citizen
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setEmail("john.doe@example.com");
        registerRequest.setPhoneNumber("0712345678");
        registerRequest.setPassword("Secret123!");

        AuthResponse authResponse = authService.register(registerRequest);
        Assertions.assertNotNull(authResponse);
        Assertions.assertNotNull(authResponse.getToken());
        Assertions.assertEquals("john.doe@example.com", authResponse.getUser().getEmail());

        // 2. Submit a service request
        CreateServiceRequestDto requestDto = new CreateServiceRequestDto();
        requestDto.setCategory("Road Maintenance");
        requestDto.setDescription("Large pothole near the main street entrance.");
        requestDto.setLocation("123 Main Street, Sector 4");
        requestDto.setRequiredServiceDate(LocalDate.now().plusDays(2));

        ServiceRequestResponseDto responseDto = requestService.createRequest(requestDto, "john.doe@example.com");
        Assertions.assertNotNull(responseDto);
        Assertions.assertEquals(RequestStatus.PENDING, responseDto.getStatus());
        Assertions.assertTrue(responseDto.getRequestId().startsWith("CSR-"));
        Assertions.assertEquals("John Doe", responseDto.getCitizenName());

        // 3. Query requests for this citizen
        List<ServiceRequestResponseDto> list = requestService.getRequests("john.doe@example.com", null, null, null);
        Assertions.assertFalse(list.isEmpty());
        Assertions.assertEquals(responseDto.getId(), list.get(0).getId());
    }
}
