# 📊 Análisis Completo de Consultas SQL — SMART TEST

> **Proyecto:** SMART TEST (`/opt/lampp/htdocs/SMART_TEST`)
> **Fecha de análisis:** 28 de septiembre de 2026
> **Descripción:** Este documento reúne **todas** las operaciones SQL encontradas en los archivos PHP del proyecto. Cada operación incluye: ruta del archivo, rango de líneas, tipo de operación, el código SQL completo y una explicación de su propósito.
>
> **Nota:** El proyecto usa **PDO con prepared statements** para casi todas las consultas, lo que previene inyección SQL. Las variables se pasan como parámetros (`?`) en lugar de interpolarse directamente en la cadena.

---

## 🗂️ Tabla de Contenidos

1. [Esquema de Base de Datos (Inferido)](#1-esquema-de-base-de-datos-inferido)
2. [`php/conexion.php` — Conexión a la base de datos](#2-phpconexionphp--conexión-a-la-base-de-datos)
3. [`php/registro.php` — Registro de usuarios](#3-phpregistrolphp--registro-de-usuarios)
4. [`php/login.php` — Inicio de sesión](#4-phploginphp--inicio-de-sesión)
5. [`php/historial.php` — Historial de simulacros](#5-phphistorialphp--historial-de-simulacros)
6. [`php/cargar_datos.php` — Carga de datos y registro de simulacros](#6-phpcargar_datosphp--carga-de-datos-y-registro-de-simulacros)
7. [`php/ranking.php` — Ranking de usuarios](#7-phprankingphp--ranking-de-usuarios)
8. [`php/recuperar.php` — Recuperación de contraseña](#8-phprecuperarphp--recuperación-de-contraseña)
9. [`php/admin_datos.php` — Panel de administración (CRUD Completo)](#9-phpadmin_datosphp--panel-de-administración-crud-completo)
10. [Resumen por tipo de operación](#10-resumen-por-tipo-de-operación)
11. [Mapa de endpoints API (Frontend JS → Backend PHP)](#11-mapa-de-endpoints-api-frontend-js--backend-php)
12. [Diagrama de relaciones (esquema simplificado)](#12-diagrama-de-relaciones-esquema-simplificado)
13. [Buenas prácticas observadas](#13-buenas-prácticas-observadas)

---

## 1. Esquema de Base de Datos (Inferido)

El esquema de la base de datos se infiere de todas las consultas `SELECT`, `INSERT`, `UPDATE`, `DELETE` y `CREATE TABLE` encontradas en el código. Las tablas principales son:

| Tabla | Columnas (clave) | Descripción |
|-------|-------------------|-------------|
| **usuario** | `id_usuario` (PK), `documento`, `nombre_usuario`, `correo`, `password`, `id_rol` (FK→rol), `id_grado` (FK→grado), `avatar_url` | Usuarios registrados (estudiantes y admins) |
| **rol** | `id_rol` (PK), `nombre_rol` | Roles: `'estudiante'`, `'admin'` |
| **grado** | `id_grado` (PK), `numero_grado` | Grados académicos |
| **materia** | `id_materia` (PK), `nombre_materia` | Materias/ asignaturas |
| **tema** | `id_tema` (PK), `nombre_tema`, `id_materia` (FK→materia) | Temas dentro de una materia |
| **pregunta** | `id_pregunta` (PK), `texto_pregunta`, `id_tema` (FK→tema) | Preguntas asociadas a un tema |
| **respuesta** | `id_respuesta` (PK), `id_pregunta` (FK→pregunta), `texto_respuesta`, `es_correcta` (0/1) | Opciones de respuesta de cada pregunta |
| **simulacro** | `id_simulacro` (PK), `nombre_simulacro`, `id_usuario` (FK→usuario) | Simulacros/examenes tomados por usuarios |
| **resultado** | `id_resultado` (PK), `total_respuestas_buenas`, `total_respuestas_malas`, `fecha_realizacion`, `numero_intento`, `id_usuario` (FK→usuario) | Resultados de cada intento |
| **progreso** | `id_progreso` (PK), `total_intento`, `calificacion`, `id_resultado` (FK→resultado), `id_usuario` (FK→usuario) | Progreso/ historial de un usuario |
| **ranking** | `id_ranking` (PK implícito), `posicion`, `id_usuario` (FK→usuario), `id_progreso` (FK→progreso) | Posiciones en el ranking general |
| **flashcard** | `id_usuario` (FK→usuario) | Tarjetas de estudio (referenciada en DELETE) |
| **respuesta_usuario** | `id_respuesta_usuario` (PK), `id_usuario` (FK→usuario), `id_pregunta` (FK→pregunta), `id_resultado` (FK→resultado), `acierto`, `fecha` | Respuestas individuales del usuario (tabla creada dinámicamente) |

---

## 2. `php/conexion.php` — Conexión a la base de datos

**Ruta:** `/opt/lampp/htdocs/SMART_TEST/php/conexion.php`
**Líneas totales:** 30

Este archivo establece la conexión PDO a la base de datos MySQL (Aiven) con SSL mediante el certificado CA de Aiven. Configura el manejo de errores en modo `ERRMODE_EXCEPTION` y el modo de fetch por defecto como `FETCH_ASSOC`. No contiene operaciones SQL de migración.

> **Nota:** Anteriormente este archivo contenía un bloque de migración (`ALTER TABLE usuario ADD COLUMN avatar_url ...`) para agregar la columna `avatar_url` dinámicamente. Este código ha sido **eliminado**. La columna `avatar_url` debe existir previamente en la base de datos.

---

## 3. `php/registro.php` — Registro de usuarios

**Ruta:** `/opt/lampp/htdocs/SMART_TEST/php/registro.php`
**Líneas totales:** 96
**Endpoint:** `POST php/registro.php`
**Llamada desde:** `js/login.js` (línea 230)

Registra un nuevo usuario validando documento, nombre, correo, contraseña y grado. Busca o crea el rol y grado si no existen, luego inserta el usuario.

### Operación 1 — Verificar existencia previa de correo/documento (SELECT)

- **Líneas:** 36–39
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_usuario FROM usuario WHERE correo = ? OR documento = ? LIMIT 1
```
- **Parámetros:** `[$correo, $documento]`
- **Propósito:** Verifica si ya existe un usuario con el mismo correo o documento. Si `rowCount() > 0`, se rechaza el registro con código 409 (conflicto).

### Operación 2 — Buscar rol 'estudiante' (SELECT)

- **Líneas:** 50–54
- **Tipo:** `SELECT` (query directo)
- **Código SQL:**
```sql
SELECT id_rol FROM rol WHERE nombre_rol = 'estudiante' LIMIT 1
```
- **Propósito:** Obtiene el `id_rol` correspondiente al nombre `'estudiante'`. Si no existe, se crea en la operación siguiente.

### Operación 3 — Crear rol 'estudiante' si no existe (INSERT)

- **Líneas:** 56
- **Tipo:** `INSERT`
- **Código SQL:**
```sql
INSERT INTO rol (nombre_rol) VALUES ('estudiante')
```
- **Propósito:** Inserta el rol `'estudiante'` en la tabla `rol` como fallback cuando no existe. El `id_rol` del nuevo registro se obtiene con `lastInsertId()`.

### Operación 4 — Buscar grado por número (SELECT)

- **Líneas:** 60–63
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_grado FROM grado WHERE numero_grado = ? LIMIT 1
```
- **Parámetros:** `[$grado]`
- **Propósito:** Busca si ya existe un grado con el `numero_grado` proporcionado. Si no existe, se crea en la operación siguiente.

### Operación 5 — Crear grado si no existe (INSERT)

- **Líneas:** 66–69
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO grado (numero_grado) VALUES (?)
```
- **Parámetros:** `[$grado]`
- **Propósito:** Inserta un nuevo registro en la tabla `grado` si el grado no existía previamente.

### Operación 6 — Insertar nuevo usuario (INSERT)

- **Líneas:** 73–83
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO usuario (correo, documento, nombre_usuario, password, id_rol, id_grado)
VALUES (?, ?, ?, ?, ?, ?)
```
- **Parámetros:** `[$correo, $documento, $nombre, $contrasenaHash, $rol["id_rol"], $gradoFila["id_grado"]]`
- **Propósito:** Inserta un nuevo usuario con correo, documento, nombre, contraseña hasheada, el rol `'estudiante'` y el grado correspondiente. La contraseña se hash con `password_hash($contrasena, PASSWORD_DEFAULT)` (bcrypt/argon2).

---

## 4. `php/login.php` — Inicio de sesión

**Ruta:** `/opt/lampp/htdocs/SMART_TEST/php/login.php`
**Líneas totales:** 52
**Endpoint:** `POST php/login.php`
**Llamada desde:** `js/login.js` (línea 257)

Autentica al usuario verificando correo y contraseña. Devuelve información del usuario (documento, nombre, rol).

### Operación 1 — Buscar usuario por correo (SELECT con JOIN)

- **Líneas:** 10–13
- **Tipo:** `SELECT` (prepared statement con JOIN)
- **Código SQL:**
```sql
SELECT u.documento, u.nombre_usuario, u.password, r.nombre_rol
FROM usuario u
LEFT JOIN rol r ON r.id_rol = u.id_rol
WHERE LOWER(u.correo) = LOWER(?) LIMIT 1
```
- **Parámetros:** `[$correo]`
- **Propósito:** Busca un usuario por su correo (comparación case-insensitive con `LOWER()`). Usa `LEFT JOIN` con la tabla `rol` para obtener el nombre del rol asignado. Si el usuario existe, se verifica la contraseña con `password_verify()`, `hash_equals()` o `hash("sha256", ...)`.

---

## 5. `php/historial.php` — Historial de simulacros

**Ruta:** `/opt/lampp/htdocs/SMART_TEST/php/historial.php`
**Líneas totales:** 84
**Endpoint:** `GET php/historial.php?documento=XXX`
**Llamada desde:** `js/historial.js` (línea 120)

Devuelve el historial de simulacros (intentos) de un usuario identificado por su documento.

### Operación 1 — Buscar usuario por documento (SELECT)

- **Líneas:** 20–23
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_usuario, nombre_usuario, id_rol FROM usuario WHERE documento = ? LIMIT 1
```
- **Parámetros:** `[$documento]`
- **Propósito:** Localiza al usuario por su número de documento. Si no existe, devuelve error.

### Operación 2 — Obtener historial de simulacros (SELECT con JOINs y subconsulta)

- **Líneas:** 34–59
- **Tipo:** `SELECT` (prepared statement con JOINs, subconsulta y `ROW_NUMBER()`)
- **Código SQL:**
```sql
SELECT
    pr.total_intento         AS intento,
    pr.calificacion          AS puntuacion,
    r.fecha_realizacion      AS fecha,
    s.nombre_simulacro       AS materia,
    r.total_respuestas_buenas  AS buenas,
    r.total_respuestas_malas   AS malas,
    CASE WHEN r.total_respuestas_buenas + r.total_respuestas_malas > 0
         THEN round(0.5 * r.total_respuestas_buenas
                    / (r.total_respuestas_buenas + r.total_respuestas_malas), 2)
         ELSE 0 END AS promedio
FROM progreso pr
JOIN resultado r
    ON r.id_resultado = pr.id_resultado
LEFT JOIN (
    SELECT
        id_simulacro, id_usuario, nombre_simulacro,
        ROW_NUMBER() OVER (PARTITION BY id_usuario ORDER BY id_simulacro) AS fila
    FROM simulacro
) s
    ON s.id_usuario = pr.id_usuario
   AND s.fila = pr.total_intento
WHERE pr.id_usuario = ?
ORDER BY pr.total_intento DESC
```
- **Parámetros:** `[$usuario["id_usuario"]]`
- **Propósito:** Obtiene el historial completo de intentos de un usuario. Une `progreso` con `resultado` (para obtener fecha, buenas y malas) y con `simulacro` (para obtener el nombre de la materia). La subconsulta usa `ROW_NUMBER() OVER (PARTITION BY id_usuario ORDER BY id_simulacro)` para asociar el número de intento con el simulacro correspondiente. Calcula el promedio de respuestas correctas con una expresión `CASE`. Ordena por intento descendente.

---

## 6. `php/cargar_datos.php` — Carga de datos y registro de simulacros

**Ruta:** `/opt/lampp/htdocs/SMART_TEST/php/cargar_datos.php`
**Líneas totales:** 303
**Endpoint:** `GET` y `POST php/cargar_datos.php?accion=XXX`
**Llamadas desde:** `js/preguntas.js` (líneas 137, 161, 580)

Este archivo maneja múltiples acciones: creación automática de tabla, registro de simulacros, y carga de materias/temas/preguntas.

### Operación 1 — Creación automática de tabla `respuesta_usuario` (CREATE TABLE)

- **Líneas:** 17–31 (migrate) + verificación en 34
- **Tipo:** `CREATE TABLE`
- **Código SQL:**
```sql
CREATE TABLE IF NOT EXISTS respuesta_usuario (
    id_respuesta_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario          INT NOT NULL,
    id_pregunta         INT NOT NULL,
    id_resultado        INT,
    acierto             TINYINT(1) DEFAULT 0,
    fecha               DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ru_usuario_pregunta (id_usuario, id_pregunta),
    INDEX idx_ru_usuario_acierto  (id_usuario, acierto),
    CONSTRAINT fk_ru_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ru_pregunta FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ru_resultado FOREIGN KEY (id_resultado) REFERENCES resultado(id_resultado) ON DELETE SET NULL ON UPDATE CASCADE
)
```
- **Propósito:** Crea la tabla `respuesta_usuario` si no existe. Esta tabla almacena cada respuesta individual dada por un usuario a una pregunta durante un simulacro, permitiendo rastrear progreso a nivel de pregunta (sistema "nuevo"). Tiene claves foráneas que hacen referencia a `usuario`, `pregunta` y `resultado`, con eliminación en cascada.

### Operación 2 — Verificación de tabla creada (SELECT)

- **Líneas:** 34
- **Tipo:** `SELECT`
- **Código SQL:**
```sql
SELECT 1 FROM respuesta_usuario LIMIT 1
```
- **Propósito:** Verifica que la tabla `respuesta_usuario` fue creada correctamente y es usable (aca `LIMIT 1` verifica que se puede leer). Si falla, se marca `$tieneRespuestaUsuario = false`.

### Operación 3 — Acción `registrar_simulacro`: buscar usuario (SELECT)

- **Líneas:** 48
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_usuario FROM usuario WHERE documento = ? LIMIT 1
```
- **Parámetros:** `[$documento]`
- **Propósito:** Dentro de la acción `registrar_simulacro`, localiza el `id_usuario` a partir del documento enviado. Si no se encuentra, se rechaza el registro.

### Operación 4 — Acción `registrar_simulacro`: contar simulacros previos (SELECT COUNT)

- **Líneas:** 59
- **Tipo:** `SELECT COUNT` (prepared statement)
- **Código SQL:**
```sql
SELECT COUNT(*) FROM simulacro WHERE id_usuario = ?
```
- **Parámetros:** `[$idUsuario]`
- **Propósito:** Cuenta cuántos simulacros ha realizado el usuario para determinar el número de intento (`total_intento = COUNT + 1`).

### Operación 5 — Acción `registrar_simulacro`: insertar simulacro (INSERT)

- **Líneas:** 68
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO simulacro (nombre_simulacro, id_usuario) VALUES (?, ?)
```
- **Parámetros:** `[$nombreSimulacro, $idUsuario]`
- **Propósito:** Registra un nuevo simulacro en la tabla `simulacro` asociado al usuario. El `id_simulacro` se obtiene con `lastInsertId()`.

### Operación 6 — Acción `registrar_simulacro`: insertar resultado (INSERT)

- **Líneas:** 80–84
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO resultado (total_respuestas_buenas, total_respuestas_malas, fecha_realizacion, numero_intento, id_usuario)
VALUES (?, ?, NOW(), ?, ?)
```
- **Parámetros:** `[$totalBuenas, $totalMalas, $intento, $idUsuario]`
- **Propósito:** Inserta el resultado del simulacro: cantidad de respuestas correctas, incorrectas, fecha actual (`NOW()`), número de intento y usuario. El `id_resultado` se obtiene con `lastInsertId()`.

### Operación 7 — Acción `registrar_simulacro`: insertar respuestas individuales (INSERT)

- **Líneas:** 102–105
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO respuesta_usuario (id_usuario, id_pregunta, id_resultado, acierto)
VALUES (?, ?, ?, ?)
```
- **Parámetros:** `[$idUsuario, (int)$idPreg, $primeraResultadoId, (bool)$acierto ? 1 : 0]`
- **Propósito:** Registra cada respuesta individual del usuario (pregunta por pregunta) en la tabla `respuesta_usuario`. Se usa cuando la tabla está disponible (`$tieneRespuestaUsuario`). Permite rastrear qué preguntas acertó y cuáles no.

### Operación 8 — Acción `registrar_simulacro`: contar preguntas distintas correctas (SELECT COUNT DISTINCT)

- **Líneas:** 118–123
- **Tipo:** `SELECT COUNT DISTINCT` (prepared statement)
- **Código SQL:**
```sql
SELECT COUNT(DISTINCT id_pregunta) FROM respuesta_usuario
WHERE id_usuario = ? AND acierto = 1
```
- **Parámetros:** `[$idUsuario]`
- **Propósito:** Cuenta cuántas preguntas distintas (sin duplicados) el usuario ha acertado. Esto evita que contestar mal y bien la misma pregunta inflase la puntuación.

### Operación 9 — Acción `registrar_simulacro`: contar preguntas distintas respondidas (SELECT COUNT DISTINCT)

- **Líneas:** 126–131
- **Tipo:** `SELECT COUNT DISTINCT` (prepared statement)
- **Código SQL:**
```sql
SELECT COUNT(DISTINCT id_pregunta) FROM respuesta_usuario
WHERE id_usuario = ?
```
- **Parámetros:** `[$idUsuario]`
- **Propósito:** Cuenta cuántas preguntas distintas ha respondido el usuario en total. Se usa para calcular el promedio.

### Operación 10 — Acción `registrar_simulacro`: insertar progreso (INSERT)

- **Líneas:** 141
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO progreso (total_intento, calificacion, id_resultado, id_usuario) VALUES (?, ?, ?, ?)
```
- **Parámetros:** `[$intento, $calificacion, $primeraResultadoId, $idUsuario]`
- **Propósito:** Registra el progreso del usuario: número de intento, calificación (0.5 × respuestas correctas), ID del resultado asociado y ID del usuario. Todo dentro de una transacción (`beginTransaction`).

### Operación 11 — Acción `materias`: listar materias (SELECT)

- **Líneas:** 170
- **Tipo:** `SELECT` (query directo)
- **Código SQL:**
```sql
SELECT id_materia, nombre_materia FROM materia ORDER BY nombre_materia
```
- **Propósito:** Devuelve todas las materias ordenadas alfabéticamente.

### Operación 12 — Acción `temas`: listar temas de una materia (SELECT con JOIN)

- **Líneas:** 179 (con filtro) / 182 (sin filtro)
- **Tipo:** `SELECT` (prepared statement / query directo)
- **Código SQL:**
```sql
-- Con filtro de materia (línea 179):
SELECT t.id_tema, t.nombre_tema, m.nombre_materia, t.id_materia
FROM tema t JOIN materia m ON t.id_materia = m.id_materia
WHERE t.id_materia = ?
ORDER BY t.id_tema

-- Sin filtro (línea 182):
SELECT t.id_tema, t.nombre_tema, m.nombre_materia, t.id_materia
FROM tema t JOIN materia m ON t.id_materia = m.id_materia
ORDER BY m.id_materia, t.id_tema
```
- **Propósito:** Lista todos los temas, opcionalmente filtrados por materia. Usa `JOIN` entre `tema` y `materia` para incluir el nombre de la materia.

### Operación 13 — Acción `preguntas_tema`: listar preguntas de un tema (SELECT)

- **Líneas:** 195–201
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT p.id_pregunta, p.texto_pregunta
FROM pregunta p
WHERE p.id_tema = ?
ORDER BY p.id_pregunta
```
- **Parámetros:** `[$idTema]`
- **Propósito:** Obtiene todas las preguntas de un tema específico.

### Operación 14 — Acción `preguntas_tema`: listar respuestas de una pregunta (SELECT)

- **Líneas:** 206–213
- **Tipo:** `SELECT` (prepared statement, ejecutado por cada pregunta)
- **Código SQL:**
```sql
SELECT id_respuesta, texto_respuesta, es_correcta
FROM respuesta
WHERE id_pregunta = ?
ORDER BY id_respuesta
```
- **Parámetros:** `[$p["id_pregunta"]]`
- **Propósito:** Dentro del `foreach` de preguntas, obtiene todas las respuestas (opciones) de cada pregunta. La respuesta marcada como `es_correcta = 1` se identifica como la correcta.

### Operación 15 — Acción `preguntas`: obtener nombre de materia (SELECT)

- **Líneas:** 244
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT nombre_materia FROM materia WHERE id_materia = ?
```
- **Parámetros:** `[$idMateria]`
- **Propósito:** Obtiene el nombre de la materia para incluirlo en la respuesta JSON.

### Operación 16 — Acción `preguntas`: listar preguntas de una materia (SELECT con JOINs)

- **Líneas:** 249–257
- **Tipo:** `SELECT` (prepared statement con múltiples JOINs)
- **Código SQL:**
```sql
SELECT p.id_pregunta, p.texto_pregunta, t.nombre_tema
FROM pregunta p
JOIN tema t ON t.id_tema = p.id_tema
JOIN materia m ON m.id_materia = t.id_materia
WHERE m.id_materia = ?
ORDER BY p.id_pregunta
```
- **Parámetros:** `[$idMateria]`
- **Propósito:** Obtiene todas las preguntas de una materia (a través de los temas), incluyendo el nombre del tema al que pertenecen.

### Operación 17 — Acción `preguntas`: listar respuestas de cada pregunta (SELECT)

- **Líneas:** 263–270
- **Tipo:** `SELECT` (prepared statement, ejecutado por cada pregunta)
- **Código SQL:**
```sql
SELECT id_respuesta, texto_respuesta, es_correcta
FROM respuesta
WHERE id_pregunta = ?
ORDER BY id_respuesta
```
- **Parámetros:** `[$p["id_pregunta"]]`
- **Propósito:** Dentro del `foreach` de preguntas, obtiene las opciones de respuesta de cada pregunta.

---

## 7. `php/ranking.php` — Ranking de usuarios

**Ruta:** `/opt/lampp/htdocs/SMART_TEST/php/ranking.php`
**Líneas totales:** 191
**Endpoint:** `GET php/ranking.php?documento=XXX`
**Llamada desde:** `js/index.js` (línea 520) y `js/ranking.js` (línea 85)

Calcula y actualiza el ranking general de usuarios basado en sus resultados.

### Operación 1 — Creación automática de tabla `respuesta_usuario` (CREATE TABLE)

- **Líneas:** 11–25
- **Tipo:** `CREATE TABLE`
- **Código SQL:**
```sql
CREATE TABLE IF NOT EXISTS respuesta_usuario (
    id_respuesta_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario          INT NOT NULL,
    id_pregunta         INT NOT NULL,
    id_resultado        INT,
    acierto             TINYINT(1) DEFAULT 0,
    fecha               DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ru_usuario_pregunta (id_usuario, id_pregunta),
    INDEX idx_ru_usuario_acierto  (id_usuario, acierto),
    CONSTRAINT fk_ru_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ru_pregunta FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ru_resultado FOREIGN KEY (id_resultado) REFERENCES resultado(id_resultado) ON DELETE SET NULL ON UPDATE CASCADE
)
```
- **Propósito:** Igual que en `cargar_datos.php`, crea la tabla `respuesta_usuario` si no existe. Luego verifica si tiene datos (operación 2).

### Operación 2 — Verificar datos en respuesta_usuario (SELECT COUNT)

- **Líneas:** 37
- **Tipo:** `SELECT COUNT`
- **Código SQL:**
```sql
SELECT COUNT(*) FROM respuesta_usuario
```
- **Propósito:** Cuenta los registros en `respuesta_usuario`. Si hay datos (`$cnt > 0`), se usa el "sistema nuevo" (preguntas distintas); de lo contrario, se usa el "sistema legacy" (suma de calificaciones).

### Operación 3 — Sistema nuevo: ranking con preguntas distintas (SELECT con subconsultas)

- **Líneas:** 46–75
- **Tipo:** `SELECT` (con subconsultas anidadas, `COALESCE`, `GROUP BY`, subquery escalar)
- **Código SQL:**
```sql
SELECT ranked.* FROM (
    SELECT u.id_usuario, u.nombre_usuario, u.avatar_url, u.documento, u.id_rol,
           COALESCE(ru.correctas_distintas, 0)    AS preguntas_correctas,
           COALESCE(SUM(pr.calificacion), 0)     AS total_puntos,
           COALESCE(ru.total_distintas, 0)       AS total_respondidas,
           COALESCE(AVG(pr.calificacion), 0)     AS promedio,
           COALESCE(MAX(pr.calificacion), 0)     AS ultima_calificacion,
           COALESCE(MAX(pr.total_intento), 0)    AS total_intentos,
           (SELECT pr2.id_progreso
              FROM progreso pr2
              WHERE pr2.id_usuario = u.id_usuario
              ORDER BY pr2.id_progreso DESC
              LIMIT 1) AS ultimo_progreso
    FROM usuario u
    INNER JOIN (
        SELECT id_usuario,
               COUNT(DISTINCT id_pregunta) AS total_distintas,
               SUM(CASE WHEN acierto = 1 THEN 1 ELSE 0 END) AS correctas_distintas
        FROM respuesta_usuario
        GROUP BY id_usuario
        HAVING correctas_distintas > 0
    ) ru ON ru.id_usuario = u.id_usuario
    LEFT JOIN progreso pr
        ON pr.id_usuario = u.id_usuario
    GROUP BY u.id_usuario, u.nombre_usuario, u.documento, u.id_rol
) ranked
WHERE COALESCE(ranked.preguntas_correctas, 0) > 0
ORDER BY ranked.promedio DESC, ranked.nombre_usuario ASC
```
- **Propósito:** Sistema "nuevo" — Calcula el ranking usando preguntas distintas acertadas. La subconsulta interna cuenta preguntas distintas respondidas y acertadas por usuario. Se usa `COALESCE` para manejar valores nulos. La subconsulta escalar obtiene el último `id_progreso`. Filtra usuarios con al menos una pregunta correcta y ordena por promedio descendente.

### Operación 4 — Sistema legacy: ranking por suma de calificaciones (SELECT con JOINs)

- **Líneas:** 78–99
- **Tipo:** `SELECT` (con JOINs, `COALESCE`, `GROUP BY`, `HAVING`)
- **Código SQL:**
```sql
SELECT u.id_usuario, u.nombre_usuario, u.avatar_url, u.documento, u.id_rol,
       COALESCE(SUM(r.total_respuestas_buenas), 0) AS preguntas_correctas,
       COALESCE(SUM(pr.calificacion), 0)            AS total_puntos,
       COALESCE(AVG(pr.calificacion), 0)            AS promedio,
       COALESCE(MAX(pr.calificacion), 0)            AS ultima_calificacion,
       COALESCE(MAX(pr.total_intento), 0)           AS total_intentos,
       (SELECT pr2.id_progreso
          FROM progreso pr2
          WHERE pr2.id_usuario = u.id_usuario
          ORDER BY pr2.id_progreso DESC
          LIMIT 1) AS ultimo_progreso
FROM usuario u
LEFT JOIN resultado r
    ON r.id_usuario = u.id_usuario
LEFT JOIN progreso pr
    ON pr.id_usuario = u.id_usuario
WHERE u.id_usuario IS NOT NULL
GROUP BY u.id_usuario, u.nombre_usuario, u.documento, u.id_rol
HAVING COALESCE(SUM(r.total_respuestas_buenas), 0) > 0
ORDER BY promedio DESC, u.nombre_usuario ASC
```
- **Propósito:** Sistema "legacy" — Calcula el ranking sumando calificaciones de `progreso` y respuestas buenas de `resultado`. Se usa cuando la tabla `respuesta_usuario` no tiene datos.

### Operación 5 — Limpiar ranking antes de regenerar (DELETE)

- **Líneas:** 134
- **Tipo:** `DELETE`
- **Código SQL:**
```sql
DELETE FROM ranking
```
- **Propósito:** Elimina todos los registros existentes de la tabla `ranking` antes de insertar los nuevos, dentro de una transacción.

### Operación 6 — Insertar ranking (INSERT)

- **Líneas:** 135–144
- **Tipo:** `INSERT` (prepared statement, ejecutado por cada usuario del ranking)
- **Código SQL:**
```sql
INSERT INTO ranking (posicion, id_usuario, id_progreso) VALUES (?, ?, ?)
```
- **Parámetros:** `[$item["posicion"], $item["id_usuario"], $item["ultimo_progreso"]]`
- **Propósito:** Inserta cada posición del ranking calculado. Se ejecuta dentro de una transacción (`beginTransaction` → `commit`).

### Operación 7 — Contar total de usuarios (SELECT COUNT)

- **Líneas:** 151–152
- **Tipo:** `SELECT COUNT`
- **Código SQL:**
```sql
SELECT COUNT(*) FROM usuario WHERE id_usuario IS NOT NULL
```
- **Propósito:** Cuenta el total de usuarios registrados para incluirlo en la respuesta de la API.

### Operación 8 — Promedio general de calificaciones (SELECT AVG)

- **Líneas:** 159 / 168 (mismo código en ambos sistemas)
- **Tipo:** `SELECT AVG`
- **Código SQL:**
```sql
SELECT COALESCE(AVG(calificacion), 0) AS prom FROM progreso
```
- **Propósito:** Calcula el promedio general de calificaciones de todos los progresos registrados. Se ejecuta tanto en el sistema nuevo como en el legacy (bloques idénticos en líneas 158–164 y 167–174).

---

## 8. `php/recuperar.php` — Recuperación de contraseña

**Ruta:** `/opt/lampp/htdocs/SMART_TEST/php/recuperar.php`
**Líneas totales:** 71
**Endpoint:** `POST php/recuperar.php`
**Llamada desde:** `js/login.js` (línea 293)
**CORS:** Habilitado (`Access-Control-Allow-Origin: *`)

Permite al usuario restablecer su contraseña proporcionando documento, correo y nueva contraseña.

### Operación 1 — Verificar existencia de cuenta (SELECT)

- **Líneas:** 37–40
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_usuario FROM usuario WHERE correo = ? AND documento = ? LIMIT 1
```
- **Parámetros:** `[$correo, $documento]`
- **Propósito:** Verifica que exista un usuario con el correo y documento proporcionados. Si no existe, se rechaza la recuperación.

### Operación 2 — Actualizar contraseña (UPDATE)

- **Líneas:** 54–57
- **Tipo:** `UPDATE` (prepared statement)
- **Código SQL:**
```sql
UPDATE usuario SET password = ? WHERE correo = ? AND documento = ?
```
- **Parámetros:** `[$passwordHash, $correo, $documento]`
- **Propósito:** Actualiza la contraseña del usuario a un nuevo hash (`password_hash($nuevaPassword, PASSWORD_DEFAULT)`). La condición `WHERE` usa tanto correo como documento para asegurar que solo se actualice la cuenta correcta.

---

## 9. `php/admin_datos.php` — Panel de administración (CRUD Completo)

**Ruta:** `/opt/lampp/htdocs/SMART_TEST/php/admin_datos.php`
**Líneas totales:** 680
**Endpoint:** `GET` y `POST php/admin_datos.php?accion=XXX`
**Llamadas desde:** `js/admins.js` y `js/auth.js`

Este es el archivo más extenso del proyecto. Maneja operaciones CRUD para usuarios, temas, preguntas y verificación de roles. Se divide en dos grandes bloques: solicitudes **GET** (lectura/selección) y solicitudes **POST** (escritura: crear, actualizar, eliminar).

---

### 🔹 Bloque GET — Operaciones de lectura (SELECT)

#### Operación 1 — Acción `usuarios`: listar todos los usuarios (SELECT con JOINs)

- **Líneas:** 11–19
- **Tipo:** `SELECT` (query directo con `LEFT JOIN`)
- **Código SQL:**
```sql
SELECT u.id_usuario, u.documento, u.nombre_usuario, u.correo, u.password,
       u.id_grado, u.id_rol,
       g.numero_grado, r.nombre_rol
FROM usuario u
LEFT JOIN grado g ON g.id_grado = u.id_grado
LEFT JOIN rol r ON r.id_rol = u.id_rol
ORDER BY u.documento DESC
```
- **Propósito:** Devuelve todos los usuarios con su grado y rol. Ordena por documento descendente (más reciente primero). Incluye el campo `password` (hash).

#### Operación 2 — Acción `grados`: listar grados (SELECT)

- **Líneas:** 26–28
- **Tipo:** `SELECT` (query directo)
- **Código SQL:**
```sql
SELECT id_grado, numero_grado FROM grado ORDER BY numero_grado
```
- **Propósito:** Lista todos los grados ordenados por número.

#### Operación 3 — Acción `roles`: listar roles (SELECT)

- **Líneas:** 34–36
- **Tipo:** `SELECT` (query directo)
- **Código SQL:**
```sql
SELECT id_rol, nombre_rol FROM rol ORDER BY id_rol
```
- **Propósito:** Lista todos los roles (estudiante, admin, etc.) ordenados por ID.

#### Operación 4 — Acción `materias`: listar materias (SELECT)

- **Líneas:** 42–44
- **Tipo:** `SELECT` (query directo)
- **Código SQL:**
```sql
SELECT id_materia, nombre_materia FROM materia ORDER BY nombre_materia
```
- **Propósito:** Lista todas las materias ordenadas alfabéticamente.

#### Operación 5 — Acción `temas`: listar temas (SELECT)

- **Líneas:** 55–62
- **Tipo:** `SELECT` (prepared statement / query directo)
- **Código SQL:**
```sql
-- Con filtro (línea 56):
SELECT t.id_tema, t.nombre_tema, t.id_materia, m.nombre_materia FROM tema t
JOIN materia m ON t.id_materia = m.id_materia
WHERE t.id_materia = ?
ORDER BY t.id_tema

-- Sin filtro (línea 61):
SELECT t.id_tema, t.nombre_tema, t.id_materia, m.nombre_materia FROM tema t
JOIN materia m ON t.id_materia = m.id_materia
ORDER BY m.id_materia, t.id_tema
```
- **Propósito:** Lista temas, filtrados por materia (si se proporciona `id_materia`) o todos.

#### Operación 6 — Acción `usuario_por_correo`: buscar usuario (SELECT)

- **Líneas:** 77–80
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT nombre_usuario, correo, avatar_url FROM usuario WHERE correo = ? LIMIT 1
```
- **Parámetros:** `[$correo]`
- **Propósito:** Busca un usuario por correo para obtener su nombre, correo y avatar. Se usa en el panel de usuario para mostrar datos de perfil.

#### Operación 7 — Acción `preguntas_tema`: listar preguntas (SELECT)

- **Líneas:** 107–113 (preguntas) + 118–124 (respuestas)
- **Tipo:** `SELECT` (prepared statement, dos consultas)
- **Código SQL:**
```sql
-- Preguntas del tema (línea 107):
SELECT p.id_pregunta, p.texto_pregunta
FROM pregunta p
WHERE p.id_tema = ?
ORDER BY p.id_pregunta

-- Respuestas de cada pregunta (línea 118):
SELECT id_respuesta, texto_respuesta, es_correcta
FROM respuesta
WHERE id_pregunta = ?
ORDER BY id_respuesta
```
- **Propósito:** Obtiene preguntas de un tema y, para cada una, sus respuestas/opciones.

#### Operación 8 — Acción `tema_detalle`: obtener detalle de tema (SELECT)

- **Líneas:** 157–160
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_tema, nombre_tema, id_materia FROM tema WHERE id_tema = ?
```
- **Parámetros:** `[$idTema]`
- **Propósito:** Devuelve los datos de un tema específico por su ID.

#### Operación 9 — Acción `pregunta_detalle`: obtener detalle de pregunta (SELECT)

- **Líneas:** 185–200 (dos consultas)
- **Tipo:** `SELECT` (prepared statement, dos consultas)
- **Código SQL:**
```sql
-- Detalle de la pregunta (línea 185):
SELECT id_pregunta, texto_pregunta, id_tema FROM pregunta WHERE id_pregunta = ?

-- Respuestas de la pregunta (línea 197):
SELECT texto_respuesta, es_correcta FROM respuesta WHERE id_pregunta = ? ORDER BY id_respuesta
```
- **Propósito:** Obtiene una pregunta específica y todas sus respuestas.

---

### 🔹 Bloque POST — Operaciones de escritura (INSERT / UPDATE / DELETE)

#### Operación 10 — Acción `guardar_usuario`: VERIFICAR existencia previa (SELECT)

- **Líneas:** 281–284
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_usuario FROM usuario WHERE documento = ? OR correo = ? LIMIT 1
```
- **Parámetros:** `[$documento, $correo]`
- **Propósito:** Antes de insertar un nuevo usuario, verifica que no exista otro con el mismo documento o correo.

#### Operación 11 — Acción `guardar_usuario`: ACTUALIZAR usuario con contraseña (UPDATE)

- **Líneas:** 251–264
- **Tipo:** `UPDATE` (prepared statement)
- **Código SQL:**
```sql
UPDATE usuario SET documento = ?, nombre_usuario = ?, correo = ?,
    password = ?, id_rol = ?, id_grado = ?
WHERE id_usuario = ?
```
- **Parámetros:** `[$documento, $nombre, $correo, $contrasenaHash, $id_rol, $id_grado, $id]`
- **Propósito:** Actualiza un usuario existente (cuando se proporciona `$id`), incluyendo el hash de nueva contraseña.

#### Operación 12 — Acción `guardar_usuario`: ACTUALIZAR usuario sin contraseña (UPDATE)

- **Líneas:** 266–278
- **Tipo:** `UPDATE` (prepared statement)
- **Código SQL:**
```sql
UPDATE usuario SET documento = ?, nombre_usuario = ?, correo = ?,
    id_rol = ?, id_grado = ?
WHERE id_usuario = ?
```
- **Parámetros:** `[$documento, $nombre, $correo, $id_rol, $id_grado, $id]`
- **Propósito:** Actualiza un usuario existente sin modificar la contraseña (se usa cuando no se envía nueva contraseña).

#### Operación 13 — Acción `guardar_usuario`: INSERTAR nuevo usuario (INSERT)

- **Líneas:** 301–305
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO usuario (documento, nombre_usuario, correo, password, id_rol, id_grado)
VALUES (?, ?, ?, ?, ?, ?)
```
- **Parámetros:** `[$documento, $nombre, $correo, $contrasenaHash, $id_rol, $id_grado]`
- **Propósito:** Inserta un nuevo usuario en la base de datos (admin panel).

#### Operación 14 — Acción `actualizar_perfil`: buscar usuario (SELECT)

- **Líneas:** 343–346
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_usuario, nombre_usuario, documento, correo, avatar_url FROM usuario WHERE documento = ? LIMIT 1
```
- **Parámetros:** `[$documentoActual]`
- **Propósito:** Localiza al usuario por su documento actual para obtener su `id_usuario` y datos actuales.

#### Operación 15 — Acción `actualizar_perfil`: verificar unicidad (SELECT)

- **Líneas:** 360–363
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT id_usuario FROM usuario WHERE (documento = ? OR correo = ?) AND id_usuario != ? LIMIT 1
```
- **Parámetros:** `[$docBusqueda, $correo, $idUsuario]`
- **Propósito:** Verifica que el nuevo documento y correo no estén ya en uso por otro usuario (excluyendo al propio usuario que se está actualizando).

#### Operación 16 — Acción `actualizar_perfil`: UPDATE dinámico (UPDATE)

- **Líneas:** 372–396
- **Tipo:** `UPDATE` (prepared statement dinámico)
- **Código SQL:**
```sql
UPDATE usuario SET <campos dinámicos> WHERE id_usuario = ?
```
- **Campos posibles:**
```sql
  nombre_usuario = ?
  documento = ?        -- solo si cambió
  correo = ?
  password = ?         -- solo si se envía nueva contraseña
  avatar_url = ?
```
- **Parámetros:** `[$nombre, (opcional)$nuevoDocumento, $correo, (opcional)$passwordHash, $avatar, $idUsuario]`
- **Propósito:** Actualiza el perfil del usuario dinámicamente. Solo incluye en el `SET` los campos que realmente cambiaron (documento si es distinto, password solo si se envía). La cláusula `WHERE` filtra por `id_usuario`.

#### Operación 17 — Acción `actualizar_perfil`: obtener datos actualizados (SELECT)

- **Líneas:** 399–402
- **Tipo:** `SELECT` (prepared statement)
- **Código SQL:**
```sql
SELECT nombre_usuario, documento, correo, avatar_url FROM usuario WHERE id_usuario = ? LIMIT 1
```
- **Parámetros:** `[$idUsuario]`
- **Propósito:** Después de actualizar, vuelve a consultar los datos del usuario para devolverlos actualizados al cliente.

#### Operación 18 — Acción `eliminar_usuario`: DELETE en cascada manual (DELETE)

- **Líneas:** 431–436
- **Tipo:** `DELETE` (6 sentencias, dentro de transacción)
- **Código SQL:**
```sql
DELETE FROM ranking WHERE id_usuario = ?
DELETE FROM progreso WHERE id_usuario = ?
DELETE FROM resultado WHERE id_usuario = ?
DELETE FROM flashcard WHERE id_usuario = ?
DELETE FROM simulacro WHERE id_usuario = ?
DELETE FROM usuario WHERE id_usuario = ?
```
- **Parámetros:** `[$id]` en todas
- **Propósito:** Elimina el usuario y todos sus registros relacionados en orden inverso de dependencia FK:
  1. `ranking` → 2. `progreso` → 3. `resultado` → 4. `flashcard` → 5. `simulacro` → 6. `usuario`
  Todo dentro de una transacción (`beginTransaction` → `commit`). Si falla, `rollBack()`.

#### Operación 19 — Acción `guardar_tema`: ACTUALIZAR tema (UPDATE)

- **Líneas:** 471
- **Tipo:** `UPDATE` (prepared statement)
- **Código SQL:**
```sql
UPDATE tema SET nombre_tema = ?, id_materia = ? WHERE id_tema = ?
```
- **Parámetros:** `[$nombre, $idMateria, $id]`
- **Propósito:** Actualiza el nombre y la materia asociada de un tema existente.

#### Operación 20 — Acción `guardar_tema`: INSERTAR nuevo tema (INSERT)

- **Líneas:** 481
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO tema (nombre_tema, id_materia) VALUES (?, ?)
```
- **Parámetros:** `[$nombre, $idMateria]`
- **Propósito:** Crea un nuevo tema asociado a una materia.

#### Operación 21 — Acción `eliminar_tema`: DELETE en cascada (DELETE)

- **Líneas:** 504–516
- **Tipo:** `DELETE` (4 sentencias)
- **Código SQL:**
```sql
DELETE FROM resultado WHERE id_respuesta IN (
    SELECT id_respuesta FROM respuesta
    WHERE id_pregunta IN (
        SELECT id_pregunta FROM pregunta WHERE id_tema = ?
    )
)

DELETE FROM respuesta WHERE id_pregunta IN (
    SELECT id_pregunta FROM pregunta WHERE id_tema = ?
)

DELETE FROM pregunta WHERE id_tema = ?

DELETE FROM tema WHERE id_tema = ?
```
- **Parámetro:** `[$id]` (id_tema) en todas
- **Propósito:** Elimina un tema y toda su cadena de datos dependientes:
  1. Resultados de respuestas cuyas preguntas pertenecen al tema
  2. Respuestas de las preguntas del tema
  3. Preguntas del tema
  4. El tema mismo

#### Operación 22 — Acción `guardar_pregunta`: ACTUALIZAR pregunta (UPDATE)

- **Líneas:** 561
- **Tipo:** `UPDATE` (prepared statement)
- **Código SQL:**
```sql
UPDATE pregunta SET texto_pregunta = ?, id_tema = ? WHERE id_pregunta = ?
```
- **Parámetros:** `[$texto, $idTema, $id]`
- **Propósito:** Actualiza el texto y el tema de una pregunta existente.

#### Operación 23 — Acción `guardar_pregunta`: DELETE respuestas viejas (DELETE)

- **Líneas:** 568
- **Tipo:** `DELETE` (prepared statement)
- **Código SQL:**
```sql
DELETE FROM resultado WHERE id_respuesta IN (
    SELECT id_respuesta FROM respuesta WHERE id_pregunta = ?
)
```
- **Parámetros:** `[$idPregunta]`
- **Propósito:** Al editar una pregunta existente, primero elimina los resultados de las respuestas antiguas antes de volver a insertarlas.

#### Operación 24 — Acción `guardar_pregunta`: DELETE respuestas antiguas (DELETE)

- **Líneas:** 571
- **Tipo:** `DELETE` (prepared statement)
- **Código SQL:**
```sql
DELETE FROM respuesta WHERE id_pregunta = ?
```
- **Parámetros:** `[$idPregunta]`
- **Propósito:** Elimina todas las respuestas antiguas de la pregunta antes de insertar las nuevas.

#### Operación 25 — Acción `guardar_pregunta`: INSERTAR nueva pregunta (INSERT)

- **Líneas:** 575
- **Tipo:** `INSERT` (prepared statement)
- **Código SQL:**
```sql
INSERT INTO pregunta (texto_pregunta, id_tema) VALUES (?, ?)
```
- **Parámetros:** `[$texto, $idTema]`
- **Propósito:** Crea una nueva pregunta en un tema. Lleva dentro de una transacción (`beginTransaction` → `commit`).

#### Operación 26 — Acción `guardar_pregunta`: INSERTAR respuestas (INSERT)

- **Líneas:** 585
- **Tipo:** `INSERT` (prepared statement, en bucle `foreach`)
- **Código SQL:**
```sql
INSERT INTO respuesta (id_pregunta, texto_respuesta, es_correcta) VALUES (?, ?, ?)
```
- **Parámetros:** `[$idPregunta, trim($opcion), $esCorrecta]`
- **Propósito:** Inserta cada opción de respuesta para la pregunta. `$esCorrecta` es `1` si la opción es la correcta, `0` si no.

#### Operación 27 — Acción `eliminar_pregunta`: DELETE en cascada (DELETE)

- **Líneas:** 611–617
- **Tipo:** `DELETE` (3 sentencias)
- **Código SQL:**
```sql
DELETE FROM resultado WHERE id_respuesta IN (
    SELECT id_respuesta FROM respuesta WHERE id_pregunta = ?
)

DELETE FROM respuesta WHERE id_pregunta = ?

DELETE FROM pregunta WHERE id_pregunta = ?
```
- **Parámetro:** `[$id]` (id_pregunta) en todas
- **Propósito:** Elimina una pregunta y toda su cadena:
  1. Resultados de respuestas
  2. Respuestas de la pregunta
  3. La pregunta

#### Operación 28 — Acción `verificar_rol`: buscar usuario (SELECT con JOIN)

- **Líneas:** 635–640
- **Tipo:** `SELECT` (prepared statement con JOIN)
- **Código SQL:**
```sql
SELECT u.nombre_usuario, u.correo, u.avatar_url, r.nombre_rol
FROM usuario u
LEFT JOIN rol r ON r.id_rol = u.id_rol
WHERE u.documento = ? LIMIT 1
```
- **Parámetros:** `[$documento]`
- **Propósito:** Verifica el rol de un usuario por su documento. Devuelve nombre, correo, avatar y rol. Se usa en `js/auth.js` para determinar si el usuario es admin o estudiante.

---

## 10. Resumen por tipo de operación

### Resumen por tipo

> **Nota sobre el conteo:** Cada sentencia SQL individual se cuenta por separado. Algunas operaciones "lógicas" en PHP incluyen múltiples sentencias SQL (p. ej., eliminar un usuario ejecuta 6 `DELETE` en cascada manual). Las consultas multi-línea (con sub-consultas `SELECT` anidadas) cuentan como **una sola sentencia SQL**.

| Tipo de operación | Total de sentencias | Archivos involucrados (sentencias por archivo) |
|---|---|---|
| **SELECT** | **43** | conexion.php (0), registro.php (3), login.php (1), historial.php (2), cargar_datos.php (13), ranking.php (6), recuperar.php (1), admin_datos.php (17) |
| **INSERT** | **12** | conexion.php (0), registro.php (3), login.php (0), historial.php (0), cargar_datos.php (4), ranking.php (1), recuperar.php (0), admin_datos.php (4) |
| **UPDATE** | **6** | conexion.php (0), registro.php (0), login.php (0), historial.php (0), cargar_datos.php (0), ranking.php (0), recuperar.php (1), admin_datos.php (5) |
| **DELETE** | **16** | conexion.php (0), registro.php (0), login.php (0), historial.php (0), cargar_datos.php (0), ranking.php (1), recuperar.php (0), admin_datos.php (15) |
| **CREATE TABLE** | **2** | cargar_datos.php (1), ranking.php (1) |
| **ALTER TABLE** | **0** | _(eliminado — `avatar_url` debe existir en la BD)_ |
| **Total sentencias SQL** | **79** | |

### Resumen por archivo

| Archivo | SELECT | INSERT | UPDATE | DELETE | CREATE TABLE | ALTER TABLE | Total | Descripción |
|---|---|---|---|---|---|---|---|---|
| `php/conexion.php` | 0 | 0 | 0 | 0 | 0 | 0 | **0** | Conexión PDO a MySQL (Aiven) con SSL |
| `php/registro.php` | 3 | 3 | 0 | 0 | 0 | 0 | **6** | Registro de usuarios con creación automática de rol/grado |
| `php/login.php` | 1 | 0 | 0 | 0 | 0 | 0 | **1** | Autenticación con JOIN usuario-rol |
| `php/historial.php` | 2 | 0 | 0 | 0 | 0 | 0 | **2** | Historial de simulacros con ROW_NUMBER() |
| `php/cargar_datos.php` | 13 | 4 | 0 | 0 | 1 | 0 | **18** | Registro de simulacros + carga de materias/temas/preguntas |
| `php/ranking.php` | 6 | 1 | 0 | 1 | 1 | 0 | **9** | Cálculo y actualización del ranking |
| `php/recuperar.php` | 1 | 0 | 1 | 0 | 0 | 0 | **2** | Recuperación de contraseña |
| `php/admin_datos.php` | 17 | 4 | 5 | 15 | 0 | 0 | **41** | Panel admin: CRUD completo usuarios/temas/preguntas |
| **TOTAL** | **43** | **12** | **6** | **16** | **2** | **0** | **79** | |

---

## 11. Mapa de endpoints API (Frontend JS → Backend PHP)

El siguiente mapa muestra qué archivos JavaScript llaman a qué endpoints PHP, junto con las acciones disponibles y las operaciones SQL asociadas.

| Archivo JS | Endpoint PHP | Acción (`?accion=`) | Método | Operaciones SQL asociadas |
|---|---|---|---|---|
| `js/login.js` | `php/registro.php` | _(ninguno)_ | POST | INSERT usuario, INSERT rol (fallback), INSERT grado (fallback), SELECT verificación de unicidad |
| `js/login.js` | `php/login.php` | _(ninguno)_ | POST | SELECT usuario + JOIN rol (autenticación) |
| `js/login.js` | `php/recuperar.php` | _(ninguno)_ | POST | SELECT usuario (verificar), UPDATE password |
| `js/index.js` | `php/ranking.php` | _(ninguno)_ | GET | CREATE TABLE respuesta_usuario, SELECT (ranking), DELETE ranking, INSERT ranking, SELECT COUNT, SELECT AVG |
| `js/index.js` | `php/admin_datos.php` | `usuario_por_correo` | GET | SELECT usuario (nombre, correo, avatar) |
| `js/historial.js` | `php/historial.php` | _(get por documento)_ | GET | SELECT usuario, SELECT historial (JOINs + subquery + ROW_NUMBER) |
| `js/preguntas.js` | `php/cargar_datos.php` | `materias` | GET | SELECT materia |
| `js/preguntas.js` | `php/cargar_datos.php` | `preguntas` | GET | SELECT materia, SELECT preguntas (JOINs), SELECT respuestas |
| `js/preguntas.js` | `php/cargar_datos.php` | `registrar_simulacro` | POST | SELECT usuario, SELECT COUNT simulacro, INSERT simulacro, INSERT resultado, INSERT respuesta_usuario, SELECT COUNT DISTINCT, INSERT progreso |
| `js/ranking.js` | `php/ranking.php` | _(get por documento)_ | GET | CREATE TABLE, SELECT (ranking), DELETE ranking, INSERT ranking, SELECT COUNT, SELECT AVG |
| `js/admins.js` | `php/admin_datos.php` | `grados` | GET | SELECT grado |
| `js/admins.js` | `php/admin_datos.php` | `roles` | GET | SELECT rol |
| `js/admins.js` | `php/admin_datos.php` | `materias` | GET | SELECT materia |
| `js/admins.js` | `php/admin_datos.php` | `usuarios` | GET | SELECT usuarios (JOINs) |
| `js/admins.js` | `php/admin_datos.php` | `temas` | GET | SELECT temas (con filtro / sin filtro) |
| `js/admins.js` | `php/admin_datos.php` | `tema_detalle` | GET | SELECT tema |
| `js/admins.js` | `php/admin_datos.php` | `preguntas_tema` | GET | SELECT preguntas, SELECT respuestas |
| `js/admins.js` | `php/admin_datos.php` | `pregunta_detalle` | GET | SELECT pregunta, SELECT respuestas |
| `js/admins.js` | `php/admin_datos.php` | `guardar_usuario` (POST) | POST | SELECT verificación, UPDATE usuario, INSERT usuario |
| `js/admins.js` | `php/admin_datos.php` | `actualizar_perfil` (POST) | POST | SELECT usuario, SELECT verificación unicidad, UPDATE usuario (dinámico), SELECT datos actualizados |
| `js/admins.js` | `php/admin_datos.php` | `eliminar_usuario` (POST) | POST | DELETE (6 tablas: ranking, progreso, resultado, flashcard, simulacro, usuario) |
| `js/admins.js` | `php/admin_datos.php` | `guardar_tema` (POST) | POST | UPDATE tema / INSERT tema |
| `js/admins.js` | `php/admin_datos.php` | `eliminar_tema` (POST) | POST | DELETE resultado, DELETE respuesta, DELETE pregunta, DELETE tema (4 sentencias en cascada) |
| `js/admins.js` | `php/admin_datos.php` | `guardar_pregunta` (POST) | POST | UPDATE pregunta, DELETE resultado, DELETE respuesta, INSERT pregunta, INSERT respuesta (en bucle) |
| `js/admins.js` | `php/admin_datos.php` | `eliminar_pregunta` (POST) | POST | DELETE resultado, DELETE respuesta, DELETE pregunta (3 sentencias) |
| `js/admins.js` | `php/admin_datos.php` | `verificar_rol` (POST) | POST | SELECT usuario + JOIN rol |
| `js/auth.js` | `php/admin_datos.php` | `guardar_usuario` (POST) | POST | SELECT verificación, UPDATE usuario, INSERT usuario |
| `js/auth.js` | `php/admin_datos.php` | `actualizar_perfil` (POST) | POST | SELECT usuario, SELECT unicidad, UPDATE dinámico, SELECT datos |

### Mapa de datos de la aplicación

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE DATOS                              │
├─────────────────────────────────────────────────────────────────────┤

[Frontend HTML/JS]
    │
    │ fetch() / XHR  (JSON over HTTP)
    ▼
[Backend PHP] ←→ [Base de Datos MySQL (Aiven)]
    │                    │
    │ SELECT             │ Lee datos (usuarios, preguntas, temas,
    │ INSERT             │   resultados, progresos, ranking, etc.)
    │ UPDATE             │ Escribe/modifica datos
    │ DELETE             │ Borra datos (con transacciones y FK)
    ▼                    ▼
[Respuesta JSON] ← [InnoDB con Foreign Keys + Aiven SSL]
```

---

## 12. Diagrama de relaciones (esquema simplificado)

```

usuario
  ├── id_rol → rol (id_rol)
  └── id_grado → grado (id_grado)

materia
  └── (1:N) → tema (id_tema)
       └── id_materia → materia (id_materia)
       └── (1:N) → pregunta (id_pregunta)
            └── id_tema → tema (id_tema)
            └── (1:N) → respuesta (id_respuesta)
                 └── id_pregunta → pregunta (id_pregunta)

usuario
  └── (1:N) → simulacro (id_simulacro)
       └── id_usuario → usuario (id_usuario)
  
usuario
  └── (1:N) → resultado (id_resultado)
       └── id_usuario → usuario (id_usuario)
  
resultado
  └── (1:1) → progreso (id_progreso)
       └── id_resultado → resultado (id_resultado)
       └── id_usuario → usuario (id_usuario)

usuario
  └── (1:N) → ranking (posicion)
       └── id_usuario → usuario (id_usuario)
       └── id_progreso → progreso (id_progreso)

usuario
  └── (1:N) → flashcard
       └── id_usuario → usuario (id_usuario)

usuario
  └── (1:N) → respuesta_usuario (id_respuesta_usuario)
       ├── id_usuario → usuario (id_usuario)
       ├── id_pregunta → pregunta (id_pregunta)
       └── id_resultado → resultado (id_resultado)
```

---

## 13. Buenas prácticas observadas

1. **Prepared statements con parámetros `?`:** Casi todas las consultas usan `?` como placeholders y pasan valores por separado via `execute([valores])`. Esto previene inyección SQL.

2. **Transacciones (`beginTransaction` / `commit` / `rollBack`):** Se usan en operaciones críticas como registrar un simulacro completo (`cargar_datos.php`), eliminar usuarios (`admin_datos.php`), y actualizar el ranking (`ranking.php`).

3. **Migraciones automáticas (`CREATE TABLE IF NOT EXISTS`):** Las tablas `respuesta_usuario` se crean automáticamente si no existen, permitiendo que el sistema funcione tanto con como sin la tabla de tracking avanzado.

4. **(Eliminado) Migración de columna (`ALTER TABLE`):** La migración dinámica que agregaba la columna `avatar_url` a la tabla `usuario` ha sido **eliminada**. La columna debe existir previamente en la base de datos.

5. **Claves foráneas con `ON DELETE CASCADE`:** La tabla `respuesta_usuario` define FK con eliminación en cascada, asegurando integridad referencial.

6. **DELETE manual en orden de dependencia:** Al eliminar usuarios y temas, se eliminan primero los registros hijos (ranking, progreso, resultado, flashcard, simulacro) antes de los padres (usuario).

---

*Documento generado automáticamente a partir del análisis del código fuente del proyecto SMART TEST.*
