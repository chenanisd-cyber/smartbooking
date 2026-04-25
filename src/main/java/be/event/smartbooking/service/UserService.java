package be.event.smartbooking.service;

import be.event.smartbooking.dto.RegisterRequest;
import be.event.smartbooking.model.Role;
import be.event.smartbooking.model.User;
import be.event.smartbooking.repository.RoleRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JavaMailSender mailSender) {
        this.userRepository  = userRepository;
        this.roleRepository  = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender      = mailSender;
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

        User saved = userRepository.save(user);
        sendWelcomeEmail(saved, roleName);
        return saved;
    }

    private void sendWelcomeEmail(User user, String roleName) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(user.getEmail());

            if (roleName.equals("producer")) {
                msg.setSubject("SmartBooking — Demande de compte producteur reçue");
                msg.setText(
                    "Bonjour " + user.getFirstName() + ",\n\n" +
                    "Votre demande de compte producteur a bien été enregistrée.\n\n" +
                    "Un administrateur va examiner votre demande. " +
                    "Vous recevrez un accès dès que votre compte sera approuvé.\n\n" +
                    "Identifiant : " + user.getLogin() + "\n\n" +
                    "L'équipe SmartBooking"
                );
            } else {
                msg.setSubject("SmartBooking — Bienvenue !");
                msg.setText(
                    "Bonjour " + user.getFirstName() + ",\n\n" +
                    "Votre compte a été créé avec succès. Vous pouvez dès maintenant vous connecter.\n\n" +
                    "Identifiant : " + user.getLogin() + "\n\n" +
                    "Bonne découverte de notre catalogue de spectacles !\n\n" +
                    "L'équipe SmartBooking"
                );
            }

            mailSender.send(msg);
        } catch (Exception e) {
            // Ne pas bloquer l'inscription si l'envoi d'email échoue
        }
    }

    public User findByLogin(String login) {
        return userRepository.findByLogin(login)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    // Admin — list all users
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // Admin — activate a user account
    public User activate(Long id) {
        User user = findById(id);
        user.setActive(true);
        return userRepository.save(user);
    }

    // Admin — deactivate a user account (blocks login)
    public User deactivate(Long id) {
        User user = findById(id);
        user.setActive(false);
        return userRepository.save(user);
    }

    // Admin — approve a producer account (allows login)
    public User approve(Long id) {
        User user = findById(id);
        user.setApproved(true);
        user.setActive(true);
        return userRepository.save(user);
    }

    // Admin — delete a user
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    // Member — delete own account
    public void deleteSelf(String login) {
        User user = findByLogin(login);
        // Prevent the last admin from deleting themselves
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("admin"));
        if (isAdmin) {
            long adminCount = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("admin")))
                .count();
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Impossible de supprimer le dernier compte administrateur.");
            }
        }
        userRepository.delete(user);
    }

    // Member — update own profile (first/last name, email)
    public User updateProfile(String login, String firstName, String lastName, String email) {
        User user = findByLogin(login);
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (email != null && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(email);
        }
        return userRepository.save(user);
    }
}
