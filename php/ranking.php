<?php

header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

try {
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $documento = $_GET["documento"] ?? $_POST["documento"] ?? null;
    $documento = filter_var($documento, FILTER_VALIDATE_INT);

    // Detectar si la tabla respuesta_usuario existe Y tiene datos
    $tieneDatosRespuestaUsuario = false;
    try {
        $cnt = (int)$conexion->query("SELECT COUNT(*) FROM respuesta_usuario")->fetchColumn();
        $tieneDatosRespuestaUsuario = $cnt > 0;
    } catch (Throwable $e) {
        $tieneDatosRespuestaUsuario = false;
    }

    if ($tieneDatosRespuestaUsuario) {
        // --- SISTEMA NUEVO: preguntas distintas acertadas (sin duplicados) ---
        // El filtro HAVING está dentro del subquery para evitar problemas de resolución de columnas
        $sql = "
            SELECT ranked.* FROM (
                SELECT u.id_usuario, u.nombre_usuario, u.avatar_url, u.documento, u.id_rol,
                       COALESCE(ru.correctas_distintas, 0)          AS preguntas_correctas,
                       COALESCE(SUM(pr.calificacion), 0)           AS total_puntos,
                       COALESCE(ru.total_distintas, 0)             AS total_respondidas,
                       COALESCE(AVG(pr.calificacion), 0)           AS promedio,
                       COALESCE(MAX(pr.calificacion), 0)           AS ultima_calificacion,
                       COALESCE(MAX(pr.total_intento), 0)          AS total_intentos,
                       (SELECT pr2.id_progreso
                          FROM progreso pr2
                          WHERE pr2.id_usuario = u.id_usuario
                          ORDER BY pr2.id_progreso DESC
                          LIMIT 1) AS ultimo_progreso
                FROM usuario u
                INNER JOIN (
                    SELECT id_usuario,
                           COUNT(DISTINCT id_pregunta) AS total_distintas,
                           SUM(CASE WHEN acierto = 1 THEN 1 ELSE 0 END) AS correctas_distintas
                    FROM respuesta_usuario
                    GROUP BY id_usuario
                    HAVING correctas_distintas > 0
                ) ru ON ru.id_usuario = u.id_usuario
                LEFT JOIN progreso pr
                    ON pr.id_usuario = u.id_usuario
                GROUP BY u.id_usuario, u.nombre_usuario, u.documento, u.id_rol
            ) ranked
            WHERE COALESCE(ranked.preguntas_correctas, 0) > 0
            ORDER BY ranked.promedio DESC, ranked.nombre_usuario ASC
        ";
    } else {
        // --- SISTEMA LEGACY: suma de calificaciones de progreso ---
        $sql = "
            SELECT u.id_usuario, u.nombre_usuario, u.avatar_url, u.documento, u.id_rol,
                   COALESCE(SUM(r.total_respuestas_buenas), 0) AS preguntas_correctas,
                   COALESCE(SUM(pr.calificacion), 0)            AS total_puntos,
                   COALESCE(AVG(pr.calificacion), 0)            AS promedio,
                   COALESCE(MAX(pr.calificacion), 0)            AS ultima_calificacion,
                   COALESCE(MAX(pr.total_intento), 0)           AS total_intentos,
                   (SELECT pr2.id_progreso
                      FROM progreso pr2
                      WHERE pr2.id_usuario = u.id_usuario
                      ORDER BY pr2.id_progreso DESC
                      LIMIT 1) AS ultimo_progreso
            FROM usuario u
            LEFT JOIN resultado r
                ON r.id_usuario = u.id_usuario
            LEFT JOIN progreso pr
                ON pr.id_usuario = u.id_usuario
            WHERE u.id_usuario IS NOT NULL
            GROUP BY u.id_usuario, u.nombre_usuario, u.documento, u.id_rol
            HAVING COALESCE(SUM(r.total_respuestas_buenas), 0) > 0
            ORDER BY promedio DESC, u.nombre_usuario ASC
        ";
    }

    $stmt = $conexion->query($sql);
    $filas = $stmt->fetchAll();

    $ranking = [];
    $posicionUsuario = null;

    foreach ($filas as $i => $f) {
        $posicion = $i + 1;
        $puntos = (float)$f["total_puntos"];

        $ranking[] = [
            "posicion" => $posicion,
            "id_usuario" => (int)$f["id_usuario"],
            "nombre" => $f["nombre_usuario"],
            "avatar_url" => $f["avatar_url"] ?? null,
            "documento" => $f["documento"],
            "id_rol" => isset($f["id_rol"]) ? (int)$f["id_rol"] : 0,
            "preguntas_correctas" => (int)$f["preguntas_correctas"],
            "total_puntos" => round($puntos, 2),
            "promedio" => isset($f["promedio"]) ? round((float)$f["promedio"], 2) : 0,
            "ultima_calificacion" => (float)$f["ultima_calificacion"],
            "total_intentos" => (int)$f["total_intentos"],
            "ultimo_progreso" => $f["ultimo_progreso"] !== null ? (int)$f["ultimo_progreso"] : null,
        ];

        if ($documento && (int)$f["documento"] === (int)$documento) {
            $posicionUsuario = $posicion;
        }
    }

    $conexion->beginTransaction();
    try {
        $conexion->exec("DELETE FROM ranking");
        $ins = $conexion->prepare(
            "INSERT INTO ranking (posicion, id_usuario, id_progreso) VALUES (?, ?, ?)"
        );
        foreach ($ranking as $item) {
            $ins->execute([
                $item["posicion"],
                $item["id_usuario"],
                $item["ultimo_progreso"],
            ]);
        }
        $conexion->commit();
    } catch (Throwable $e) {
        if ($conexion->inTransaction()) $conexion->rollBack();
        throw $e;
    }

    $sqlCountUsuarios = "SELECT COUNT(*) FROM usuario WHERE id_usuario IS NOT NULL";
    $totalUsuarios = (int)$conexion->query($sqlCountUsuarios)->fetchColumn();

    // Promedio general: promedio de calificaciones obtenidas en cada intento
    $promedioGeneral = 0.0;
    try {
        $stmtProm = $conexion->query(
            "SELECT COALESCE(AVG(calificacion), 0) AS prom FROM progreso"
        );
        $promedioGeneral = round((float)$stmtProm->fetchColumn(), 2);
    } catch (Throwable $e) {
        $promedioGeneral = 0.0;
    }

    echo json_encode([
        "ok" => true,
        "ranking" => $ranking,
        "posicion_usuario" => $posicionUsuario,
        "total_usuarios" => $totalUsuarios,
        "promedio_general" => $promedioGeneral,
        "sistema" => $tieneDatosRespuestaUsuario ? "distintas" : "legacy",
    ]);
    exit();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error de base de datos: " . $e->getMessage(),
    ]);
}
