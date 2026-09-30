const API_BASE = "php";

let idiomaActual = localStorage.getItem("idiomaSeleccionado") || "es";

let temasExamen = [];
let preguntasExamen = [];
let idMateriaActual = null;
let nombreMateriaActual = "";
let intentoActual = 1;

const slugAMateria = {
    matematicas: "Matemáticas",
    lectura_critica: "Lectura Crítica",
    ingles: "Inglés",
    ciencias_naturales: "Ciencias Naturales",
    ciencias_sociales: "Ciencias Sociales"
};

const letras = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function srtReady() {
    return new Promise(function (resolve) {
        if (typeof window.srtOnReady === "function") {
            window.srtOnReady(resolve);
        } else {
            resolve();
        }
    });
}

async function requerirLogin() {
    await srtReady();
    const documento = (window.SRT && window.SRT.documento)
        ? window.SRT.documento
        : null;
    if (!documento) {
        const es = idiomaActual === "es";
        Swal.fire({
            title: es ? "Inicio de sesión requerido" : "Login required",
            html: es
                ? 'Debes <strong>iniciar sesión</strong> para poder responder preguntas.'
                : 'You must <strong>log in</strong> to answer questions.',
            icon: "info",
            confirmButtonText: es ? "Iniciar Sesión" : "Log in",
            showCancelButton: true,
            cancelButtonText: es ? "Cancelar" : "Cancel",
            customClass: {
                popup: "swal-smart-popup",
                title: "swal-smart-title",
                confirmButton: "swal-smart-confirm",
            },
        }).then(function (r) {
            if (r.isConfirmed) window.location.href = "login.html";
        });
        return false;
    }
    return true;
}

function alternarIdioma() {
    const toggle = document.getElementById("idiomaToggle");
    idiomaActual = (toggle && toggle.checked) ? "en" : "es";
    localStorage.setItem("idiomaSeleccionado", idiomaActual);
    actualizarBotonIdioma();
    cargarContenido(idiomaActual);
}

function actualizarBotonIdioma() {
    const btn = document.getElementById("idiomaBtn");
    if (btn) btn.textContent = idiomaActual.toUpperCase();
}

function cargarContenido(idioma) {
    const contenedor = document.getElementById("contenido");
    if (!contenedor) return;

    const titulo = idioma === "es" ? "SMART TEST " : "SMART TEST ";
    const subtitulo = idioma === "es"
        ? "Examen de preguntas por tema"
        : "Subject exam questions by topic";
    const volver = idioma === "es" ? "Volver" : "Back";

    contenedor.innerHTML = `
        <!-- HEADER -->
        <header class="header">
            <div class="left">
                <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                <div class="header-copy">
                    <h2 id="tituloMateria">${titulo}</h2>
                    <p id="subtitle">${subtitulo}</p>
                </div>
            </div>
            <div class="buttons" id="authButtons"></div>
            <a href="pagina.html" class="btn btn-outline">${volver}</a>
        </header>

        <main class="quiz-page">
            <section id="estadoCarga" class="state-card hidden">
                <h3>${idioma === "es" ? "Preparando examen..." : "Preparing exam..."}</h3>
                <p>${idioma === "es" ? "Estamos barajando las preguntas para ti." : "We are shuffling the questions for you."}</p>
            </section>

            <!-- RAÍZ DEL EXAMEN -->
            <section id="temasContainer" class="topics-list">
                <p class="loading">${idioma === "es" ? "Cargando materia..." : "Loading subject..."}</p>
            </section>
        </main>
    `;

    cargarMateriaDesdeSlug();

    if (typeof window.renderAuthButtons === "function") {
        window.renderAuthButtons();
    }
}

