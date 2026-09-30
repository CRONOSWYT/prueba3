<?php
header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

try {
    $method = $_SERVER["REQUEST_METHOD"];
    $accion = $_GET["accion"] ?? "";

    if ($method === "GET") {
        if ($accion === "usuarios") {
            $stmt = $conexion->query("
                SELECT u.id_usuario, u.documento, u.nombre_usuario, u.correo, u.password,
                       u.id_grado, u.id_rol,
                       g.numero_grado, r.nombre_rol
                FROM usuario u
                LEFT JOIN grado g ON g.id_grado = u.id_grado
                LEFT JOIN rol r ON r.id_rol = u.id_rol
                ORDER BY u.documento DESC
            ");
            $usuarios = $stmt->fetchAll();
            echo json_encode(["ok" => true, "usuarios" => $usuarios]);
            exit();
        }

        if ($accion === "grados") {
            $stmt = $conexion->query(
                "SELECT id_grado, numero_grado FROM grado ORDER BY numero_grado",
            );
            echo json_encode(["ok" => true, "grados" => $stmt->fetchAll()]);
            exit();
        }

        if ($accion === "roles") {
            $stmt = $conexion->query(
                "SELECT id_rol, nombre_rol FROM rol ORDER BY id_rol",
            );
            echo json_encode(["ok" => true, "roles" => $stmt->fetchAll()]);
            exit();
        }

        if ($accion === "materias") {
            $stmt = $conexion->query(
                "SELECT id_materia, nombre_materia FROM materia ORDER BY nombre_materia",
            );
            echo json_encode(["ok" => true, "materias" => $stmt->fetchAll()]);
            exit();
        }

        if ($accion === "temas") {
            $idMateria = filter_var(
                $_GET["id_materia"] ?? 0,
                FILTER_VALIDATE_INT,
            );
            if ($idMateria) {
                $stmt = $conexion->prepare(
                    "SELECT t.id_tema, t.nombre_tema, t.id_materia, m.nombre_materia FROM tema t JOIN materia m ON t.id_materia = m.id_materia WHERE t.id_materia = ? ORDER BY t.id_tema",
                );
                $stmt->execute([$idMateria]);
            } else {
                $stmt = $conexion->query(
                    "SELECT t.id_tema, t.nombre_tema, t.id_materia, m.nombre_materia FROM tema t JOIN materia m ON t.id_materia = m.id_materia ORDER BY m.id_materia, t.id_tema",
                );
            }
            echo json_encode(["ok" => true, "temas" => $stmt->fetchAll()]);
            exit();
        }

        if ($accion === "usuario_por_correo") {
            $correo = trim($_GET["correo"] ?? "");
            if (!$correo) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Correo no proporcionado.",
                ]);
                exit();
            }
            $stmt = $conexion->prepare(
                "SELECT nombre_usuario, correo, avatar_url FROM usuario WHERE correo = ? LIMIT 1"
            );
            $stmt->execute([$correo]);
            $usuario = $stmt->fetch();
            if (!$usuario) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Usuario no encontrado.",
                ]);
                exit();
            }
            echo json_encode([
                "ok" => true,
                "nombre" => $usuario["nombre_usuario"],
                "correo" => $usuario["correo"],
                "avatar_url" => $usuario["avatar_url"],
            ]);
            exit();
        }

        if ($accion === "preguntas_tema") {
            $idTema = filter_var($_GET["id_tema"] ?? 0, FILTER_VALIDATE_INT);
            if (!$idTema) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Tema no válido.",
                ]);
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
                    $letra = $letras[$i] ?? "op" . ($i + 1);
                    $p["opcion_" . $letra] = $r["texto_respuesta"];
                    if ($r["es_correcta"]) {
                        $p["respuesta_correcta"] = is_numeric($letra)
                            ? strval($i)
                            : strtoupper($letra);
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

        if ($accion === "tema_detalle") {
            $idTema = filter_var($_GET["id_tema"] ?? 0, FILTER_VALIDATE_INT);
            if (!$idTema) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Tema no válido.",
                ]);
                exit();
            }
            $stmt = $conexion->prepare(
                "SELECT id_tema, nombre_tema, id_materia FROM tema WHERE id_tema = ?",
            );
            $stmt->execute([$idTema]);
            $tema = $stmt->fetch();
            if (!$tema) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Tema no encontrado.",
                ]);
                exit();
            }
            echo json_encode(["ok" => true, "tema" => $tema]);
            exit();
        }

        if ($accion === "pregunta_detalle") {
            $idPregunta = filter_var(
                $_GET["id_pregunta"] ?? 0,
                FILTER_VALIDATE_INT,
            );
            if (!$idPregunta) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Pregunta no válida.",
                ]);
                exit();
            }
            $stmt = $conexion->prepare(
                "SELECT id_pregunta, texto_pregunta, id_tema FROM pregunta WHERE id_pregunta = ?",
            );
            $stmt->execute([$idPregunta]);
            $pregunta = $stmt->fetch();
            if (!$pregunta) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Pregunta no encontrada.",
                ]);
                exit();
            }
            $stmt2 = $conexion->prepare(
                "SELECT texto_respuesta, es_correcta FROM respuesta WHERE id_pregunta = ? ORDER BY id_respuesta",
            );
            $stmt2->execute([$idPregunta]);
            $respuestas = $stmt2->fetchAll();
            $pregunta["opciones"] = array_column(
                $respuestas,
                "texto_respuesta",
            );
            $pregunta["respuesta_correcta"] = null;
            foreach ($respuestas as $i => $r) {
                if ($r["es_correcta"]) {
                    $pregunta["respuesta_correcta"] = $i;
                    break;
                }
            }
            echo json_encode(["ok" => true, "pregunta" => $pregunta]);
            exit();
        }
    }

    if ($method === "POST") {
        $entrada =
            json_decode(file_get_contents("php://input"), true) ?: $_POST;
        $accion = $entrada["accion"] ?? "";

        if ($accion === "guardar_usuario") {
            $id = $entrada["id"] ?? null;
            $documento = $entrada["documento"] ?? null;
            $nombre = trim($entrada["nombre"] ?? "");
            $correo = trim($entrada["correo"] ?? "");
            $contrasena = $entrada["contrasena"] ?? "";
            $id_grado = $entrada["id_grado"] ?? null;
            $id_rol = $entrada["id_rol"] ?? null;

            if (
                !$documento ||
                !$nombre ||
                !filter_var($correo, FILTER_VALIDATE_EMAIL) ||
                !$id_rol
            ) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Completa todos los campos requeridos.",
                ]);
                exit();
            }

            $contrasenaHash = $contrasena
                ? password_hash($contrasena, PASSWORD_DEFAULT)
                : null;

            if ($id) {
                if ($contrasenaHash) {
                    $stmt = $conexion->prepare("
                        UPDATE usuario SET documento = ?, nombre_usuario = ?, correo = ?,
                            password = ?, id_rol = ?, id_grado = ?
                        WHERE id_usuario = ?
                    ");
                    $stmt->execute([
                        $documento,
                        $nombre,
                        $correo,
                        $contrasenaHash,
                        $id_rol,
                        $id_grado,
                        $id,
                    ]);
                } else {
                    $stmt = $conexion->prepare("
                        UPDATE usuario SET documento = ?, nombre_usuario = ?, correo = ?,
                            id_rol = ?, id_grado = ?
                        WHERE id_usuario = ?
                    ");
                    $stmt->execute([
                        $documento,
                        $nombre,
                        $correo,
                        $id_rol,
                        $id_grado,
                        $id,
                    ]);
                }
            } else {
                $stmt = $conexion->prepare(
                    "SELECT id_usuario FROM usuario WHERE documento = ? OR correo = ? LIMIT 1",
                );
                $stmt->execute([$documento, $correo]);
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        "ok" => false,
                        "mensaje" =>
                            "Este documento o correo ya está registrado.",
                    ]);
                    exit();
                }
                if (!$contrasenaHash) {
                    echo json_encode([
                        "ok" => false,
                        "mensaje" =>
                            "La contraseña es obligatoria para nuevos usuarios.",
                    ]);
                    exit();
                }
                $stmt = $conexion->prepare("
                    INSERT INTO usuario (documento, nombre_usuario, correo, password, id_rol, id_grado)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $documento,
                    $nombre,
                    $correo,
                    $contrasenaHash,
                    $id_rol,
                    $id_grado,
                ]);
            }

            echo json_encode([
                "ok" => true,
                "mensaje" => "Usuario guardado correctamente.",
            ]);
            exit();
        }

        if ($accion === "actualizar_perfil") {
            $documentoActual = $entrada["documento_actual"] ?? $entrada["documento"] ?? null;
            $nombre = trim($entrada["nombre_usuario"] ?? "");
            $correo = trim($entrada["correo"] ?? "");
            $contrasena = $entrada["password"] ?? "";
            $avatar = trim($entrada["avatar_url"] ?? "");
            $nuevoDocumento = isset($entrada["documento"]) ? trim($entrada["documento"]) : null;

            if (
                !$documentoActual ||
                !$nombre ||
                !filter_var($correo, FILTER_VALIDATE_EMAIL)
            ) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Completa todos los campos requeridos.",
                ]);
                exit();
            }

            /* Localizar al usuario por su documento actual */
            $stmt = $conexion->prepare(
                "SELECT id_usuario, nombre_usuario, documento, correo, avatar_url FROM usuario WHERE documento = ? LIMIT 1"
            );
            $stmt->execute([$documentoActual]);
            $usuario = $stmt->fetch();
            if (!$usuario) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Usuario no encontrado.",
                ]);
                exit();
            }

            $idUsuario = $usuario["id_usuario"];
            $docBusqueda = $nuevoDocumento !== null && $nuevoDocumento !== "" ? $nuevoDocumento : $documentoActual;

            /* Verificar unicidad de documento y correo (excluyendo al propio usuario) */
            $stmt = $conexion->prepare(
                "SELECT id_usuario FROM usuario WHERE (documento = ? OR correo = ?) AND id_usuario != ? LIMIT 1"
            );
            $stmt->execute([$docBusqueda, $correo, $idUsuario]);
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Este documento o correo ya está registrado.",
                ]);
                exit();
            }

            /* Construir el UPDATE dinámicamente */
            $campos = [];
            $params = [];
            $campos[] = "nombre_usuario = ?";
            $params[] = $nombre;

            if ($nuevoDocumento !== null && $nuevoDocumento !== "" && (string)$nuevoDocumento !== (string)$usuario["documento"]) {
                $campos[] = "documento = ?";
                $params[] = $nuevoDocumento;
            }

            $campos[] = "correo = ?";
            $params[] = $correo;

            if ($contrasena) {
                $campos[] = "password = ?";
                $params[] = password_hash($contrasena, PASSWORD_DEFAULT);
            }

            $campos[] = "avatar_url = ?";
            $params[] = $avatar !== "" ? $avatar : null;

            $params[] = $idUsuario;
            $sql = "UPDATE usuario SET " . implode(", ", $campos) . " WHERE id_usuario = ?";
            $conexion->prepare($sql)->execute($params);

            /* Devolver los datos actualizados */
            $stmt = $conexion->prepare(
                "SELECT nombre_usuario, documento, correo, avatar_url FROM usuario WHERE id_usuario = ? LIMIT 1"
            );
            $stmt->execute([$idUsuario]);
            $upd = $stmt->fetch();

            echo json_encode([
                "ok" => true,
                "mensaje" => "Perfil actualizado correctamente.",
                "nombre" => $upd["nombre_usuario"],
                "documento" => $upd["documento"],
                "correo" => $upd["correo"],
                "avatar_url" => $upd["avatar_url"],
            ]);
            exit();
        }

        if ($accion === "eliminar_usuario") {
            $id = $entrada["id"] ?? null;
            if (!$id) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "ID de usuario no válido.",
                ]);
                exit();
            }

            try {
                $conexion->beginTransaction();

                // Delete child records first to satisfy foreign key constraints
                // Order matters: ranking → progreso → resultado → flashcard → simulacro → usuario
                $conexion->prepare("DELETE FROM ranking WHERE id_usuario = ?")->execute([$id]);
                $conexion->prepare("DELETE FROM progreso WHERE id_usuario = ?")->execute([$id]);
                $conexion->prepare("DELETE FROM resultado WHERE id_usuario = ?")->execute([$id]);
                $conexion->prepare("DELETE FROM flashcard WHERE id_usuario = ?")->execute([$id]);
                $conexion->prepare("DELETE FROM simulacro WHERE id_usuario = ?")->execute([$id]);
                $conexion->prepare("DELETE FROM usuario WHERE id_usuario = ?")->execute([$id]);

                $conexion->commit();

                echo json_encode([
                    "ok" => true,
                    "mensaje" => "Usuario eliminado correctamente.",
                ]);
            } catch (PDOException $e) {
                $conexion->rollBack();
                http_response_code(500);
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Error al eliminar el usuario: " . $e->getMessage(),
                ]);
            }
            exit();
        }

        if ($accion === "guardar_tema") {
            $id = $entrada["id"] ?? null;
            $nombre = trim($entrada["nombre"] ?? "");
            $idMateria = $entrada["id_materia"] ?? null;

            if (!$nombre || !$idMateria) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Completa todos los campos.",
                ]);
                exit();
            }

            if ($id) {
                $conexion
                    ->prepare(
                        "UPDATE tema SET nombre_tema = ?, id_materia = ? WHERE id_tema = ?",
                    )
                    ->execute([$nombre, $idMateria, $id]);
                echo json_encode([
                    "ok" => true,
                    "mensaje" => "Tema actualizado correctamente.",
                ]);
            } else {
                $conexion
                    ->prepare(
                        "INSERT INTO tema (nombre_tema, id_materia) VALUES (?, ?)",
                    )
                    ->execute([$nombre, $idMateria]);
                echo json_encode([
                    "ok" => true,
                    "mensaje" => "Tema creado correctamente.",
                ]);
            }
            exit();
        }

        if ($accion === "eliminar_tema") {
            $id = $entrada["id"] ?? null;
            if (!$id) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "ID de tema no válido.",
                ]);
                exit();
            }

            $conexion
                ->prepare(
                    "DELETE FROM resultado WHERE id_respuesta IN (SELECT id_respuesta FROM respuesta WHERE id_pregunta IN (SELECT id_pregunta FROM pregunta WHERE id_tema = ?))",
                )
                ->execute([$id]);
            $conexion
                ->prepare(
                    "DELETE FROM respuesta WHERE id_pregunta IN (SELECT id_pregunta FROM pregunta WHERE id_tema = ?)",
                )
                ->execute([$id]);
            $conexion
                ->prepare("DELETE FROM pregunta WHERE id_tema = ?")
                ->execute([$id]);
            $conexion
                ->prepare("DELETE FROM tema WHERE id_tema = ?")
                ->execute([$id]);
            echo json_encode(["ok" => true, "mensaje" => "Tema eliminado."]);
            exit();
        }

        if ($accion === "guardar_pregunta") {
            $id = $entrada["id"] ?? null;
            $texto = trim($entrada["pregunta"] ?? "");
            $idTema = $entrada["id_tema"] ?? null;
            $opciones = $entrada["opciones"] ?? [];
            $correcta = $entrada["correcta"] ?? null;

            if (
                !$texto ||
                !$idTema ||
                !is_array($opciones) ||
                count($opciones) < 2 ||
                $correcta === null
            ) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" =>
                        "Completa todos los campos y al menos 2 opciones.",
                ]);
                exit();
            }

            $correctaIdx = filter_var($correcta, FILTER_VALIDATE_INT);
            if (
                $correctaIdx === false ||
                $correctaIdx < 0 ||
                $correctaIdx >= count($opciones)
            ) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Respuesta correcta no válida.",
                ]);
                exit();
            }

            $conexion->beginTransaction();

            if ($id) {
                $stmt = $conexion->prepare(
                    "UPDATE pregunta SET texto_pregunta = ?, id_tema = ? WHERE id_pregunta = ?",
                );
                $stmt->execute([$texto, $idTema, $id]);
                $idPregunta = $id;


                $conexion
                    ->prepare("DELETE FROM resultado WHERE id_respuesta IN (SELECT id_respuesta FROM respuesta WHERE id_pregunta = ?)")
                    ->execute([$idPregunta]);
                $conexion
                    ->prepare("DELETE FROM respuesta WHERE id_pregunta = ?")
                    ->execute([$idPregunta]);
            } else {
                $stmt = $conexion->prepare(
                    "INSERT INTO pregunta (texto_pregunta, id_tema) VALUES (?, ?)",
                );
                $stmt->execute([$texto, $idTema]);
                $idPregunta = $conexion->lastInsertId();
            }

            foreach ($opciones as $i => $opcion) {
                $esCorrecta = $i === (int) $correctaIdx ? 1 : 0;
                $conexion
                    ->prepare(
                        "INSERT INTO respuesta (id_pregunta, texto_respuesta, es_correcta) VALUES (?, ?, ?)",
                    )
                    ->execute([$idPregunta, trim($opcion), $esCorrecta]);
            }

            $conexion->commit();
            echo json_encode([
                "ok" => true,
                "mensaje" => $id
                    ? "Pregunta actualizada correctamente."
                    : "Pregunta creada correctamente.",
            ]);
            exit();
        }

        if ($accion === "eliminar_pregunta") {
            $id = $entrada["id"] ?? null;
            if (!$id) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "ID de pregunta no válido.",
                ]);
                exit();
            }

            $conexion
                ->prepare("DELETE FROM resultado WHERE id_respuesta IN (SELECT id_respuesta FROM respuesta WHERE id_pregunta = ?)")
                ->execute([$id]);
            $conexion
                ->prepare("DELETE FROM respuesta WHERE id_pregunta = ?")
                ->execute([$id]);
            $conexion
                ->prepare("DELETE FROM pregunta WHERE id_pregunta = ?")
                ->execute([$id]);
            echo json_encode([
                "ok" => true,
                "mensaje" => "Pregunta eliminada.",
            ]);
            exit();
        }

        if ($accion === "verificar_rol") {
            $documento = $entrada["documento"] ?? null;
            if (!$documento) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Documento no proporcionado.",
                ]);
                exit();
            }
            $stmt = $conexion->prepare("
                SELECT u.nombre_usuario, u.correo, u.avatar_url, r.nombre_rol
                FROM usuario u
                LEFT JOIN rol r ON r.id_rol = u.id_rol
                WHERE u.documento = ? LIMIT 1
            ");
            $stmt->execute([$documento]);
            $usuario = $stmt->fetch();
            if (!$usuario) {
                echo json_encode([
                    "ok" => false,
                    "mensaje" => "Usuario no encontrado.",
                ]);
                exit();
            }
            $rol =
                strtolower($usuario["nombre_rol"]) === "admin"
                    ? "admin"
                    : "estudiante";
            echo json_encode([
                "ok" => true,
                "nombre" => $usuario["nombre_usuario"],
                "correo" => $usuario["correo"],
                "avatar_url" => $usuario["avatar_url"],
                "rol" => $rol,
            ]);
            exit();
        }

        echo json_encode(["ok" => false, "mensaje" => "Acción no válida."]);
        exit();
    }

    echo json_encode([
        "ok" => false,
        "mensaje" => "Método no permitido. Usa GET o POST.",
    ]);
    exit();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mensaje" => "Error de base de datos: " . $e->getMessage(),
    ]);
}
