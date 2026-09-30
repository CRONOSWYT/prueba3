<?php
header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

try {
    $entrada = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $correo = trim($entrada["correo"] ?? ($entrada["email"] ?? ""));
    $contrasena = $entrada["contrasena"] ?? ($entrada["pass"] ?? "");

    $consulta = $conexion->prepare(
        "SELECT u.documento, u.nombre_usuario, u.password, r.nombre_rol FROM usuario u LEFT JOIN rol r ON r.id_rol = u.id_rol WHERE LOWER(u.correo) = LOWER(?) LIMIT 1",
    );
    $consulta->execute([$correo]);
    $usuario = $consulta->fetch();

    $esPasswordValida =
        $usuario &&
        (password_verify($contrasena, (string) $usuario["password"]) ||
            hash_equals((string) $usuario["password"], $contrasena) ||
            hash_equals(
                hash("sha256", $contrasena),
                (string) $usuario["password"],
            ));

    if (!$esPasswordValida) {
        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "El correo o la contraseña ingresada no es correcta. Por favor, inténtalo de nuevo.",
        ]);
        exit();
    }

    echo json_encode([
        "ok" => true,
        "usuario" => [
            "documento" => $usuario["documento"],
            "nombre" => $usuario["nombre_usuario"],
            "rol" =>
                strtolower($usuario["nombre_rol"]) === "admin"
                    ? "admin"
                    : "estudiante",
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error de base de datos: " . $e->getMessage(),
    ]);
}
