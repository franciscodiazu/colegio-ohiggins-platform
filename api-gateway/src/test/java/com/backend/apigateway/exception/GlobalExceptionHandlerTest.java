package com.backend.apigateway.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("GlobalExceptionHandler - api-gateway")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        webRequest = mock(WebRequest.class);
        when(webRequest.getDescription(false)).thenReturn("uri=/api/v1/test");
    }

    @Nested
    @DisplayName("ApiError structure")
    class ApiErrorTests {

        @Test
        @DisplayName("ApiError debe construirse correctamente con builder")
        void testApiErrorBuilder() {
            ApiError error = ApiError.builder()
                    .timestamp(LocalDateTime.now())
                    .status(400)
                    .error("Bad Request")
                    .code("VALID-001")
                    .message("Campo invalido")
                    .build();

            assertThat(error)
                    .hasFieldOrPropertyWithValue("status", 400)
                    .hasFieldOrPropertyWithValue("error", "Bad Request")
                    .hasFieldOrPropertyWithValue("code", "VALID-001")
                    .hasFieldOrPropertyWithValue("message", "Campo invalido");
            assertThat(error.getTimestamp()).isNotNull();
        }

        @Test
        @DisplayName("ApiError debe incluir validaciones cuando se proveen")
        void testApiErrorWithValidations() {
            Map<String, String> validations = Map.of("username", "no debe estar vacio");
            ApiError error = ApiError.builder()
                    .timestamp(LocalDateTime.now())
                    .status(400)
                    .error("Validacion Fallida")
                    .code("VALID-001")
                    .message("Errores de validacion")
                    .validations(validations)
                    .build();

            assertThat(error.getValidations())
                    .isNotEmpty()
                    .containsEntry("username", "no debe estar vacio");
        }

        @Test
        @DisplayName("ApiError debe excluir campos null del JSON")
        void testApiErrorJsonInclude() {
            ApiError error = ApiError.builder()
                    .timestamp(LocalDateTime.now())
                    .status(500)
                    .error("Error Interno")
                    .message("Error inesperado")
                    .build();

            assertThat(error.getCode()).isNull();
            assertThat(error.getValidations()).isNull();
        }
    }

    @Nested
    @DisplayName("HTTP status mapping")
    class HttpStatusMappingTests {

        @Test
        @DisplayName("MethodArgumentNotValidException -> 400 BAD_REQUEST")
        void testValidationException() {
            BindingResult bindingResult = mock(BindingResult.class);
            FieldError fieldError = new FieldError("request", "username", "username es obligatorio");
            when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));

            MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);
            ResponseEntity<ApiError> response = handler.handleValidationExceptions(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(400);
            assertThat(response.getBody().getError()).isEqualTo("Validacion Fallida");
            assertThat(response.getBody().getValidations()).containsEntry("username", "username es obligatorio");
        }

        @Test
        @DisplayName("IllegalArgumentException -> 400 BAD_REQUEST")
        void testIllegalArgument() {
            IllegalArgumentException ex = new IllegalArgumentException("Dominio de correo invalido");
            ResponseEntity<ApiError> response = handler.handleIllegalArgument(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(400);
            assertThat(response.getBody().getMessage()).contains("Dominio de correo invalido");
        }

        @Test
        @DisplayName("HttpMessageNotReadableException -> 400 BAD_REQUEST")
        void testMessageNotReadable() {
            HttpMessageNotReadableException ex = new HttpMessageNotReadableException("JSON mal formado");
            ResponseEntity<ApiError> response = handler.handleMessageNotReadable(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(400);
            assertThat(response.getBody().getCode()).isEqualTo("MSG-001");
        }

        @Test
        @DisplayName("AuthenticationException -> 401 UNAUTHORIZED")
        void testAuthentication() {
            AuthenticationException ex = new BadCredentialsException("Credenciales invalidas");
            ResponseEntity<ApiError> response = handler.handleAuthentication(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(401);
            assertThat(response.getBody().getCode()).isEqualTo("AUTH-001");
        }

        @Test
        @DisplayName("AccessDeniedException -> 403 FORBIDDEN")
        void testAccessDenied() {
            AccessDeniedException ex = new AccessDeniedException("Acceso denegado");
            ResponseEntity<ApiError> response = handler.handleAccessDenied(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(403);
            assertThat(response.getBody().getCode()).isEqualTo("AUTH-003");
        }

        @Test
        @DisplayName("Exception generica -> 500 INTERNAL_SERVER_ERROR")
        void testGenericException() {
            Exception ex = new Exception("Error inesperado");
            ResponseEntity<ApiError> response = handler.handleAll(ex, webRequest);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(500);
            assertThat(response.getBody().getCode()).isEqualTo("SYS-001");
            assertThat(response.getBody().getMessage()).isEqualTo("Ocurrio un error inesperado en el sistema");
        }
    }
}