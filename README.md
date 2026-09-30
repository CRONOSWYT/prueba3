# SMART TEST

Aplicación web para la realización de simulacros/exámenes interactivos con
seguimiento de progreso, ranking y panel de administración. Está desarrollada
en **PHP 8.2 + Apache** con frontend en **HTML/CSS/JS** puro y una base de datos
**MySQL**.

---

## ✨ Características

- 🔐 Registro e inicio de sesión de usuarios (estudiantes y administradores).
- 📝 Realización de simulacros por materia y tema con preguntas de opción múltiple.
- 📊 Historial de exámenes con promedio de respuestas correctas.
- 🏆 Ranking de usuarios con posición y promedio general.
- 👨‍💼 Panel de administración para gestionar usuarios, grados, materias, temas,
  preguntas y respuestas.
- 🌐 Interfaz bilingüe (español / inglés).
- 🛡️ Conexión a la base de datos con PDO, *prepared statements* y cifrado SSL.
- 🐳 Lista para ejecutarse en **GitHub Codespaces** (contenedores) y en **Render**.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | PHP 8.2, Apache HTTPD, PDO/MySQL |
| Frontend | HTML5, CSS3, JavaScript (ES6), SweetAlert2, Font Awesome, Quill |
| Base de datos | MySQL 8.0 |
| Contenedores | Docker + Docker Compose |
| Producción | Render (`render.yaml`) |

---

## 📂 Estructura del proyecto

```
.
├── css/                  # Hojas de estilos por página
├── js/                   # Lógica del cliente (auth, index, login, admins, …)
├── img/                  # Imágenes / logo
├── php/                  # API backend (conexion, login, registro, ranking, …)
│   └── certs/            # Certificado CA de Aiven (SSL producción)
├── *.html                # Vistas: index, login, admins, historial, pagina, …
├── Dockerfile            # Imagen de PRODUCCIÓN (Render)
├── .dockerignore         # Qué excluir de la imagen de producción
├── start.sh              # Adapta el puerto de Apache al $PORT de Render
├── render.yaml           # Despliegue en Render
├── .env.example          # Plantilla de variables de entorno
├── .gitignore
├── .devcontainer/        # ✨ Entorno de desarrollo (Codespaces)
│   ├── devcontainer.json
│   ├── Dockerfile        # Imagen DEV (PHP+Apache, sin copiar la app)
│   ├── docker-compose.yml   # Servicios: app (PHP+Apache) + db (MySQL)
│   └── mysql-init/
│       └── schema.sql    # Esquema + datos semilla de desarrollo
└── ANALISIS_CONSULTAS_SQL.md  # Análisis documental de las consultas SQL
```

---

## 🚀 Inicio rápido

### Opción A — GitHub Codespaces (recomendado)

1. Abre el repositorio en GitHub y pulsa **`<>` (Code) → Codespaces → New codespace**.
2. Codespaces leerá automáticamente `.devcontainer/devcontainer.json`, construirá
   los contenedores y montará el código en caliente en `/var/www/html`.
3. Cuando en la terminal de creación aparezca `Entorno listo`, abre
   `http://localhost:80` (Codespaces reenvía el puerto **80** automáticamente).

> La base de datos MySQL y la aplicación PHP arrancan automáticamente mediante
> `docker-compose.yml`. No necesitas instalar nada en tu máquina.
>
> 📖 **Operación detallada (puertos, conexión a tu gestor de base de datos,
> credenciales, comandos útiles…)**: consulta [`guia.md`](./guia.md).

### Opción B — Desarrollo local con Docker

```bash
# Desde la raíz del proyecto
docker compose -f .devcontainer/docker-compose.yml up --build

# La app estará en http://localhost:80
# MySQL: localhost:3306  (root: devroot, user: smart / devpass)
```

---

## ⚙️ Variables de entorno

La conexión a la base de datos se configura mediante variables de entorno,
definidas en `php/conexion.php`. Copia `.env.example` a `.env` para personalizarlas.

