package be.event.smartbooking.config;

import be.event.smartbooking.service.CustomUserDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Map;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;

    public SecurityConfig(CustomUserDetailsService userDetailsService, ObjectMapper objectMapper) {
        this.userDetailsService = userDetailsService;
        this.objectMapper = objectMapper;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — we use a React SPA, not HTML forms
            .csrf(csrf -> csrf.disable())

            // Access rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/users/login", "/api/users/register").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/shows/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/artists/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/locations/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/localities/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/artist-types/**").permitAll()
                // Admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Everything else needs login
                .anyRequest().authenticated()
            )

            // Form login → returns JSON instead of redirecting
            .formLogin(form -> form
                .loginProcessingUrl("/api/users/login")
                .usernameParameter("login")
                .passwordParameter("password")
                .successHandler((req, res, auth) -> {
                    res.setStatus(HttpServletResponse.SC_OK);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    var roles = auth.getAuthorities().stream()
                        .map(a -> a.getAuthority().replace("ROLE_", "").toLowerCase())
                        .toList();
                    objectMapper.writeValue(res.getWriter(),
                        Map.of("login", auth.getName(), "roles", roles));
                })
                .failureHandler((req, res, ex) -> {
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(res.getWriter(),
                        Map.of("error", "Invalid credentials or account not approved"));
                })
            )

            // Logout → returns JSON
            .logout(logout -> logout
                .logoutUrl("/api/users/logout")
                .logoutSuccessHandler((req, res, auth) -> {
                    res.setStatus(HttpServletResponse.SC_OK);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(res.getWriter(), Map.of("message", "Logged out"));
                })
            )

            // Return 401 JSON instead of redirect to login page
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(res.getWriter(), Map.of("error", "Authentication required"));
                })
            )

            .userDetailsService(userDetailsService);

        return http.build();
    }
}
