package be.event.smartbooking.api.controller;

import be.event.smartbooking.dto.RegisterRequest;
import be.event.smartbooking.dto.UserProfileDto;
import be.event.smartbooking.model.User;
import be.event.smartbooking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    // GET /api/users/profile — logged-in user's profile
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByLogin(userDetails.getUsername());
        return ResponseEntity.ok(UserProfileDto.from(user));
    }

    // PUT /api/users/profile — update own profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody Map<String, String> body
    ) {
        try {
            User user = userService.updateProfile(
                userDetails.getUsername(),
                body.get("firstName"),
                body.get("lastName"),
                body.get("email")
            );
            return ResponseEntity.ok(UserProfileDto.from(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/users/me — logged-in user deletes own account
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteSelf(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.deleteSelf(userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Compte supprimé avec succès."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ---- Admin endpoints ----

    // GET /api/users — all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileDto> getAll() {
        return userService.findAll().stream().map(UserProfileDto::from).toList();
    }

    // PUT /api/users/{id}/activate
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public UserProfileDto activate(@PathVariable Long id) {
        return UserProfileDto.from(userService.activate(id));
    }

    // PUT /api/users/{id}/deactivate
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public UserProfileDto deactivate(@PathVariable Long id) {
        return UserProfileDto.from(userService.deactivate(id));
    }

    // PUT /api/users/{id}/approve — approve a producer account
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public UserProfileDto approve(@PathVariable Long id) {
        return UserProfileDto.from(userService.approve(id));
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
