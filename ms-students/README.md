# ms-students

Microservicio de Gestión de Estudiantes.

Prerequisitos
- Java 21
- Maven (`mvnw` / `mvnw.cmd`)

Ejecución en desarrollo

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Windows (PowerShell / CMD):

```powershell
.\mvnw.cmd spring-boot:run
```

Tests

```powershell
.\run-tests.ps1
```

Variables de entorno recomendadas
- SPRING_DATASOURCE_URL
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD
- SPRING_PROFILES_ACTIVE

Docker

Construir usando el Dockerfile en `Infra/docker/students.Dockerfile`:

```bash
docker build -f Infra/docker/students.Dockerfile -t ms-students:local .
docker run -p 8082:8082 ms-students:local
```

Notas
- Configuraciones por defecto en `src/main/resources/application.properties`.