| Variable | Descripción | Valor dev (`docker-compose`) | Valor prod (Render) |
|----------|-------------|------------------------------|---------------------|
| `DB_HOST`     | Host de MySQL | `db` | `smarttest-smartest.c.aivencloud.com` |
| `DB_PORT`     | Puerto de MySQL | `3306` | `20038` |
| `DB_NAME`     | Base de datos | `smart_test` | `defaultdb` |
| `DB_USER`     | Usuario | `smart` | (`avnadmin`) |
| `DB_PASSWORD` | Contraseña | `devpass` | (secreto en Render) |
| `DB_SSL`      | Cifrado SSL | `false` | `true` |

> En **producción** (`DB_SSL=true`) la conexión usa el certificado CA incluido en
> `php/certs/aiven-ca.pem`. En **desarrollo** (`DB_SSL=false`) se desactiva para
> conectar con el MySQL local del contenedor.

---

## 🧪 Credenciales de desarrollo

El esquema semilla (`.devcontainer/mysql-init/schema.sql`) crea dos usuarios de
prueba (contraseña en SHA-256, compatible con el login sin PHP en el servidor):

| Usuario | Correo | Contraseña | Rol |
|---------|--------|-----------|-----|
| Admin | `admin@smart.test` | `admin` | administrador |
| Estudiante | `student@smart.test` | `student` | estudiante |

> ⚠️ Estas credenciales **solo sirven en el entorno local/Codespaces**. En
> producción el acceso se gestiona con la base de datos real de Aiven.

---

## 🔌 Mapa de endpoints API

El frontend llama al backend a través de `php/` (configurable vía `API_BASE` en
`js/`):

| Archivo PHP | Método | Uso |
|-------------|--------|-----|
| `php/conexion.php` | — | Conexión PDO compartida |
| `php/login.php` | `POST` | Inicio de sesión |
| `php/registro.php` | `POST` | Registro de nuevo usuario |
| `php/recuperar.php` | `POST` | Recuperación de contraseña |
| `php/historial.php` | `GET` | Historial de simulacros de un usuario |
| `php/ranking.php` | `GET` | Ranking general + posición del usuario |
| `php/cargar_datos.php` | `GET/POST` | Materias, temas, preguntas y registro de simulacro |
| `php/admin_datos.php` | `GET/POST` | CRUD completo del panel de admin |

---

## ☁️ Despliegue en producción

El proyecto incluye la configuración para **Render** (`render.yaml` + `Dockerfile`
+ `start.sh`). El contenedor de producción:

- Se basa en `php:8.2-apache` con la extensión `pdo_mysql`.
- Activa `mod_rewrite` de Apache.
- Configura PHP para subidas de archivos (10 MB).
- Lee la configuración de la base de datos desde variables de entorno.
- Usa `start.sh` para enlazar el puerto de Apache al `$PORT` asignado por Render.

### Variables de entorno en Render

Configúralas en el dashboard de Render como *secrets* / variables de entorno:

| Clave | Valor |
|-------|-------|
| `DB_HOST` | `smarttest-smartest.c.aivencloud.com` |
| `DB_PORT` | `20038` |
| `DB_NAME` | `defaultdb` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | *(secreto, no Hardcodeado)* |
| `DB_SSL` | `true` |

---

## 🧹 Notas de mantenimiento

- `img/img/` es el directorio destino de subidas de imágenes; se crea y se le
  otorgan permisos de escritura automáticamente en los contenedores de desarrollo.
- `ANALISIS_CONSULTAS_SQL.md` documenta cada consulta SQL del backend.
- La tabla `respuesta_usuario` se crea automáticamente con `CREATE TABLE IF NOT EXISTS`
  al registrar el primer simulacro; también se incluye en el esquema semilla.

---

## 🤝 Créditos

Desarrollado por el equipo **SMART TEST**. Licencia según lo indicado en el repositorio.
