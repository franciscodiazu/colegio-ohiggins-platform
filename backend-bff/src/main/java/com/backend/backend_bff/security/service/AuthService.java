package com.backend.backend_bff.security.service;

import com.backend.backend_bff.security.dto.LoginRequest;
import com.backend.backend_bff.security.dto.LoginResponse;
import com.backend.backend_bff.security.dto.RegisterRequest;
import com.backend.backend_bff.security.entity.Usuario;
import com.backend.backend_bff.security.jwt.JwtTokenProvider;
import com.backend.backend_bff.security.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    private static final Map<String, String> ROLE_MAP = Map.of(
        "DOCENTE", "profesor",
        "ESTUDIANTE", "estudiante",
        "ADMIN", "admin"
    );

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtTokenProvider.generateToken(usuario.getUsername(), usuario.getRole());
        String frontendRole = ROLE_MAP.getOrDefault(usuario.getRole(), usuario.getRole().toLowerCase());

        return new LoginResponse(token, usuario.getUsername(), usuario.getNombre(), frontendRole);
    }

    public LoginResponse register(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        if (usuarioRepository.existsByUsername(username)) {
            throw new RuntimeException("El usuario ya existe");
        }

        // TODO: La creación de ADMIN y DOCENTE se delegará a un endpoint administrativo
        //       restringido y protegido por @PreAuthorize en el futuro. Por ahora todo
        //       usuario nuevo se registra con el rol de menor privilegio (ESTUDIANTE).
        String role = "ESTUDIANTE";

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setNombre(request.getNombre().trim());
        usuario.setRole(role);

        usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generateToken(usuario.getUsername(), usuario.getRole());
        String frontendRole = ROLE_MAP.getOrDefault(usuario.getRole(), usuario.getRole().toLowerCase());

        return new LoginResponse(token, usuario.getUsername(), usuario.getNombre(), frontendRole);
    }
}
