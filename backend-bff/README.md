# backend-bff

Backend For Frontend (BFF) que centraliza llamadas a microservicios.

Prerequisitos
- Java 21
- Maven (opcional: se incluye `mvnw` / `mvnw.cmd`)
- MySQL (si se usa una base de datos externa)

Ejecución en desarrollo
Para Linux/macOS:

```bash
./mvnw spring-boot:run
```

Para Windows (PowerShell / CMD):

```powershell
.\mvnw.cmd spring-boot:run
```

Tests

```bash
./mvnw test
```

Variables de entorno útiles
- SPRING_DATASOURCE_URL (jdbc:mysql://host:port/db)
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD
- SPRING_PROFILES_ACTIVE
- SERVER_PORT

Docker

Construir imagen (desde la raíz del repo):

```bash
docker build -f backend-bff/Dockerfile -t backend-bff:local .
```

Ejecutar contenedor (ejemplo):

```bash
docker run -e SPRING_DATASOURCE_URL="jdbc:mysql://host:3306/db" -e SPRING_DATASOURCE_USERNAME=root -e SPRING_DATASOURCE_PASSWORD=pass -p 8080:8080 backend-bff:local
```

Notas
- El proyecto usa Spring Boot y está configurado en `pom.xml`.
- Para desarrollo local se recomienda usar la `mvnw` incluida.
