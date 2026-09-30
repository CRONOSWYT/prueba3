-- ===========================================================================
--  SMART TEST — esquema de base de datos para desarrollo local
--  (cargado automáticamente por el contenedor `db` de docker-compose en
--  /docker-entrypoint-initdb.d/ la primera vez que arranca MySQL).
-- ===========================================================================

CREATE DATABASE IF NOT EXISTS smart_test;
USE smart_test;

-- Roles de usuario ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS rol (
    id_rol       INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol   VARCHAR(50) NOT NULL UNIQUE
);

-- Grados académicos --------------------------------------------------------
CREATE TABLE IF NOT EXISTS grado (
    id_grado      INT AUTO_INCREMENT PRIMARY KEY,
    numero_grado  INT NOT NULL UNIQUE
);

-- Usuarios (estudiantes y administradores) ---------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario    INT AUTO_INCREMENT PRIMARY KEY,
    documento     BIGINT NOT NULL,
    nombre_usuario VARCHAR(100) NOT NULL,
    correo        VARCHAR(255) NOT NULL UNIQUE,
    `password`    VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(500) DEFAULT NULL,
    id_rol        INT DEFAULT NULL,
    id_grado      INT DEFAULT NULL,
    UNIQUE KEY uq_usuario_documento (documento),
    CONSTRAINT fk_usuario_rol   FOREIGN KEY (id_rol)   REFERENCES rol(id_rol)   ON DELETE SET NULL,
    CONSTRAINT fk_usuario_grado FOREIGN KEY (id_grado) REFERENCES grado(id_grado) ON DELETE SET NULL
);

