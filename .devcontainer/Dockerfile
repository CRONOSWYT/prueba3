# ---------------------------------------------------------------------------
# Imagen de DESARROLLO para GitHub Codespaces / docker-compose.
# No copia la aplicación (el workspace se monta en caliente en /var/www/html).
# ---------------------------------------------------------------------------
FROM php:8.2-apache

# Extensiones y utilidades del sistema.
# pdo_mysql/mysqli  -> conexión a MySQL.
# default-mysql-client -> cliente mysql para pruebas desde el contenedor.
RUN apt-get update && apt-get install -y --no-install-recommends \
        default-mysql-client \
        libzip-dev \
        zip unzip \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_mysql mysqli \
    && a2enmod rewrite

# Apache escucha en el puerto 80.
EXPOSE 80

# El proceso principal (apache2-foreground) se define en el compose.
