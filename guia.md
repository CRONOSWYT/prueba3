# 📖 Guía de uso — SMART TEST en GitHub Codespaces

Esta guía te explica **todo** lo que necesitas saber para usar el proyecto
**SMART TEST** desde **GitHub Codespaces**. El codespace hostea, de forma
automática y con contenedores, **dos servicios**:

1. 🐬 **MySQL 8.0** → la base de datos de la aplicación.
2. 🌐 **Apache + PHP 8.2** → la aplicación web (SMART TEST).

---

## 1. Qué se incluye en el codespace

| Servicio | Imagen | Puerto | Usuario | Password | Base de datos |
|----------|--------|--------|---------|----------|---------------|
| Web (app) | `php:8.2-apache` + extensiones | `80` (HTTP) | — | — | — |
| Base de datos (db) | `mysql:8.0` | `3306` | `smart` | `devpass` | `smart_test` |

> El código fuente se monta **en caliente** en `/var/www/html`, así que cualquier
> cambio que guardes en los archivos `*.html`, `css/`, `js/` o `php/` se
> refleja al instante en el servidor sin reconstruir la imagen.

---

## 2. Crear y abrir el codespace

1. Abre el repositorio en GitHub.
2. Pulsa el botón **`<>` (Code)**.
3. En la pestaña **Codespaces**, pulsa **New codespace**.
4. Espera a que termine la creación (se construyen las imágenes y arrancan los
   contenedores). Verás, en la terminal de creación, el mensaje
   `Entorno listo`.
5. La aplicación está disponible en la URL que Codespaces abre automáticamente
   (puerto **80**) → abre `http://localhost:80`.

> El primer arranque puede tardar un par de minutos en inicializar MySQL con el
> esquema y los datos semilla. La barra de progreso de Codespaces lo indica.

---

## 3. Puertos y reenvío

### Port 80 — Aplicación web
- Se reenvía **automáticamente**. Ábrelo en el navegador y verás SMART TEST.

### Port 3306 — MySQL (para tu gestor de base de datos)
- El contenedor `db` publica el **3306**. Codespaces lo muestra en la **vista
  de Puertos** (`View → Ports` o el icono de enchufe en la barra lateral).
- **Importante:** haz clic en el menú de la columna **Visibility** de la fila
  `3306` y selecciócciona **Private** para que solo tú puedas acceder a la base
  de datos (no la dejes pública).
- Una vez reenviado, el puerto `3306` está disponible en tu máquina local.

---

## 4. Conecta tu gestor de base de datos

Puedes conectar **cualquier gestor** (TablePlus, DBeaver, MySQL Workbench,
phpMyAdmin, o el cliente `mysql`) a la base de datos del codespace.

### Opción A — Desde tu máquina local (a través del reenvío de Codespaces)

| Campo | Valor |
|-------|-------|
| **Host / Server** | `127.0.0.1` *(o `localhost`)* |
| **Port / Puerto** | `3306` *(el puerto reenviado de Codespaces)* |
| **Usuario** | `smart` |
| **Contraseña** | `devpass` |
| **Base de datos** | `smart_test` |

#### Paso a paso en DBeaver (ejemplo genérico)
1. *Database → Database Connection → MySQL*.
2. Host: `127.0.0.1`, Port: `3306`, Database: `smart_test`.
3. Username: `smart`, Password: `devpass`.
4. Pulsa **Test Connection** → **Finish**.

#### Paso a paso en TablePlus
1. Nueva conexión → MySQL.
2. Host: `127.0.0.1`, Port: `3306`, User: `smart`, Password: `devpass`, DB: `smart_test`.
3. Guardar y conectar.

> ⚠️ Si tu gestor se queja del plugin de autenticación, el contenedor ya usa
> `mysql_native_password` (`command: --default-authentication-plugin=...`),
> por lo que la conexión debe funcionar con cualquier cliente.

### Opción B — Con el cliente `mysql` dentro del propio codespace
El contenedor `app` tiene instalado el cliente `mysql`, así que también puedes
conectar directamente al servicio `db` (por nombre de servicio en la red de
docker-compose):

```bash
# Desde la terminal del codespace (estás dentro del contenedor app)
mysql -h db -P 3306 -u smart -p smart_test
# password: devpass
```

