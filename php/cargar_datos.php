<?php
header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

try {
    $accion = $_GET["accion"] ?? $_POST["accion"] ?? "";
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $entradaRaw = json_decode(file_get_contents("php://input"), true);
        $entrada = is_array($entradaRaw) ? $entradaRaw : [];
        $accion = $entrada["accion"] ?? $accion;
    }

    // Verificar si la tabla respuesta_usuario existe (debe crearse vía SQL)
    $tieneRespuestaUsuario = false;
    try {
        $check = $conexion->query(
            "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'respuesta_usuario' LIMIT 1"
        );
        $tieneRespuestaUsuario = (bool)$check->fetch();
    } catch (Throwable $e) {
        $tieneRespuestaUsuario = false;
    }

    if ($accion === "registrar_simulacro") {

        $documento = $entrada["documento"] ?? null;
        $nombreMateria = $entrada["nombre_materia"] ?? "";
        $respuestas = is_array($entrada["respuestas"] ?? null) ? $entrada["respuestas"] : [];

        $idUsuario = null;
        if ($documento !== null && $documento !== "") {
            $s = $conexion->prepare("SELECT id_usuario FROM usuario WHERE documento = ? LIMIT 1");
            $s->execute([$documento]);
            $u = $s->fetch();
            if ($u) $idUsuario = (int)$u["id_usuario"];
        }

        if (!$idUsuario) {
            echo json_encode(["ok" => false, "mensaje" => "Usuario no identificado."]);
            exit();
        }

        $c = $conexion->prepare("SELECT COUNT(*) FROM simulacro WHERE id_usuario = ?");
        $c->execute([$idUsuario]);
        $intento = (int)$c->fetchColumn() + 1;

        $nombreSimulacro = "Simulacro: " . ($nombreMateria ?: "materia");

        $conexion->beginTransaction();
        try {

            $sql = $conexion->prepare("INSERT INTO simulacro (nombre_simulacro, id_usuario) VALUES (?, ?)");
            $sql->execute([$nombreSimulacro, $idUsuario]);
            $idSimulacro = (int)$conexion->lastInsertId();


            $totalBuenas = 0;
            $totalMalas = 0;
            foreach ($respuestas as $r) {
                $acierto = (bool)($r["acierto"] ?? false);
                if ($acierto) { $totalBuenas++; } else { $totalMalas++; }
            }

            $idResInsert = $conexion->prepare(
                "INSERT INTO resultado (total_respuestas_buenas, total_respuestas_malas, fecha_realizacion, numero_intento, id_usuario)
                 VALUES (?, ?, NOW(), ?, ?)"
            );
            $idResInsert->execute([
                $totalBuenas,
                $totalMalas,
                $intento,
                $idUsuario
            ]);
            $primeraResultadoId = (int)$conexion->lastInsertId();
            $total = max((int)($entrada["total_preguntas"] ?? 0), count($respuestas));

            $calificacion = round(0.5 * $totalBuenas, 2);

            // --- Guardar respuestas individuales en respuesta_usuario ---
            $preguntasDistintasCorrectas = 0;
            $totalDistintasRespondidas = 0;
            $promedio = 0.0;

            if ($tieneRespuestaUsuario) {
                try {
                    $stmtInsertRU = $conexion->prepare(
                        "INSERT INTO respuesta_usuario (id_usuario, id_pregunta, id_resultado, acierto)
                         VALUES (?, ?, ?, ?)"
                    );
                    foreach ($respuestas as $r) {
                        $idPreg = $r["id_pregunta"] ?? null;
                        if ($idPreg === null) continue;
                        $stmtInsertRU->execute([
                            $idUsuario,
                            (int)$idPreg,
                            $primeraResultadoId,
                            (bool)($r["acierto"] ?? false) ? 1 : 0,
                        ]);
                    }

                    // --- Contar preguntas distintas acertadas (no duplicadas) ---
                    $stmtDistinct = $conexion->prepare(
                        "SELECT COUNT(DISTINCT id_pregunta) FROM respuesta_usuario
                         WHERE id_usuario = ? AND acierto = 1"
                    );
                    $stmtDistinct->execute([$idUsuario]);
                    $preguntasDistintasCorrectas = (int)$stmtDistinct->fetchColumn();

                    // --- Total de preguntas distintas respondidas ---
                    $stmtTotalRespondidas = $conexion->prepare(
                        "SELECT COUNT(DISTINCT id_pregunta) FROM respuesta_usuario
                         WHERE id_usuario = ?"
                    );
                    $stmtTotalRespondidas->execute([$idUsuario]);
                    $totalDistintasRespondidas = (int)$stmtTotalRespondidas->fetchColumn();

                    $promedio = $totalDistintasRespondidas > 0
                        ? round(($preguntasDistintasCorrectas * 0.5) / $totalDistintasRespondidas, 2)
                        : 0.0;
                } catch (Throwable $e) {
                    // Si falla el tracking individual, seguimos con el sistema legacy
                }
            }

            $sql = $conexion->prepare("INSERT INTO progreso (total_intento, calificacion, id_resultado, id_usuario) VALUES (?, ?, ?, ?)");
            $sql->execute([$intento, $calificacion, $primeraResultadoId, $idUsuario]);
            $idProgreso = (int)$conexion->lastInsertId();

            $conexion->commit();
            echo json_encode([
                "ok" => true,
                "id_simulacro" => $idSimulacro,
                "id_progreso" => $idProgreso,
                "id_resultado" => $primeraResultadoId,
                "calificacion" => $calificacion,
                "numero_intento" => $intento,
                "total_buenas" => $totalBuenas,
                "total_malas" => $totalMalas,
                "total" => $total,
                "preguntas_distintas_correctas" => $preguntasDistintasCorrectas,
                "total_distintas_respondidas" => $totalDistintasRespondidas,
                "promedio" => $promedio,
                "mensaje" => "Examen registrado por preguntas.",
            ]);
            exit();
        } catch (Throwable $e) {
            $conexion->rollBack();
            throw $e;
        }
    }

    if ($accion === "materias") {

        $stmt = $conexion->query("SELECT id_materia, nombre_materia FROM materia ORDER BY nombre_materia");
        $materias = $stmt->fetchAll();
        echo json_encode(["ok" => true, "materias" => $materias]);
        exit();
    }

    if ($accion === "temas") {
        $idMateria = filter_var($_GET["id_materia"] ?? null, FILTER_VALIDATE_INT);
        if ($idMateria) {
            $stmt = $conexion->prepare("SELECT t.id_tema, t.nombre_tema, m.nombre_materia, t.id_materia FROM tema t JOIN materia m ON t.id_materia = m.id_materia WHERE t.id_materia = ? ORDER BY t.id_tema");
            $stmt->execute([$idMateria]);
        } else {
            $stmt = $conexion->query("SELECT t.id_tema, t.nombre_tema, m.nombre_materia, t.id_materia FROM tema t JOIN materia m ON t.id_materia = m.id_materia ORDER BY m.id_materia, t.id_tema");
        }
        $temas = $stmt->fetchAll();
        echo json_encode(["ok" => true, "temas" => $temas]);
        exit();
    }

    if ($accion === "preguntas_tema") {
        $idTema = filter_var($_GET["id_tema"] ?? 0, FILTER_VALIDATE_INT);
        if (!$idTema) {
            echo json_encode(["ok" => false, "mensaje" => "Tema no válido."]);
            exit();
        }
        $stmt = $conexion->prepare("
            SELECT p.id_pregunta, p.texto_pregunta
            FROM pregunta p
            WHERE p.id_tema = ?
            ORDER BY p.id_pregunta
        ");
        $stmt->execute([$idTema]);
        $preguntasBase = $stmt->fetchAll();

        $preguntas = [];
        foreach ($preguntasBase as $p) {
            $stmt2 = $conexion->prepare("
                SELECT id_respuesta, texto_respuesta, es_correcta
                FROM respuesta
                WHERE id_pregunta = ?
                ORDER BY id_respuesta
            ");
            $stmt2->execute([$p["id_pregunta"]]);
            $respuestas = $stmt2->fetchAll();


            $letras = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
            foreach ($respuestas as $i => $r) {
                $letra = $letras[$i] ?? ("op" . ($i + 1));
                $p["opcion_" . $letra] = $r["texto_respuesta"];
                if ($r["es_correcta"]) {
                    $p["respuesta_correcta"] = is_numeric($letra) ? strval($i) : strtoupper($letra);
                }
            }
            $p["pregunta"] = $p["texto_pregunta"];

            $p["opciones"] = array_column($respuestas, "texto_respuesta");
            $p["opcion_ids"] = array_column($respuestas, "id_respuesta");

            $preguntas[] = $p;
        }

        echo json_encode(["ok" => true, "preguntas" => $preguntas]);
        exit();
    }

    if ($accion === "preguntas") {
        $idMateria = filter_var($_GET["id_materia"] ?? null, FILTER_VALIDATE_INT);
        if (!$idMateria) {
            echo json_encode(["ok" => false, "mensaje" => "Materia no válida."]);
            exit();
        }


        $stmt = $conexion->prepare("SELECT nombre_materia FROM materia WHERE id_materia = ?");
        $stmt->execute([$idMateria]);
        $materia = $stmt->fetch();


        $stmt = $conexion->prepare("
            SELECT p.id_pregunta, p.texto_pregunta, t.nombre_tema
            FROM pregunta p
            JOIN tema t ON t.id_tema = p.id_tema
            JOIN materia m ON m.id_materia = t.id_materia
            WHERE m.id_materia = ?
            ORDER BY p.id_pregunta
        ");
        $stmt->execute([$idMateria]);
        $preguntasBase = $stmt->fetchAll();


        $preguntas = [];
        foreach ($preguntasBase as $p) {
            $stmt2 = $conexion->prepare("
                SELECT id_respuesta, texto_respuesta, es_correcta
                FROM respuesta
                WHERE id_pregunta = ?
                ORDER BY id_respuesta
            ");
            $stmt2->execute([$p["id_pregunta"]]);
            $respuestas = $stmt2->fetchAll();

            $letras = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
            foreach ($respuestas as $i => $r) {
                $letra = $letras[$i] ?? ("op" . ($i + 1));
                $p["opcion_" . $letra] = $r["texto_respuesta"];
                if ($r["es_correcta"]) {
                    $p["respuesta_correcta"] = is_numeric($letra) ? strval($i) : strtoupper($letra);
                }
            }


            $p["pregunta"] = $p["texto_pregunta"];
            $p["opciones"] = array_column($respuestas, "texto_respuesta");
            $p["opcion_ids"] = array_column($respuestas, "id_respuesta");

            $preguntas[] = $p;
        }

        echo json_encode([
            "ok" => true,
            "materia" => $materia["nombre_materia"],
            "preguntas" => $preguntas,
        ]);
        exit();
    }

    echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
    exit();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "mensaje" => "Error de base de datos: " . $e->getMessage()]);
}
