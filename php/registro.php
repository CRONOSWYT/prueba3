<?php
header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

try {
    $entrada = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $documentoRaw = $entrada["documento"] ?? null;

    if ($documentoRaw !== null && !preg_match('/^\d+$/', (string)$documentoRaw)) {
        $documento = false;
    } else {
        $documento = filter_var($documentoRaw, FILTER_VALIDATE_INT);
    }
    $nombre = trim($entrada["nombre"] ?? "");
    $correo = trim($entrada["correo"] ?? ($entrada["email"] ?? ""));
    $contrasena = $entrada["contrasena"] ?? ($entrada["pass"] ?? "");
    $grado = filter_var($entrada["grado"] ?? null, FILTER_VALIDATE_INT);

    if (
        !$documento ||
        !$nombre ||
        !filter_var($correo, FILTER_VALIDATE_EMAIL) ||
        strlen($contrasena) < 2 ||
        !$grado
    ) {
        http_response_code(422);
        echo json_encode([
            "ok" => false,
            "mensaje" => "Por favor, completa todos los campos requeridos.",
        ]);
        exit();
    }

    $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);

    $consulta = $conexion->prepare(
        "SELECT id_usuario FROM usuario WHERE correo = ? OR documento = ? LIMIT 1",
    );
    $consulta->execute([$correo, $documento]);
    if ($consulta->rowCount() > 0) {
        http_response_code(409);
        echo json_encode([
            "ok" => false,
            "mensaje" =>
                "Este correo o documento ya está registrado. Si ya tienes cuenta, inicia sesión.",
        ]);
        exit();
    }

    $rol = $conexion
        ->query(
            "SELECT id_rol FROM rol WHERE nombre_rol = 'estudiante' LIMIT 1",
        )
        ->fetch();
    if (!$rol) {
        http_response_code(409);
        echo json_encode([
            "ok" => false,
            "mensaje" => "El rol 'estudiante' no está configurado en el sistema.",
        ]);
        exit();
    }

    $gradoConsulta = $conexion->prepare(
        "SELECT id_grado FROM grado WHERE numero_grado = ? LIMIT 1",
    );
    $gradoConsulta->execute([$grado]);
    $gradoFila = $gradoConsulta->fetch();
    if (!$gradoFila) {
        http_response_code(409);
        echo json_encode([
            "ok" => false,
            "mensaje" => "El grado seleccionado no está configurado en el sistema.",
        ]);
        exit();
    }

    $insertar = $conexion->prepare(
        "INSERT INTO usuario (correo, documento, nombre_usuario, password, id_rol, id_grado) VALUES (?, ?, ?, ?, ?, ?)",
    );
    $insertar->execute([
        $correo,
        $documento,
        $nombre,
        $contrasenaHash,
        $rol["id_rol"],
        $gradoFila["id_grado"],
    ]);

    echo json_encode([
        "ok" => true,
        "mensaje" => "Registro exitoso. Ahora puedes iniciar sesión.",
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error de base de datos: " . $e->getMessage(),
    ]);
}
