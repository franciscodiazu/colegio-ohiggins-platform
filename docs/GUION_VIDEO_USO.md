# Guion Video de Uso — Colegio O'Higgins Platform
**Duración estimada:** 6–8 min | **Checklist EV3:** Ítems 1–9 (Video de Uso)
**Preparación:** Docker Compose corriendo, navegador en http://localhost:5173

---

## Bloque 1: Introducción (ítems 1, 2)
**Duración:** ~1:00 min

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 0:00 | Mostrar `README.md` en GitHub — descripción general | "Este es el sistema de gestión académica del Colegio Bernardo O'Higgins. Resuelve la necesidad de digitalizar el registro de estudiantes y asistencia, reemplazando procesos manuales por una plataforma web con microservicios." |
| 0:30 | Mostrar diagrama Mermaid de arquitectura | "La solución es una SPA React que se conecta a un API Gateway con autenticación JWT, el cual enruta a microservicios independientes para estudiantes y asistencia, todo desplegado con Docker Compose." |

---

## Bloque 2: Requisitos e Instalación (ítems 3, 4)
**Duración:** ~1:00 min

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 1:00 | Mostrar `docs/REQUISITOS_SISTEMA.md` | "Los requisitos mínimos son: Docker Desktop 4.x con WSL2, 8 GB RAM, 10 GB disco, y Node.js 22 para desarrollo. Puertos libres: 5173, 8080–8083, 8761, 9090, 3000." |
| 1:20 | Terminal: `git clone`, `cd colegio-ohiggins-platform`, `docker compose up -d` | "La instalación es simple: clonar el repositorio y ejecutar `docker compose up -d`. Docker construye las imágenes y levanta los 10 contenedores automáticamente." |
| 1:45 | Terminal: `docker compose ps` — mostrar 10/10 healthy | "En aproximadamente 2 minutos, los 10 servicios están saludables." |

---

## Bloque 3: Acceso e Interfaz (ítems 5, 6)
**Duración:** ~1:00 min

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 2:00 | Abrir `http://localhost:5173` — mostrar pantalla de login | "Se accede por `http://localhost:5173`. La interfaz tiene un layout responsive con navbar superior, sidebar de navegación, y área de contenido principal." |
| 2:20 | Mostrar páginas: Login, Dashboard, Estudiantes, Asistencia navegando | "Las secciones principales son: Dashboard con resumen, Gestión de Estudiantes, Gestión de Asistencia, Evaluaciones y la sección de autenticación." |
| 2:45 | Hover sobre navbar, mostrar iconos y etiquetas | "Cada página tiene un propósito específico y sigue el mismo patrón de diseño: tabla con datos, formularios modales, skeletons durante carga, y mensajes de error contextuales." |

---

## Bloque 4: Funcionalidades (ítems 7, 8)
**Duración:** ~3:00 min

### 4a. Autenticación (CU-01)

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 3:00 | Login con `ana.perez@profesor.cl` / `123456` | "El profesor inicia sesión con su correo y contraseña. El frontend envía las credenciales al Gateway, que genera un JWT. El rol se infiere del dominio: @profesor.cl es Profesor, @alum.cl es Estudiante, @apod.cl es Apoderado." |
| 3:20 | Mostrar Dashboard después del login | "Al ingresar, vemos el Dashboard con métricas: total de estudiantes, asistencia del día, alertas. La información se obtiene de los microservicios via el Gateway." |

### 4b. CRUD Estudiantes (CU-02)

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 3:40 | Navegar a "Gestión de Estudiantes", mostrar listado | "En Gestión de Estudiantes, se listan todos los estudiantes registrados. Los datos incluyen RUT, nombre y curso." |
| 4:00 | Click "Agregar Estudiante", llenar formulario con RUT válido, guardar | "Para crear un estudiante, completamos el formulario. El RUT se valida en tiempo real con el algoritmo chileno de dígito verificador. Al guardar, se envía un POST al Gateway, que lo reenvía a ms-students y persiste en MySQL." |
| 4:20 | Mostrar el nuevo estudiante en la tabla | "La tabla se actualiza con el nuevo registro. También se puede editar y eliminar. Cada operación retorna el código HTTP correspondiente: 201 al crear, 200 al consultar, 204 al eliminar." |

