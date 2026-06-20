-- =============================================================================
-- Script de Inicialización de Base de Datos
-- Ubicación: /Infra/mysql/init.sql
-- Seguridad: Least Privilege - Usuario dedicado con permisos mínimos
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Crear Bases de Datos
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS db_academic 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS db_record 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS colegio_auth_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Crear Usuario de Aplicación (Principio de Mínimo Privilegio)
-- -----------------------------------------------------------------------------
-- Usuario dedicado para la aplicación (NO usar root en producción)
-- Contraseña: Ohiggins_Secur3_2026!
CREATE USER IF NOT EXISTS 'app_colegio'@'%' 
    IDENTIFIED BY 'Ohiggins_Secur3_2026!';

-- -----------------------------------------------------------------------------
-- 3. Asignar Permisos Limitados (Least Privilege)
-- -----------------------------------------------------------------------------
-- Permisos SELECT, INSERT, UPDATE, DELETE, CREATE (tablas), INDEX
-- NO se otorgan permisos de DROP DATABASE, ALTER USER, GRANT, etc.

-- Permisos sobre db_academic (ms-students)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, 
    CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW, SHOW VIEW
    ON db_academic.* 
    TO 'app_colegio'@'%';

-- Permisos sobre db_record (ms-attendance)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX,
    CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW, SHOW VIEW
    ON db_record.* 
    TO 'app_colegio'@'%';

-- Permisos sobre colegio_auth_db (backend-bff - autenticación)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX,
    CREATE TEMPORARY TABLES, LOCK TABLES
    ON colegio_auth_db.* 
    TO 'app_colegio'@'%';

-- -----------------------------------------------------------------------------
-- 4. Aplicar Cambios
-- -----------------------------------------------------------------------------
FLUSH PRIVILEGES;

-- -----------------------------------------------------------------------------
-- 5. Verificación (Comentado - descomentar solo para debug)
-- -----------------------------------------------------------------------------
-- SELECT User, Host FROM mysql.user WHERE User = 'app_colegio';
-- SHOW GRANTS FOR 'app_colegio'@'%';

-- =============================================================================
-- NOTAS DE SEGURIDAD:
-- =============================================================================
-- 1. Este script se ejecuta automáticamente al iniciar el contenedor MySQL
-- 2. El usuario 'app_colegio' tiene permisos limitados solo sobre las DBs necesarias
-- 3. La contraseña debe rotarse regularmente en producción
-- 4. En producción AWS RDS, usar AWS Secrets Manager para credenciales
-- 5. Considerar habilitar SSL para conexiones a la base de datos
-- =============================================================================
