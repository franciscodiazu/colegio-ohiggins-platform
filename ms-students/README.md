# ms-students

Microservicio encargado de la gestion de estudiantes para la plataforma Colegio O'Higgins. Proporciona los endpoints necesarios para el mantenimiento y consulta de la informacion base de los alumnos.

## Prerrequisitos

- Java 21
- Maven (mvnw / mvnw.cmd)

## Instalacion y Ejecucion

### Ejecucion local

Linux/macOS:
```bash
./mvnw spring-boot:run
```

Windows:
```powershell
.\mvnw.cmd spring-boot:run
```

### Ejecucion con Docker

```bash
docker build -f ../Infra/docker/students.Dockerfile -t ms-students:local .
docker run -p 8081:8081 ms-students:local
```

## Configuracion y Endpoints

- Puerto por defecto: 8081
- Documentacion API (Swagger): http://localhost:8081/swagger-ui/index.html
- Path base API: /api/students

## Calidad y Pruebas Unitarias

El microservicio utiliza JUnit 5 y Mockito para las pruebas unitarias.

- Total Tests: 17
- Cobertura de codigo: >60%
- Clases testeadas: StudentServiceTest, StudentControllerTest, MsStudentsApplicationTests

Ejecutar pruebas:
```bash
./mvnw clean test
```

## Variables de Entorno

- SPRING_DATASOURCE_URL: URL de la base de datos MySQL.
- SPRING_DATASOURCE_USERNAME: Usuario de la base de datos.
- SPRING_DATASOURCE_PASSWORD: Password de la base de datos.
- SPRING_PROFILES_ACTIVE: Perfil de ejecucion (default, dev, prod).

## Notas

Las configuraciones por defecto se encuentran en src/main/resources/application.properties.