### Opción C — Credenciales de root (solo para administración)
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p   # password: devroot
```

---

## 5. Credenciales de desarrollo

El esquema semilla crea usuarios de prueba para iniciar sesión en la web:

| Tipo | Correo | Contraseña |
|------|--------|-----------|
| Admin | `admin@smart.test` | `admin` |
| Estudiante | `student@smart.test` | `student` |

> Estas credenciales **solo sirven en el entorno local/Codespaces**. En
> producción (Render) los usuarios reales se registran desde la propia web y se
> guardan en la base de datos de Aiven.

---

## 6. Qué hacer / no hacer en el codespace

### ✅ Comandos útiles
```bash
# Ver que los contenedores están arriba y qué puertos están reenviados
docker ps

# Ver los logs de la base de datos (para confirmar que terminó la importación)
docker compose -f .devcontainer/docker-compose.yml logs db

# Ver los logs de la web (errores PHP, peticiones)
docker compose -f .devcontainer/docker-compose.yml logs app

# Conectarte a la base de datos desde el codespace
mysql -h db -u smart -p smart_test     # (password: devpass)

# Probar la conexión PHP → MySQL desde dentro del contenedor app
php -r "require 'php/conexion.php'; echo $conexion->query('SELECT VERSION()')->fetchColumn();"

# Forzar un rebuild de las imágenes (p. ej. tras cambiar .devcontainer/Dockerfile)
docker compose -f .devcontainer/docker-compose.yml up --build -d
```

### 🔄 Reconstruir el entorno
Si cambias algo en `.devcontainer/Dockerfile` o quieres "empezar de cero":
1. En VS Code abre la paleta (`Ctrl+Shift+P`).
2. Escribe **"Codespaces: Regenerate"** (o *"Rebuild Container"*).
3. Se reconstruye y reinicia todo.

### 🧹 "Limpiar" la base de datos de pruebas
Para borrar todos los datos de prueba y volver a cargar el esquema:
```bash
docker compose -f .devcontainer/docker-compose.yml down -v   # borra los datos
docker compose -f .devcontainer/docker-compose.yml up --build
```
> `down -v` elimina el volumen `mysql_data`, por lo que MySQL vuelve a ejecutar
> `mysql-init/schema.sql` desde cero.

---

## 7. Notas sobre la configuración

- **Variables de entorno** → mira `.env.example`. El compose ya define las
  variables de conexión (`DB_HOST=db`, `DB_USER=smart`, `DB_PASSWORD=devpass`,
  `DB_SSL=false`), por lo que **`php/conexion.php` se conecta a MySQL local sin
  necesidad de crear un `.env`**.
- **SSL** → en desarrollo `DB_SSL=false` desactiva el cifrado (MySQL local no
  necesita SSL). En producción, sin `DB_SSL`, se activa el SSL con el
  certificado de Aiven en `php/certs/aiven-ca.pem`.
- **Subidas de imágenes** → `img/img/` es el directorio de uploads; el
  `postCreateCommand` del codespace lo crea con permisos de escritura.

---

## 8. Estructura de archivos (recordatorio)

```
.
├── *.html                # Vistas (index, login, admins, historial, …)
├── css/                  # Estilos
├── js/                   # Lógica cliente
├── php/                  # API backend (conexion, login, registro, …)
│   └── certs/aiven-ca.pem
├── img/                  # Imágenes
├── Dockerfile            # Imagen de PRODUCCIÓN (Render)
├── start.sh              # start.sh de Render (adapta el $PORT)
├── render.yaml           # Deploy en Render
├── .env.example          # Referencia de variables de entorno
├── .gitignore / .dockerignore
├── ANALISIS_CONSULTAS_SQL.md  # Documentación de consultas
└── .devcontainer/        # ← Entorno de desarrollo (Codespaces)
    ├── devcontainer.json
    ├── Dockerfile        # Imagen DEV (PHP+Apache)
    ├── docker-compose.yml     # app + db
    └── mysql-init/schema.sql  # Esquema + datos semilla
```

---

## 9. Solución de problemas (FAQ)

| Síntoma | Causa / Solución |
|---------|------------------|
| La web carga pero falla la conexión a la base | Asegúrate de que el contenedor `db` está `healthy` (`docker compose ps`). Si sigue fallando, revisa los logs: `docker compose logs db`. |
| El gestor local no conecta al 3306 | El puerto 3306 debe estar **reenviado** en la vista de Puertos y marcado como **Private**. |
| "Can't connect to MySQL server" desde el gestor | Espera a que MySQL termine la inicialización (el primer arranque tarda más). |
| Los datos no se guardan | Verifica que el volumen `mysql_data` no esté montado como readonly; reinícialo con `down -v` y `up`. |
| Quieres la misma base de datos que usa el proyecto | En producción la base real está en Aiven (configura `DB_HOST`/`DB_PASSWORD` como *secrets* en Render). |