### 4c. Registro de Asistencia (CU-03)

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 4:40 | Navegar a "Gestión de Asistencia", seleccionar curso y fecha | "Seleccionamos el curso y la fecha. El sistema carga los estudiantes de ese curso." |
| 5:00 | Marcar asistencia: algunos Presente, uno Atraso, uno Inasistencia | "Marcamos el estado de cada estudiante. Solo se permite un registro por estudiante por día — si intentamos duplicar, el sistema rechaza la operación con un 400. Aquí aplicamos patrón Strategy: cada estado tiene su propia validación." |
| 5:20 | Click "Guardar", mostrar confirmación | "Al guardar, la asistencia se persiste en la base de datos. Si ms-students no responde, el Circuit Breaker se abre y retorna una respuesta por defecto, manteniendo la estabilidad del sistema." |

### 4d. Roles (CU-04)

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 5:35 | Cerrar sesión, login con `juan.garcia@alum.cl` / `123456` | "Ahora veamos la vista de un estudiante. El dashboard muestra su asistencia y evaluaciones." |
| 5:50 | Mostrar dashboard de estudiante (datos simulados) | "Cada rol ve información distinta. Los profesores ven el resumen general, los estudiantes y apoderados ven solo sus propios datos." |

---

## Bloque 5: Cierre (ítem 9)
**Duración:** ~1:00 min

| Tiempo | Acción en pantalla | Locución |
|--------|-------------------|----------|
| 6:00 | Mostrar `docs/PLAN_EVOLUCION_TECNICA.md` | "La plataforma está construida para escalar. El Plan de Evolución Técnica documenta las próximas iteraciones: migración a TypeScript, logging en frontend, integración con Loki para logs centralizados, y despliegue en AWS EKS con Kubernetes." |
| 6:20 | Mostrar `docs/CHECKLIST_INFORME.md` resumen 60/61 | "Actualmente cumplimos 60 de 61 ítems del checklist EV3. La única brecha restante —TypeScript— está formalmente documentada con estrategia de implementación para la iteración V4. Las brechas de logging frontend y descarga directa del JAR fueron cerradas durante el sprint." |
| 6:40 | Cierre | "En conclusión, la Plataforma Colegio O'Higgins entrega una solución completa de gestión académica con microservicios, autenticación segura, monitoreo en tiempo real y una arquitectura preparada para evolución continua. Gracias por su atención." |

---

## Resumen Checklist de Uso

| # | Ítem | Bloque | Tiempo |
|---|------|--------|--------|
| 1 | Problemática y solución | 1 | 0:30 |
| 2 | Introducción de la solución | 1 | 0:30 |
| 3 | Requisitos del sistema | 2 | 0:20 |
| 4 | Instalación y configuración | 2 | 0:40 |
| 5 | Cómo acceder al sistema | 3 | 0:20 |
| 6 | Descripción de la interfaz | 3 | 0:40 |
| 7 | Funcionalidades principales | 4a–4d | 3:00 |
| 8 | Funcionalidad completa del sistema | 4a–4d | 3:00 |
| 9 | Conclusión y escalabilidad | 5 | 1:00 |
| **Total** | **9/9** | | **~7:00** |

---

## Notas de Producción
- **Cuenta de prueba:** `ana.perez@profesor.cl` / `123456` (profesor), `juan.garcia@alum.cl` / `123456` (estudiante)
- **Cerrar pestañas/sesiones previas antes de grabar**
- **Tener la BD con datos de prueba** — si está vacía, registrar 3-4 estudiantes manualmente antes de grabar
- **Confirmar conectividad:** Gateway en :8080, Frontend en :5173
- **Posibles contratiempos:** Si el login falla, revisar que `docker compose ps` muestre api-gateway y mysql como healthy
