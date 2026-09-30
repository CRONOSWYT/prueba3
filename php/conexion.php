<?php
$server   = getenv("DB_HOST")   ?: "smarttest-smartest.c.aivencloud.com";
$username = getenv("DB_USER")   ?: "avnadmin";
$password = getenv("DB_PASSWORD") ?: "";
$database = getenv("DB_NAME")   ?: "smart_test";
$port     = (int) (getenv("DB_PORT") ?: 20038);
$caCert   = __DIR__ . "/certs/aiven-ca.pem";

try {
    $conexion = new PDO(
        "mysql:host=$server;port=$port;dbname=$database;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::MYSQL_ATTR_SSL_CA => $caCert,
            PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
        ]
    );
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conexion->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode([
        "ok" => false,
        "mensaje" =>
            "Error de conexión a la base de datos: " . $e->getMessage(),
    ]);
    exit();
}
