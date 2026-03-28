package be.event.smartbooking.service;

import be.event.smartbooking.model.User;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        User user = userRepository.findByLogin(login)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + login));

        // Block login if account is disabled or waiting for admin approval
        if (!user.isActive()) {
            throw new DisabledException("Account is disabled");
        }
        if (!user.isApproved()) {
            throw new DisabledException("Account is pending approval");
        }

        var authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()))
            .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
            user.getLogin(),
            user.getPassword(),
            authorities
        );
    }
}