async function cargarMateriaDesdeSlug() {
    
    const logueado = await requerirLogin();
    if (!logueado) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("materia");
    const root = document.getElementById("temasContainer");
    if (!root) return;

    if (!slug || !slugAMateria[slug]) {
        root.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "No se ha seleccionado ninguna materia. Vuelve a la página principal." : "No subject selected. Return to the main page."}</p>`;
        return;
    }

    const nombreBuscado = slugAMateria[slug];
    const titulo = document.getElementById("tituloMateria");
    if (titulo) titulo.textContent = nombreBuscado;

    try {
        const res = await fetch(`${API_BASE}/cargar_datos.php?accion=materias`);
        const data = await res.json();
        const match = (data.materias || []).find(function (m) {
            return m.nombre_materia === nombreBuscado;
        });
        if (!match) {
            root.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "Materia no encontrada." : "Subject not found."}</p>`;
            return;
        }
        idMateriaActual = match.id_materia;
        nombreMateriaActual = nombreBuscado;
        await iniciarExamen(idMateriaActual);
    } catch (e) {
        console.error("Error materia:", e);
        root.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "Error al cargar la materia." : "Error loading subject."}</p>`;
    }
}

async function iniciarExamen(idMateria) {
    const root = document.getElementById("temasContainer");
    if (!root) return;
    root.innerHTML = `<p class="loading">${idiomaActual === "es" ? "Cargando preguntas..." : "Loading questions..."}</p>`;

    try {
        const res = await fetch(`${API_BASE}/cargar_datos.php?accion=preguntas&id_materia=${idMateria}`);
        const data = await res.json();
        if (!data.ok || !data.preguntas || data.preguntas.length === 0) {
            root.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "No hay preguntas registradas para esta materia." : "No questions registered for this subject."}</p>`;
            return;
        }

        const preguntas = data.preguntas.map(function (p) {
            const rc = (p.respuesta_correcta || "").toUpperCase();
            return {
                id_pregunta: p.id_pregunta,
                texto: p.texto_pregunta || p.pregunta || "",
                opciones: p.opciones || [],
                opcion_ids: (p.opcion_ids || []),
                letraCorrecta: rc,
                nombre_tema: p.nombre_tema || ""
            };
        });

        const distintos = [];
        const mapa = {};
        preguntas.forEach(function (p) {
            if (!mapa[p.nombre_tema]) {
                mapa[p.nombre_tema] = [];
                distintos.push(p.nombre_tema);
            }
            mapa[p.nombre_tema].push(p);
        });

        temasExamen = shuffle(distintos).map(function (t) {
            return { nombre_tema: t, preguntas: shuffle(mapa[t]) };
        });

        preguntasExamen = [];
        temasExamen.forEach(function (t) {
            t.preguntas.forEach(function (p) { preguntasExamen.push(p); });
        });

        renderExamen();
    } catch (e) {
        console.error("Error examen:", e);
        root.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "Error al cargar preguntas." : "Error loading questions."}</p>`;
    }
}

function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function renderExamen() {
    const es = idiomaActual === "es";
    const root = document.getElementById("temasContainer");
    if (!root) return;

    let html = "";
    html += `<div class="exam-header-bar">
        <h2 id="tituloMateria">${nombreMateriaActual || ""}</h2>
        <span class="exam-resumen-corto">${preguntasExamen.length} ${es ? "preguntas" : "questions"}</span>
    </div>`;
    html += `<form id="formExamen">`;

    let n = 0;
    temasExamen.forEach(function (tema) {
        html += `<div class="tema-section"><h3 class="tema-title">${tema.nombre_tema || (es ? "Sin tema" : "No topic")}</h3><div class="preguntas-tema">`;
        tema.preguntas.forEach(function (p) {
            const idx = n++;
            const texto = p.texto || "";
            const opts = p.opciones || [];

            html += `<div class="pregunta-item">`;
            html += `<p class="pregunta-text">${idx + 1}.</p>`;
            html += `<div class="smart-visor">${texto}</div>`;
            html += `<div class="opciones-lista">`;
            opts.forEach(function (opt, i) {
                const letra = letras[i] || String(i);
                html += `<label class="opcion"><input type="radio" name="p${p.id_pregunta}" value="${letra}" data-index="${i}" required> <span class="pregunta-opcion">${letra}. ${opt}</span></label>`;
            });
            html += `</div></div>`;
        });
        html += `</div></div>`;
    });

    html += `</form>`;
    html += `<div class="exam-footer">
        <button type="button" id="btnTerminar" class="btn btn-primary">${es ? "Terminar" : "Finish"}</button>
    </div>`;
    root.innerHTML = html;

    aplicarZoomImagenes(root);

    const btn = document.getElementById("btnTerminar");
    if (btn) btn.addEventListener("click", terminar);
}

function aplicarZoomImagenes(container) {
    if (!container) return;
    var imgs = container.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        img.classList.add("img-ampliable");
        img.addEventListener("click", function (e) {
            e.preventDefault();
            var src = this.src || this.getAttribute("data-src") || "";
            if (!src) return;
            abrirVisorImagen(src);
        });
    }
}

function cerrarVisor(overlay) {
    if (!overlay || !overlay.parentNode) return;
    /* Quitar el listener de teclado que vive en document (los demás viven en viewport) */
    if (overlay.__keyHandler) {
        document.removeEventListener("keydown", overlay.__keyHandler);
        overlay.__keyHandler = null;
    }
    document.body.removeChild(overlay);
}

function abrirVisorImagen(src) {
    /* Cerrar visor previo si ya estaba abierto (evita solapamientos) */
    var prev = document.querySelector(".img-visor-overlay");
    if (prev) cerrarVisor(prev);

    var overlay = document.createElement("div");
    overlay.className = "img-visor-overlay";
    overlay.innerHTML =
        '<div class="img-visor-modal">' +
        '  <button type="button" class="img-visor-cerrar" aria-label="Cerrar">&times;</button>' +
        '  <div class="img-visor-viewport">' +
        '    <img class="img-visor-imagen" src="' + src + '" alt="Imagen ampliada">' +
        '  </div>' +
        '  <div class="img-visor-nivel">100%</div>' +
        '</div>';

    document.body.appendChild(overlay);

    var img = overlay.querySelector(".img-visor-imagen");
    var nivel = overlay.querySelector(".img-visor-nivel");
    var viewport = overlay.querySelector(".img-visor-viewport");
    var zoom = 1;
    var offsetX = 0;
    var offsetY = 0;
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var lastTap = 0;
    var isTouchDragging = false;
    var touchStartDist = 0;
    var touchStartZoom = 1;

    function actualizar() {
        img.style.transform = "translate(" + offsetX + "px, " + offsetY + "px) scale(" + zoom + ")";
        nivel.textContent = Math.round(zoom * 100) + "%";
        viewport.style.cursor = zoom > 1 ? "grab" : "zoom-in";
    }

    /* Cerrar: botón × */
    overlay.querySelector(".img-visor-cerrar").addEventListener("click", function () {
        cerrarVisor(overlay);
    });

    /* Cerrar: click fuera de la imagen (fondo oscuro) */
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) cerrarVisor(overlay);
    });

    /* Cerrar: tecla Escape */
    var keyHandler = function (e) {
        if (e.key === "Escape" || e.key === "Esc") {
            cerrarVisor(overlay);
        }
    };
    overlay.__keyHandler = keyHandler;
    document.addEventListener("keydown", keyHandler);

    /* ========================================
       DRAG Y ZOOM — eventos de ratón y touch
       ======================================== */

    /* Limita el desplazamiento para que la imagen no se salga de la vista */
    function limitarDesplazamiento() {
        var vw = viewport.offsetWidth;
        var vh = viewport.offsetHeight;
        var iw = img.offsetWidth;
        var ih = img.offsetHeight;
        var maxX = Math.max(0, (zoom * iw - vw) / 2);
        var maxY = Math.max(0, (zoom * ih - vh) / 2);
        offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
        offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
    }

    /* Evita el arrastre nativo del navegador (imagen fantasma) */
    img.addEventListener("dragstart", function (e) {
        e.preventDefault();
    });

    /* Dimensiones correctas al cargar la imagen (evita 0x0 al abrir) */
    img.addEventListener("load", function () {
        limitarDesplazamiento();
        actualizar();
    });

    /* --- MOUSE: botón presionado → iniciar drag (solo si está ampliada) --- */
    img.addEventListener("mousedown", function (e) {
        e.preventDefault();
        if (zoom <= 1) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        viewport.style.cursor = "grabbing";
    });

    /* --- MOUSE: mover ratón → arrastrar imagen --- */
    viewport.addEventListener("mousemove", function (e) {
        if (!isDragging) return;
        e.preventDefault();
        offsetX += e.clientX - startX;
        offsetY += e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        limitarDesplazamiento();
        actualizar();
    });

    /* --- MOUSE: soltar botón → terminar drag --- */
    viewport.addEventListener("mouseup", function () {
        isDragging = false;
        actualizar();
    });

    /* --- MOUSE: salir del viewport → terminar drag --- */
    viewport.addEventListener("mouseleave", function () {
        isDragging = false;
        actualizar();
    });

    /* --- TOUCH: detectar gesto (1 dedo = drag, 2 dedos = zoom) --- */
    img.addEventListener("touchstart", function (e) {
        if (e.touches.length === 1) {
            /* Drag de un dedo (solo si está ampliada) */
            if (zoom > 1) {
                isTouchDragging = true;
                var t = e.touches[0];
                startX = t.clientX;
                startY = t.clientY;
            }
        } else if (e.touches.length === 2) {
            /* Pinch-to-zoom de dos dedos */
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDist = Math.sqrt(dx * dx + dy * dy);
            touchStartZoom = zoom;
        }
    }, { passive: true });

    /* --- TOUCH: mover dedos → arrastrar o hacer zoom --- */
    viewport.addEventListener("touchmove", function (e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (touchStartDist > 0) {
                zoom = Math.max(0.5, Math.min(4, touchStartZoom * (dist / touchStartDist)));
            }
            limitarDesplazamiento();
            actualizar();
        } else if (e.touches.length === 1 && isTouchDragging) {
            /* Arrastrar con un dedo */
            e.preventDefault();
            var t = e.touches[0];
            offsetX += t.clientX - startX;
            offsetY += t.clientY - startY;
            startX = t.clientX;
            startY = t.clientY;
            limitarDesplazamiento();
            actualizar();
        }
    }, { passive: false });

    /* --- TOUCH: soltar dedos → terminar drag + doble tap para zoom --- */
    viewport.addEventListener("touchend", function () {
        isTouchDragging = false;
        /* Detección de doble tap para hacer zoom */
        var now = Date.now();
        if (now - lastTap < 300) {
            if (zoom > 1) {
                zoom = 1;
                offsetX = 0;
                offsetY = 0;
            } else {
                zoom = 2;
            }
            actualizar();
        }
        lastTap = now;
    });

    /* --- ZOOM: rueda del ratón --- */
    viewport.addEventListener("wheel", function (e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoom = Math.min(zoom * 1.1, 5);
        } else {
            zoom = Math.max(zoom / 1.1, 0.1);
        }
        limitarDesplazamiento();
        actualizar();
    }, { passive: false });

    /* --- ZOOM: doble clic --- */
    img.addEventListener("dblclick", function () {
        if (zoom > 1) {
            zoom = 1;
            offsetX = 0;
            offsetY = 0;
        } else {
            zoom = 2;
        }
        actualizar();
    });

    /* Sincronizar dimensiones y cursor al abrir */
    limitarDesplazamiento();
    actualizar();
}

function terminar() {
    const es = idiomaActual === "es";
    const form = document.getElementById("formExamen");
    if (!form) return;

    const pendientes = preguntasExamen.filter(function (p) {
        return !form.querySelector(`input[name="p${p.id_pregunta}"]:checked`);
    });
    if (pendientes.length) {
        Swal.fire({
            title: es ? "Responde todas las preguntas" : "Answer all questions",
            text: es ? `Faltan ${pendientes.length} pregunta(s) por responder.` : `${pendientes.length} question(s) remaining.`,
            icon: "warning",
            customClass: {
                popup: "swal-smart-popup",
                title: "swal-smart-title",
                confirmButton: "swal-smart-confirm",
            },
        });
        return;
    }

    Swal.fire({
        title: es ? "¿Terminar examen?" : "Finish exam?",
        text: es ? "No podrás cambiar tus respuestas después." : "You won't be able to change your answers afterwards.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: es ? "Sí, terminar" : "Yes, finish",
        cancelButtonText: es ? "Cancelar" : "Cancel",
        customClass: {
            popup: "swal-smart-popup",
            title: "swal-smart-title",
            confirmButton: "swal-smart-confirm",
        },
    }).then(async function (r) {
        if (!r.isConfirmed) return;

        let buenas = 0, malas = 0;
        const detalle = [];
        const respuestas = [];
        preguntasExamen.forEach(function (p) {
            const checked = form.querySelector(`input[name="p${p.id_pregunta}"]:checked`);
            const elegida = checked ? checked.value : "";
            const idx = checked ? Number(checked.dataset.index) : -1;
            const idRespuesta = (idx >= 0 && p.opcion_ids[idx] !== undefined) ? p.opcion_ids[idx] : null;
            const acierto = elegida !== "" && elegida === p.letraCorrecta;
            if (acierto) buenas++; else malas++;

            const idxLetra = letras.indexOf(p.letraCorrecta);
            const opcionCorrecta = (p.opciones[idxLetra] !== undefined) ? p.opciones[idxLetra] : "";
            detalle.push({
                id_pregunta: p.id_pregunta,
                texto: p.texto,
                opciones: p.opciones,
                letraCorrecta: p.letraCorrecta,
                opcionCorrecta: opcionCorrecta,
                elegida: elegida,
                acierto: acierto
            });

            respuestas.push({
                id_pregunta: p.id_pregunta,
                id_respuesta: idRespuesta,
                acierto: acierto
            });
        });

        const total = preguntasExamen.length;

        const puntaje = Math.round(0.5 * buenas * 100) / 100;
        const promedio = total > 0 ? Math.round((0.5 * buenas / total) * 100) / 100 : 0;

        sessionStorage.setItem("simulacro_result", JSON.stringify({
            nombre_materia: nombreMateriaActual,
            id_materia: idMateriaActual,
            buenas: buenas,
            malas: malas,
            total: total,
            puntaje: puntaje,
            promedio: promedio,
            intento: intentoActual,
            preguntas: detalle
        }));

        const documento = localStorage.getItem("documento");
        try {
            const resp = await fetch(`${API_BASE}/cargar_datos.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accion: "registrar_simulacro",
                    documento: documento ? Number(documento) : null,
                    nombre_materia: nombreMateriaActual,
                    puntaje: puntaje,
                    total_preguntas: total,
                    total_buenas: buenas,
                    total_malas: malas,
                    respuestas: respuestas
                })
            });
            const rj = await resp.json();
            if (rj && rj.ok && rj.numero_intento) intentoActual = Number(rj.numero_intento);
        } catch (e) {
            
        }

        renderResultados(buenas, malas, total, puntaje, promedio, detalle);
    });
}

