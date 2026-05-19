# Maven archetype: maven-archetype-basic

Arquetipo Maven minimal para generar un proyecto Java simple.

## Estructura
- `pom.xml` — POM del arquetipo (packaging `maven-archetype`)
- `src/main/resources/archetype-resources/` — plantillas que se copian al proyecto generado
- `src/main/resources/META-INF/maven/archetype-metadata.xml` — definición de archivos y propiedades del arquetipo

## Uso
1. Construir e instalar el arquetipo localmente:

```bash
cd packages/maven-archetype-basic
mvn clean install
```

2. Generar un nuevo proyecto con el arquetipo:

```bash
mvn archetype:generate \
  -DarchetypeGroupId=com.backend.archetypes \
  -DarchetypeArtifactId=maven-archetype-basic \
  -DarchetypeVersion=0.0.1-SNAPSHOT \
  -DgroupId=com.example \
  -DartifactId=my-app \
  -Dpackage=com.example.app \
  -DinteractiveMode=false
```

3. Entrar al nuevo proyecto:

```bash
cd my-app
mvn -DskipTests package
```

## Notas
- El arquetipo es intencionalmente simple; ajusta `archetype-resources` para añadir más ficheros o plantillas.
- Si la generación no reemplaza correctamente los paquetes, prueba `-Dpackage=com.example.app` explícito.
