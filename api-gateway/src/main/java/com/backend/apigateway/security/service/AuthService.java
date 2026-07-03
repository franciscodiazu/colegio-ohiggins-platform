package com.backend.apigateway.security.service;

import com.backend.apigateway.security.dto.LoginRequest;
import com.backend.apigateway.security.dto.LoginResponse;
import com.backend.apigateway.security.dto.RegisterRequest;
import com.backend.apigateway.security.dto.ResetPasswordRequest;
import com.backend.apigateway.security.entity.RefreshToken;
import com.backend.apigateway.security.entity.Usuario;
import com.backend.apigateway.security.jwt.JwtTokenProvider;
import com.backend.apigateway.security.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    private static final Map<String, String> ROLE_MAP = Map.of(
        "DOCENTE", "profesor",
        "ESTUDIANTE", "estudiante",
        "APODERADO", "apoderado",
        "ADMIN", "admin"
    );

    private static final Pattern PROFESOR_DOMAIN = Pattern.compile("^[^@]+@profesor\\.cl$", Pattern.CASE_INSENSITIVE);
    private static final Pattern ESTUDIANTE_DOMAIN = Pattern.compile("^[^@]+@alum\\.cl$", Pattern.CASE_INSENSITIVE);
    private static final Pattern APODERADO_DOMAIN = Pattern.compile("^[^@]+@apod\\.cl$", Pattern.CASE_INSENSITIVE);

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       RefreshTokenService refreshTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtTokenProvider.generateToken(usuario.getUsername(), usuario.getRole());
        String refreshToken = refreshTokenService.createRefreshToken(usuario.getUsername()).getToken();
        String frontendRole = ROLE_MAP.getOrDefault(usuario.getRole(), usuario.getRole().toLowerCase());

        return new LoginResponse(token, refreshToken, usuario.getUsername(), usuario.getNombre(), frontendRole);
    }

    private String inferRoleFromEmail(String email) {
        if (PROFESOR_DOMAIN.matcher(email).matches()) return "DOCENTE";
        if (ESTUDIANTE_DOMAIN.matcher(email).matches()) return "ESTUDIANTE";
        if (APODERADO_DOMAIN.matcher(email).matches()) return "APODERADO";
        return null;
    }

    public LoginResponse register(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        if (usuarioRepository.existsByUsername(username)) {
            throw new RuntimeException("El usuario ya existe");
        }

        String role = inferRoleFromEmail(username);
        if (role == null) {
            throw new RuntimeException("Correo no válido. Usa @profesor.cl, @alum.cl o @apod.cl");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setNombre(request.getNombre().trim());
        usuario.setRole(role);

        usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generateToken(usuario.getUsername(), usuario.getRole());
        String refreshToken = refreshTokenService.createRefreshToken(usuario.getUsername()).getToken();
        String frontendRole = ROLE_MAP.getOrDefault(usuario.getRole(), usuario.getRole().toLowerCase());

        return new LoginResponse(token, refreshToken, usuario.getUsername(), usuario.getNombre(), frontendRole);
    }

    public void resetPassword(ResetPasswordRequest request) {
        String username = request.getUsername().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("No encontramos una cuenta asociada a ese correo."));
        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);
        log.info("Contraseña actualizada para: {}", username);
    }

    public LoginResponse refresh(String refreshTokenStr) {
        RefreshToken storedToken = refreshTokenService.findByToken(refreshTokenStr)
                .orElseThrow(() -> new RuntimeException("Refresh token inválido"));

        refreshTokenService.verifyExpiration(storedToken);

        String username = storedToken.getUsername();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String newAccessToken = jwtTokenProvider.generateToken(usuario.getUsername(), usuario.getRole());
        String newRefreshToken = refreshTokenService.createRefreshToken(usuario.getUsername()).getToken();
        String frontendRole = ROLE_MAP.getOrDefault(usuario.getRole(), usuario.getRole().toLowerCase());

        return new LoginResponse(newAccessToken, newRefreshToken, usuario.getUsername(), usuario.getNombre(), frontendRole);
    }
}
