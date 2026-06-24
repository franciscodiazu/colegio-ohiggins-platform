# Discovery Server (Eureka)

Servidor de registro y descubrimiento de servicios.

- **Tecnología:** Spring Cloud Netflix Eureka Server.
- **Responsabilidad:** Registro dinámico de microservicios, proporcionando alta disponibilidad y tolerancia a fallos en el ruteo.
- **Puerto:** 8761
- **Dashboard:** http://localhost:8761

## Compilación y Ejecución Manual (JAR)

Si se requiere obtener el binario ejecutable sin Docker:

```bash
# 1. Compilar el módulo discovery-server desde la raíz del proyecto
mvn clean package -pl discovery-server -am

# 2. Ejecutar el JAR generado
java -jar discovery-server/target/discovery-server-0.0.1-SNAPSHOT.jar
```

El servicio iniciará en el puerto `8761` y quedará disponible para el registro de los microservicios del ecosistema.
