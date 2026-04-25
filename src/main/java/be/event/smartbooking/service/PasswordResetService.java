package be.event.smartbooking.service;

import be.event.smartbooking.model.PasswordResetToken;
import be.event.smartbooking.repository.PasswordResetTokenRepository;
import be.event.smartbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public PasswordResetService(
        UserRepository userRepository,
        PasswordResetTokenRepository tokenRepository,
        PasswordEncoder passwordEncoder,
        JavaMailSender mailSender
    ) {
        this.userRepository   = userRepository;
        this.tokenRepository  = tokenRepository;
        this.passwordEncoder  = passwordEncoder;
        this.mailSender       = mailSender;
    }

    // Request a reset — never reveal whether the email exists
    @Transactional
    public void requestReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Remove any existing token for this user
            tokenRepository.deleteByUser(user);

            // Generate a new token valid for 1 hour
            PasswordResetToken prt = new PasswordResetToken();
            prt.setToken(UUID.randomUUID().toString());
            prt.setUser(user);
            prt.setExpiresAt(LocalDateTime.now().plusHours(1));
            tokenRepository.save(prt);

            sendResetEmail(user.getEmail(), prt.getToken());
        });
    }

    // Validate token and update password
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = tokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Token invalide ou expiré"));

        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(prt);
            throw new IllegalArgumentException("Token invalide ou expiré");
        }

        prt.getUser().setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(prt.getUser());
        tokenRepository.delete(prt);
    }

    private void sendResetEmail(String to, String token) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("SmartBooking — Réinitialisation de mot de passe");
        msg.setText(
            "Bonjour,\n\n" +
            "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
            "Cliquez sur le lien suivant (valable 1 heure) :\n\n" +
            frontendUrl + "/reset-password?token=" + token + "\n\n" +
            "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.\n\n" +
            "L'équipe SmartBooking"
        );
        mailSender.send(msg);
    }
}