-- Catálogo académico -------------------------------------------------------
CREATE TABLE IF NOT EXISTS materia (
    id_materia     INT AUTO_INCREMENT PRIMARY KEY,
    nombre_materia VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tema (
    id_tema     INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tema VARCHAR(100) NOT NULL,
    id_materia  INT NOT NULL,
    CONSTRAINT fk_tema_materia FOREIGN KEY (id_materia) REFERENCES materia(id_materia) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pregunta (
    id_pregunta   INT AUTO_INCREMENT PRIMARY KEY,
    texto_pregunta TEXT NOT NULL,
    id_tema       INT NOT NULL,
    CONSTRAINT fk_pregunta_tema FOREIGN KEY (id_tema) REFERENCES tema(id_tema) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS respuesta (
    id_respuesta    INT AUTO_INCREMENT PRIMARY KEY,
    id_pregunta     INT NOT NULL,
    texto_respuesta TEXT NOT NULL,
    es_correcta     TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_respuesta_pregunta FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta) ON DELETE CASCADE
);

-- Resultados de simulacros -------------------------------------------------
CREATE TABLE IF NOT EXISTS simulacro (
    id_simulacro   INT AUTO_INCREMENT PRIMARY KEY,
    nombre_simulacro VARCHAR(255) NOT NULL,
    id_usuario     INT NOT NULL,
    CONSTRAINT fk_simulacro_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resultado (
    id_resultado        INT AUTO_INCREMENT PRIMARY KEY,
    total_respuestas_buenas INT DEFAULT 0,
    total_respuestas_malas  INT DEFAULT 0,
    fecha_realizacion   DATETIME DEFAULT CURRENT_TIMESTAMP,
    numero_intento      INT DEFAULT 1,
    id_usuario          INT NOT NULL,
    CONSTRAINT fk_resultado_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progreso (
    id_progreso  INT AUTO_INCREMENT PRIMARY KEY,
    total_intento INT DEFAULT 0,
    calificacion DECIMAL(10,2) DEFAULT 0,
    id_resultado INT DEFAULT NULL,
    id_usuario   INT NOT NULL,
    CONSTRAINT fk_progreso_resultado FOREIGN KEY (id_resultado) REFERENCES resultado(id_resultado) ON DELETE SET NULL,
    CONSTRAINT fk_progreso_usuario  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ranking (
    id_ranking  INT AUTO_INCREMENT PRIMARY KEY,
    posicion    INT NOT NULL,
    id_usuario  INT NOT NULL,
    id_progreso INT DEFAULT NULL,
    CONSTRAINT fk_ranking_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_ranking_progreso FOREIGN KEY (id_progreso) REFERENCES progreso(id_progreso) ON DELETE SET NULL
);

-- Tarjetas de estudio ------------------------------------------------------
CREATE TABLE IF NOT EXISTS flashcard (
    id_flashcard  INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INT NOT NULL,
    nombre_tema   VARCHAR(100) DEFAULT NULL,
    texto_pregunta TEXT,
    texto_respuesta TEXT,
    es_correcta   TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_flashcard_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Tabla creada dinámicamente por la aplicación (también se crea aquí para
-- que las claves foráneas de ranking/respuesta_usuario resuelvan correctamente).
CREATE TABLE IF NOT EXISTS respuesta_usuario (
    id_respuesta_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    id_pregunta     INT NOT NULL,
    id_resultado    INT,
    acierto         TINYINT(1) DEFAULT 0,
    fecha           DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ru_usuario_pregunta (id_usuario, id_pregunta),
    INDEX idx_ru_usuario_acierto  (id_usuario, acierto),
    CONSTRAINT fk_ru_usuario  FOREIGN KEY (id_usuario)    REFERENCES usuario(id_usuario)    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ru_pregunta FOREIGN KEY (id_pregunta)   REFERENCES pregunta(id_pregunta) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ru_resultado FOREIGN KEY (id_resultado) REFERENCES resultado(id_resultado) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================================================================
--  Datos semilla (solo desarrollo)
--  Las contraseñas se guardan como SHA-256 para poder iniciar sesión sin
--  necesidad de PHP en el servidor de base de datos.
--  Credenciales de desarrollo:
--   Admin:      admin@smart.test      /  admin
--   Estudiante: student@smart.test    /  student
--  IMPORTANTE: estos datos NO son válidos en producción.
-- ===========================================================================

-- Roles y grados requeridos por registro.php / login.php
INSERT IGNORE INTO rol (nombre_rol) VALUES ('estudiante'), ('admin');

INSERT IGNORE INTO grado (id_grado, numero_grado) VALUES
    (1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
    (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11);

-- Usuarios demo
INSERT INTO usuario (documento, nombre_usuario, correo, `password`, avatar_url, id_rol, id_grado) VALUES
    (1000000, 'Admin',         'admin@smart.test',   SHA2('admin',   256), NULL,
        (SELECT id_rol FROM rol WHERE nombre_rol = 'admin'),
        (SELECT id_grado FROM grado WHERE numero_grado = 11)),
    (2000000, 'Estudiante Demo', 'student@smart.test', SHA2('student', 256), NULL,
        (SELECT id_rol FROM rol WHERE nombre_rol = 'estudiante'),
        (SELECT id_grado FROM grado WHERE numero_grado = 6))
ON DUPLICATE KEY UPDATE id_usuario = id_usuario;

-- Materia + tema + preguntas de muestra para probar el flujo de examen
INSERT IGNORE INTO materia (id_materia, nombre_materia) VALUES
    (1, 'Matemáticas');

INSERT IGNORE INTO tema (id_tema, nombre_tema, id_materia) VALUES
    (1, 'Álgebra', 1);

INSERT IGNORE INTO pregunta (id_pregunta, texto_pregunta, id_tema) VALUES
    (1, '¿Cuánto es 2 + 2?',                1),
    (2, '¿Cuál es la raíz cuadrada de 9?',  1);

INSERT IGNORE INTO respuesta (id_respuesta, id_pregunta, texto_respuesta, es_correcta) VALUES
    (1, 1, '3', 0),
    (2, 1, '4', 1),
    (3, 1, '5', 0),
    (4, 1, '6', 0),
    (5, 2, '2', 0),
    (6, 2, '3', 1),
    (7, 2, '4', 0),
    (8, 2, '5', 0);
