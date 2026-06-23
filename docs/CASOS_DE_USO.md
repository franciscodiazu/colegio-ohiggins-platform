# Casos de Uso — Colegio O'Higgins Platform

## CU-01: Inicio de Sesión

| Actor | Profesor, Estudiante, Apoderado |
|-------|--------------------------------|
| Precondición | Usuario registrado en el sistema |
| Flujo principal | 1. Usuario ingresa email y contraseña<br>2. Sistema valida credenciales contra API Gateway<br>3. Gateway genera JWT + Refresh Token<br>4. Frontend almacena tokens y redirige al Dashboard |
| Postcondición | Usuario autenticado con sesión activa |
| Códigos HTTP | 200 OK (éxito), 401 Unauthorized (credenciales inválidas) |

## CU-02: CRUD de Estudiantes

| Actor | Profesor |
|-------|----------|
| Precondición | Usuario autenticado con rol Profesor |
| Flujo principal | 1. Profesor accede al módulo de estudiantes<br>2. Visualiza listado completo de alumnos<br>3. Puede crear: ingresa RUT, nombre, apellido, curso<br>4. Puede editar: modifica datos de estudiante existente<br>5. Puede eliminar: confirma eliminación vía modal<br>6. Sistema valida datos y persiste en db_academic |
| Postcondición | Datos del estudiante creados/actualizados/eliminados en BD |
| Códigos HTTP | 200 OK, 201 Created, 400 Bad Request, 404 Not Found |

## CU-03: Registro de Asistencia

| Actor | Profesor |
|-------|----------|
| Precondición | Estudiante registrado en el sistema |
| Flujo principal | 1. Profesor selecciona curso y fecha<br>2. Sistema muestra lista de estudiantes del curso<br>3. Profesor marca estado: Presente, Atraso o Inasistencia<br>4. Sistema aplica reglas de negocio (único registro por día)<br>5. Persiste en db_record vía ms-attendance |
| Postcondición | Asistencia registrada con validaciones aplicadas |
| Códigos HTTP | 201 Created, 400 Bad Request (duplicado), 503 Service Unavailable (CB abierto) |
| Nota | Circuit Breaker protege contra caída de ms-students |

## CU-04: Visualización de Dashboard

| Actor | Profesor, Estudiante, Apoderado |
|-------|--------------------------------|
| Precondición | Usuario autenticado |
| Flujo principal | 1. Usuario accede al dashboard<br>2. Sistema muestra resumen según rol del usuario<br>3. Profesor: total estudiantes, asistencia del día, alertas<br>4. Estudiante/Apoderado: resumen de calificaciones y asistencia |
| Postcondición | Datos mostrados en tiempo real desde los microservicios |
| Nota | En MV3 los datos son simulados vía mock services con localStorage |
