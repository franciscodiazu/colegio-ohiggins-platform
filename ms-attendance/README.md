# ms-attendance

Microservicio encargado de la gestion de asistencia para la plataforma Colegio O'Higgins. Permite el registro y consulta de la asistencia de los estudiantes, integrando logica de resiliencia y validaciones de negocio.

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
docker build -f ../Infra/docker/attendance.Dockerfile -t ms-attendance:local .
docker run -p 8082:8082 ms-attendance:local
```

## Configuracion y Endpoints

- Puerto por defecto: 8082
- Documentacion API (Swagger): http://localhost:8082/swagger-ui/index.html
- Path base API: /api/attendance

## Calidad y Pruebas Unitarias

El microservicio utiliza JUnit 5, Mockito y JaCoCo para asegurar la calidad del codigo.

- Total Tests: 101
- Cobertura de codigo: 84.86% (Lineas), 89.87% (Metodos), 75.38% (Ramas)
- Clases criticas testeadas: ControladorAsistenciaTest, ServicioAsistenciaTest, ClienteEstudiantesResilienceTest, AtrasoFactoryTest, ValidationStrategyTest.

Ejecutar pruebas:
```bash
./mvnw clean test
```

## Variables de Entorno

- SPRING_DATASOURCE_URL: URL de la base de datos MySQL.
- SPRING_DATASOURCE_USERNAME: Usuario de la base de datos.
- SPRING_DATASOURCE_PASSWORD: Password de la base de datos.
- SPRING_PROFILES_ACTIVE: Perfil de ejecucion (default, dev, prod).
- MS_STUDENTS_URL: URL del microservicio de estudiantes para comunicacion interna.

## Notas

Las configuraciones por defecto se encuentran en src/main/resources/application.properties o application.yml.
