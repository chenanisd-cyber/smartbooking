package be.event.smartbooking;

import be.event.smartbooking.model.Role;
import be.event.smartbooking.model.User;
import be.event.smartbooking.repository.RoleRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds default admin user on first startup.
 * login: admin / password: admin123
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only create if no admin exists yet
        if (userRepository.findByLogin("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName("admin")
                .orElseThrow(() -> new RuntimeException("Role 'admin' not found in DB"));

            User admin = new User();
            admin.setLogin("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@smartbooking.be");
            admin.setFirstName("Admin");
            admin.setLastName("System");
            admin.setActive(true);
            admin.setApproved(true);
            admin.getRoles().add(adminRole);

            userRepository.save(admin);
            System.out.println(">>> Default admin created: login=admin / password=admin123");
        }
    }
}
