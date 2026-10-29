package com.retail.management;

import com.retail.management.dto.AuthRequest;
import com.retail.management.dto.AuthResponse;
import com.retail.management.dto.RegisterUserRequest;
import com.retail.management.entity.User;
import com.retail.management.exception.BadRequestException;
import com.retail.management.repository.UserRepository;
import com.retail.management.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
class AuthServiceTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should successfully authenticate admin with valid credentials")
    void testSuccessfulLogin() {
        AuthRequest req = new AuthRequest("admin", "Password@123");
        AuthResponse res = authService.login(req);

        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("admin", res.getUsername());
        assertTrue(res.getRoles().contains("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Should reject authentication with invalid password")
    void testFailedLoginBadCredentials() {
        AuthRequest req = new AuthRequest("admin", "WrongPassword");
        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Should successfully register a new user and assign roles")
    void testRegisterUser() {
        RegisterUserRequest req = new RegisterUserRequest();
        req.setUsername("newcashier");
        req.setEmail("newcashier@retailcorp.com");
        req.setPassword("Password@123");
        req.setFullName("Test Cashier");
        req.setPhone("+91-9999988888");
        req.setRoles(Set.of("ROLE_CASHIER"));

        User saved = authService.registerUser(req);
        assertNotNull(saved.getId());
        assertEquals("newcashier", saved.getUsername());
        assertTrue(userRepository.existsByUsername("newcashier"));
    }

    @Test
    @DisplayName("Should throw BadRequestException when username is duplicate")
    void testRegisterDuplicateUsername() {
        RegisterUserRequest req = new RegisterUserRequest();
        req.setUsername("admin");
        req.setEmail("unique@retailcorp.com");
        req.setPassword("Password@123");
        req.setFullName("Duplicate Test");

        assertThrows(BadRequestException.class, () -> authService.registerUser(req));
    }
}
