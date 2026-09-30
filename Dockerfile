FROM php:8.2-apache

# Install required PHP extensions
# pdo_mysql is needed for the MySQL database connection
RUN docker-php-ext-install pdo_mysql

# Enable Apache mod_rewrite for clean URLs
RUN a2enmod rewrite

# Configure PHP settings for file uploads
RUN echo "file_uploads = On" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "upload_max_filesize = 10M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 10M" >> /usr/local/etc/php/conf.d/uploads.ini

# Copy the application into the web root
COPY . /var/www/html/

# Create the image upload directory with write permissions
# (subir_imagen.php uploads images to img/img/)
RUN mkdir -p /var/www/html/img/img \
    && chmod -R 777 /var/www/html/img/img

# Ensure the web server can read all files
RUN chown -R www-data:www-data /var/www/html/

# Copy the startup script that adapts Apache to Render's PORT
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Apache runs on port 80 by default; start.sh rebinds to $PORT
EXPOSE 80

CMD ["/start.sh"]
