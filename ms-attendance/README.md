# ms-attendance

Microservicio de Asistencia.

Prerequisitos
- Java 21
- Maven (se puede usar `mvnw` / `mvnw.cmd`)

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

En Windows se incluye un script para ejecutar tests:

```powershell
.\run-tests.ps1
```

O alternativamente:

```bash
./mvnw test
```

Variables de entorno
- SPRING_DATASOURCE_URL
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD
- SPRING_PROFILES_ACTIVE

Docker

En `Infra/docker/attendance.Dockerfile` hay un Dockerfile para este servicio; desde la raíz:

```bash
docker build -f Infra/docker/attendance.Dockerfile -t ms-attendance:local .
docker run -p 8081:8081 ms-attendance:local
```

Notas
- Configuraciones por defecto en `src/main/resources/application.yml`.
