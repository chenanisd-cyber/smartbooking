package be.event.smartbooking.dto;

import be.event.smartbooking.model.User;

import java.util.Set;
import java.util.stream.Collectors;

// Simple read-only view of a user (no password)
public record UserProfileDto(
    Long id,
    String login,
    String email,
    String firstName,
    String lastName,
    boolean isActive,
    boolean isApproved,
    Set<String> roles
) {
    // Convenient factory from entity
    public static UserProfileDto from(User user) {
        return new UserProfileDto(
            user.getId(),
            user.getLogin(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.isActive(),
            user.isApproved(),
            user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet())
        );
    }
}
