package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.RegisterRequest;
import be.event.smartbooking.dto.UserProfileDto;
import be.event.smartbooking.model.User;
import be.event.smartbooking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /api/users/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            User user = userService.register(req);
            String msg = user.isApproved()
                ? "Account created successfully"
                : "Account created — waiting for admin approval";
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", msg));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/users/profile — returns the logged-in user's info
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByLogin(userDetails.getUsername());
        return ResponseEntity.ok(UserProfileDto.from(user));
    }
}
