package com.citizen.service.config;

import com.citizen.service.entity.Category;
import com.citizen.service.entity.Role;
import com.citizen.service.entity.User;
import com.citizen.service.repository.CategoryRepository;
import com.citizen.service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    public AdminSeeder(UserRepository userRepository,
                       CategoryRepository categoryRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedAdminUser();
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = Arrays.asList(
                    new Category("Road Maintenance", "Potholes, road damage, and surface repairs"),
                    new Category("Water Supply", "Leaks, water pressure issues, and pipeline maintenance"),
                    new Category("Garbage Collection", "Waste management, missed pickups, and bin disposal"),
                    new Category("Street Light Repair", "Broken, dim, or flickering public street lights"),
                    new Category("Drainage Issue", "Clogged drains, flood risks, and sewage blocks"),
                    new Category("Public Safety", "Hazardous structures, public park issues, safety concerns"),
                    new Category("Other", "General inquiries and miscellaneous municipal service requests")
            );
            categoryRepository.saveAll(defaultCategories);
            logger.info("Default service request categories seeded successfully.");
        }
    }

    private void seedAdminUser() {
        String normalizedEmail = adminEmail.toLowerCase().trim();
        User admin = userRepository.findByEmailIgnoreCase(normalizedEmail).orElseGet(() -> {
            User u = new User();
            u.setFirstName("System");
            u.setLastName("Admin");
            u.setEmail(normalizedEmail);
            u.setPhoneNumber("0123456789");
            return u;
        });

        admin.setRole(Role.ROLE_ADMIN);
        admin.setActive(true);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        userRepository.save(admin);
        logger.info("Admin account successfully synchronized with credentials from .env for: {}", normalizedEmail);
    }
}