function renderResultados(buenas, malas, total, puntaje, promedio, detalle) {
    const es = idiomaActual === "es";
    const root = document.getElementById("temasContainer");
    if (!root) return;

    const acertadas = detalle.filter(function (d) { return d.acierto === true; });

    let html = "";
    html += `<div class="result-card">
        <h2>${es ? "Resultado del examen" : "Exam result"}</h2>
        <div class="score-badge">${puntaje}</div>
        <div class="result-meta">${es ? "Materia" : "Subject"}: <strong>${nombreMateriaActual || ""}</strong></div>
        <div class="result-meta">${es ? "Intento" : "Attempt"} #${intentoActual}</div>

        <div class="result-stats">
            <div class="stat"><div class="v">${buenas}</div><div class="l">${es ? "Buenas" : "Correct"}</div></div>
            <div class="stat"><div class="v">${malas}</div><div class="l">${es ? "Malas" : "Wrong"}</div></div>
            <div class="stat"><div class="v">${total}</div><div class="l">${es ? "Total" : "Total"}</div></div>
            <div class="stat"><div class="v">${promedio}%</div><div class="l">${es ? "Promedio" : "Average"}</div></div>
        </div>
    `;

    if (acertadas.length > 0) {
        html += `<h3 class="result-section-title">${es ? "Preguntas acertadas" : "Correctly answered"}</h3>`;
        html += `<div class="result-pregunta-list">`;
        acertadas.forEach(function (d, i) {
            html += `<div class="result-pregunta">`;
            html += `<div class="smart-visor">${d.texto}</div>`;
            if (d.opcionCorrecta) {
                html += `<span class="correcta-tag">✓ ${d.letraCorrecta}. ${d.opcionCorrecta}</span>`;
            }
            html += `</div>`;
        });
        html += `</div>`;
    } else {
        html += `<p class="no-data result-no-data">${es ? "No acertaste ninguna pregunta." : "You didn't answer any questions correctly."}</p>`;
    }

    html += `<div class="result-actions">
        <button type="button" id="btnReintentar" class="btn btn-outline">${es ? "Volver a intentar" : "Try again"}</button>
        <a href="pagina.html" class="btn btn-outline">${es ? "Inicio" : "Home"}</a>
    </div>`;
    html += `</div>`;
    root.innerHTML = html;

    aplicarZoomImagenes(root);

    const r = document.getElementById("btnReintentar");
    if (r) r.addEventListener("click", function () {
        sessionStorage.removeItem("simulacro_result");

        window.location.reload();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("idiomaToggle");
    if (toggle) toggle.checked = (idiomaActual === "en");
    actualizarBotonIdioma();
    cargarContenido(idiomaActual);

});
