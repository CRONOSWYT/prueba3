<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once "conexion.php";

try {
    $entrada = json_decode(file_get_contents("php://input"), true) ?: $_POST;

    $documento = trim($entrada["documento"] ?? "");

    if ($documento !== "" && !preg_match('/^\d+$/', $documento)) {
        echo json_encode([
            "ok" => false,
            "mensaje" => "El documento debe contener solo números.",
        ]);
        exit();
    }
    $correo = trim($entrada["correo"] ?? "");
    $nuevaPassword = $entrada["nueva_password"] ?? "";

    if (empty($documento) || empty($correo) || empty($nuevaPassword)) {
        echo json_encode([
            "ok" => false,
            "mensaje" => "Por favor, completa todos los campos requeridos.",
        ]);
        exit();
    }

    $consulta = $conexion->prepare(
        "SELECT id_usuario FROM usuario WHERE correo = ? AND documento = ? LIMIT 1",
    );
    $consulta->execute([$correo, $documento]);
    $resultado = $consulta->fetch();

    if (!$resultado) {
        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "No se encontró ninguna cuenta con ese correo y documento.",
        ]);
        exit();
    }

    $passwordHash = password_hash($nuevaPassword, PASSWORD_DEFAULT);

    $actualizar = $conexion->prepare(
        "UPDATE usuario SET password = ? WHERE correo = ? AND documento = ?",
    );
    $actualizar->execute([$passwordHash, $correo, $documento]);

    echo json_encode([
        "ok" => true,
        "mensaje" => "¡Contraseña actualizada correctamente!",
    ]);
    exit();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error de base de datos: " . $e->getMessage(),
    ]);
}
