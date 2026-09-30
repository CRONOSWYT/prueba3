<?php
$server   = getenv("DB_HOST")   ?: "smarttest-smartest.c.aivencloud.com";
$username = getenv("DB_USER")   ?: "avnadmin";
$password = getenv("DB_PASSWORD") ?: "";
$database = getenv("DB_NAME")   ?: "smart_test";
$port     = (int) (getenv("DB_PORT") ?: 20038);
$caCert   = __DIR__ . "/certs/aiven-ca.pem";

/*
 * Por defecto se usa conexión cifrada (SSL) con el certificado CA de Aiven
 * (php/certs/aiven-ca.pem). En desarrollo local (Codespaces / docker-compose)
 * la base de datos no usa SSL; define DB_SSL=false para desactivar el cifrado:
 *   DB_SSL=false|0|no -> conexión local sin SSL
 *   DB_SSL=true|1|yes (o variable sin definir) -> conexión SSL (producción)
 */
$opciones = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

$dbSsl = getenv("DB_SSL");
$usarSsl = ($dbSsl === false || $dbSsl === "")
    ? true
    : filter_var($dbSsl, FILTER_VALIDATE_BOOLEAN);

if ($usarSsl) {
    $opciones[PDO::MYSQL_ATTR_SSL_CA] = $caCert;
    $opciones[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
}

try {
    $conexion = new PDO(
        "mysql:host=$server;port=$port;dbname=$database;charset=utf8mb4",
        $username,
        $password,
        $opciones
    );
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
