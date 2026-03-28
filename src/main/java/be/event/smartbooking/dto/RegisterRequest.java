package be.event.smartbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank String login,
    @NotBlank @Size(min = 6) String password,
    @NotBlank @Email String email,
    String firstName,
    String lastName,
    // "member", "producer" — defaults to member if blank
    String role
) {}
