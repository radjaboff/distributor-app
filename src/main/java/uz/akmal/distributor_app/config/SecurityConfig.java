package uz.akmal.distributor_app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Value("${app.security.user1.username:admin}")
    private String user1Username;

    @Value("${app.security.user1.password:admin123}")
    private String user1Password;

    @Value("${app.security.user2.username:}")
    private String user2Username;

    @Value("${app.security.user2.password:}")
    private String user2Password;

    @Value("${app.security.remember-me.key:distributor-app-secure-salt-key-928374}")
    private String rememberMeKey;

    @Value("${server.servlet.session.cookie.secure:false}")
    private boolean cookieSecure;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails user1 = User.withUsername(user1Username)
                .password(encoder.encode(user1Password))
                .roles("ADMIN")
                .build();

        if (user2Username != null && !user2Username.trim().isEmpty() &&
            user2Password != null && !user2Password.trim().isEmpty()) {
            UserDetails user2 = User.withUsername(user2Username.trim())
                    .password(encoder.encode(user2Password.trim()))
                    .roles("ADMIN")
                    .build();
            return new InMemoryUserDetailsManager(user1, user2);
        }

        return new InMemoryUserDetailsManager(user1);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login.html", "/css/**", "/js/**", "/manifest.json", "/icons/**", "/service-worker.js", "/favicon.ico").permitAll()
                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                (request, response, authException) -> response.sendError(401, "Login talab qilinadi"),
                                request -> request.getRequestURI() != null && request.getRequestURI().startsWith("/api/")
                        )
                        .authenticationEntryPoint(new org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint("/login.html"))
                )
                .rememberMe(remember -> remember
                        .key(rememberMeKey)
                        .tokenValiditySeconds(60 * 60 * 24 * 30) // 30 kun
                        .useSecureCookie(cookieSecure)
                )
                .formLogin(form -> form
                        .loginPage("/login.html")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/index.html", true)
                        .failureUrl("/login.html?error=true")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login.html")
                        .permitAll()
                );
        return http.build();
    }
}