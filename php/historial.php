<?php

header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

try {
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $documento = $_GET["documento"] ?? $_POST["documento"] ?? null;
    $documento = filter_var($documento, FILTER_VALIDATE_INT);

    if (!$documento) {
        echo json_encode([
            "ok" => false,
            "mensaje" => "Necesitas iniciar sesión para ver tu historial.",
        ]);
        exit();
    }

    $stmt = $conexion->prepare(
        "SELECT id_usuario, nombre_usuario, id_rol FROM usuario WHERE documento = ? LIMIT 1"
    );
    $stmt->execute([$documento]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        echo json_encode([
            "ok" => false,
            "mensaje" => "Usuario no encontrado.",
        ]);
        exit();
    }

    $sql = "
        SELECT
            pr.total_intento       AS intento,
            pr.calificacion        AS puntuacion,
            r.fecha_realizacion    AS fecha,
            s.nombre_simulacro     AS materia,
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
    ";

    $stmt = $conexion->prepare($sql);
    $stmt->execute([$usuario["id_usuario"]]);
    $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "ok" => true,
        "usuario" => [
            "id_usuario"  => (int)$usuario["id_usuario"],
            "nombre"      => $usuario["nombre_usuario"],
            "documento"   => $documento,
            "id_rol"      => (int)$usuario["id_rol"],
        ],
        "historial" => $historial,
        "total_intentos" => count($historial),
    ]);
    exit();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error de servidor: " . $e->getMessage(),
    ]);
}
