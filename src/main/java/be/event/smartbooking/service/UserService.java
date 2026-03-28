package be.event.smartbooking.service;

import be.event.smartbooking.dto.RegisterRequest;
import be.event.smartbooking.model.Role;
import be.event.smartbooking.model.User;
import be.event.smartbooking.repository.RoleRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest req) {
        if (userRepository.existsByLogin(req.login())) {
            throw new IllegalArgumentException("Login already taken");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setLogin(req.login());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setEmail(req.email());
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());

        // Producer accounts need admin approval before they can login
        String roleName = (req.role() != null && req.role().equals("producer")) ? "producer" : "member";
        if (roleName.equals("producer")) {
            user.setActive(false);
            user.setApproved(false);
        }

        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        user.getRoles().add(role);

        return userRepository.save(user);
    }

    public User findByLogin(String login) {
        return userRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
