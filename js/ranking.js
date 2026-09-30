const API_BASE = "php";

let idiomaActual = localStorage.getItem("idiomaSeleccionado") || "es";

/* Los avatares (foto por URL o iniciales con color) se renderizan con el
   helper global window.avatarTag definido en js/auth.js, disponible en todas
   las páginas. */

function alternarIdioma() {
    const toggle = document.getElementById("idiomaToggle");
    idiomaActual = (toggle && toggle.checked) ? "en" : "es";
    localStorage.setItem("idiomaSeleccionado", idiomaActual);
    actualizarBotonIdioma();
    cargarContenido(idiomaActual);

    cargarRanking();
}

function actualizarBotonIdioma() {
    const btn = document.getElementById("idiomaBtn");
    if (btn) btn.textContent = idiomaActual.toUpperCase();
}

function cargarContenido(idioma) {
    const contenedor = document.getElementById("contenido");
    if (!contenedor) return;

    const headerTitulo = idioma === "es"
        ? "Ranking de usuarios"
        : "User ranking";
    const subtitulo = idioma === "es"
        ? "El puntaje en el ranking es el promedio de los puntos totales obtenidos en cada intento."
        : "The ranking score is the average of total points obtained in each attempt.";

    contenedor.innerHTML = `
        <!-- HEADER -->
        <header class="header">
            <div class="left">
                <a href="pagina.html">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                </a>
                <h2>${headerTitulo}</h2>
            </div>
            <div class="buttons" id="authButtons"></div>
        </header>

        <!-- PANEL DE USUARIO LOGUEADO (se rellena dinámicamente) -->
        <div id="usuarioPanel"></div>

        <!-- TABLA DE RANKING -->
        <section class="ranking-container">
            <h1 class="ranking-title">
                <i class="fa-solid fa-trophy"></i> ${headerTitulo}
            </h1>
            <p class="ranking-subtitle" id="rankingSubtitulo">${subtitulo}</p>
            <div id="rankingTabla"></div>
        </section>

        <!-- FOOTER -->
        <footer>
            <div class="footer-content">
                <h3>SMART TEST  © 2026</h3>
                <span class="footer-separator">•</span>
                <a href="politica.html" class="footer-link">${idioma === "es" ? "Términos y Condiciones" : "Terms and Conditions"}</a>
            </div>
        </footer>
    `;
}

async function cargarRanking() {
    const tabla = document.getElementById("rankingTabla");
    const subtitulo = document.getElementById("rankingSubtitulo");
    const es = idiomaActual === "es";

    if (!tabla) return;

    tabla.innerHTML = `<p class="sin-usuario">${es ? "Cargando ranking..." : "Loading ranking..."}</p>`;

    const documento = (window.SRT && window.SRT.documento) ? window.SRT.documento : null;

    let qs = "";
    if (documento) qs = "?documento=" + encodeURIComponent(documento);

    try {
        const resp = await fetch(`${API_BASE}/ranking.php${qs}`, { cache: "no-store" });
        const data = await resp.json();

        if (!data.ok || !data.ranking) {
            tabla.innerHTML = `<p class="sin-usuario">${es ? "No se pudo cargar el ranking." : "Could not load the ranking."}</p>`;
            return;
        }

        renderUsuarioPanel(data, es);
        renderTabla(data.ranking, data.posicion_usuario, data.total_usuarios, es);

        if (subtitulo) {
            subtitulo.textContent = es
                ? "El puntaje en el ranking es el promedio de los puntos totales obtenidos en cada intento."
                : "The ranking score is the average of total points obtained in each attempt.";
        }
    } catch (e) {
        console.error("Error cargando ranking:", e);
        tabla.innerHTML = `<p class="sin-usuario">${es ? "Error al cargar el ranking." : "Error loading the ranking."}</p>`;
    }
}

function renderUsuarioPanel(data, es) {
    const panel = document.getElementById("usuarioPanel");
    if (!panel) return;

    const documento = (window.SRT && window.SRT.documento) ? window.SRT.documento : null;
    const nombreActual = (window.SRT && window.SRT.nombre) || "";

    if (!documento || !nombreActual) {
        panel.innerHTML = "";
        return;
    }

    const usuario = data.ranking.find(
        (u) => String(u.documento) === String(documento)
    );

    if (!usuario || data.posicion_usuario === null) {
        panel.innerHTML = `
            <div class="usuario-panel usuario-sin-puntos">
                <div class="info">
                    <div class="nombre">
                        ${es ? "¡Hola, " : "Hi, "}${nombreActual}
                        <span class="usuario-actual-tag">${es ? "TÚ" : "YOU"}</span>
                    </div>
                    <div class="posicion-texto">
                        ${es ? "Aún no tienes puntos en el ranking." : "You don't have points in the ranking yet."}
                        ${es ? "¡Responde preguntas para aparecer!" : "Answer questions to appear!"}
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const posicion = data.posicion_usuario;
    const medallaClase =
        posicion === 1 ? "oro"
        : posicion === 2 ? "plata"
        : posicion === 3 ? "bronce"
        : "numero";

    panel.innerHTML = `
        <div class="usuario-panel">
            ${window.avatarTag(usuario.nombre, usuario.avatar_url, "panel-avatar")}
            <div class="info">
                <div class="nombre">
                    ${es ? "¡Hola, " : "Hi, "}${usuario.nombre}
                    <span class="usuario-actual-tag">${es ? "TÚ" : "YOU"}</span>
                </div>
                <div class="posicion-texto">
                    ${es ? "Vas en el puesto" : "You are in position"} <strong>${posicion}</strong> ${es ? "de" : "of"} ${data.total_usuarios}
                </div>
                <div class="puntos-texto">
                    ${es ? "Puntos" : "Points"}: <strong>${usuario.total_puntos.toFixed(1)}</strong> ·
                    ${es ? "Promedio" : "Average"}: <strong>${usuario.promedio > 0 ? usuario.promedio.toFixed(2) : "0.00"}</strong>
                </div>
            </div>
            <div class="medalla ${medallaClase}">
                ${posicion}
            </div>
        </div>
    `;
}

function renderTabla(ranking, posicionUsuario, totalUsuarios, es) {
    const tabla = document.getElementById("rankingTabla");
    if (!tabla) return;

    if (!ranking.length) {
        tabla.innerHTML = `<p class="sin-usuario">
            ${es ? "Aún no hay usuarios en el ranking." : "No users in the ranking yet."}
            ${es ? "¡Sé el primero en responder preguntas!" : "Be the first to answer questions!"}
        </p>`;
        return;
    }

    const documentoLogueado = (window.SRT && window.SRT.documento) ? String(window.SRT.documento) : null;

    let html = `<table class="ranking-table">`;
    html += `<thead>
        <tr>
            <th class="posicion-th">#</th>
            <th class="usuario-th">${es ? "Usuario" : "User"}</th>
            <th class="puntos-th">${es ? "Puntos" : "Points"}</th>
            <th class="correctas-th">${es ? "Correctas" : "Correct"}</th>
            <th class="promedio-th">${es ? "Promedio" : "Average"}</th>
            <th class="calificacion-th">${es ? "Última calif." : "Last grade"}</th>
            <th class="intentos-th">${es ? "Intentos" : "Attempts"}</th>
        </tr>
    </thead>`;
    html += `<tbody>`;

    ranking.forEach((u) => {
        const esActual = documentoLogueado && String(u.documento) === documentoLogueado;
        const claseFila = esActual ? "fila-usuario" : "";
        const tagActual = esActual
            ? ` <span class="usuario-actual-tag">${es ? "TÚ" : "YOU"}</span>`
            : "";

        let badge;
        if (u.posicion === 1) {
            badge = `<span class="medalla oro"><i class="fa-solid fa-trophy"></i></span>`;
        } else if (u.posicion === 2) {
            badge = `<span class="medalla plata"><i class="fa-solid fa-trophy"></i></span>`;
        } else if (u.posicion === 3) {
            badge = `<span class="medalla bronce"><i class="fa-solid fa-trophy"></i></span>`;
        } else {
            badge = `<span class="posicion-badge">${u.posicion}</span>`;
        }

        const nombreHtml = esActual
            ? `<span class="nombre-usuario">${u.nombre}${tagActual}</span>`
            : u.nombre;

        const puntosHtml = u.total_puntos > 0
            ? `<span class="puntos-valor">${u.total_puntos.toFixed(1)}</span>`
            : `<span class="puntos-valor cero">${u.total_puntos.toFixed(1)}</span>`;

        html += `<tr class="${claseFila}">
            <td class="centro">${badge}</td>
            <td class="nombre-usuario">${window.avatarTag(u.nombre, u.avatar_url, "user-avatar")} ${nombreHtml}</td>
            <td class="centro">${puntosHtml}</td>
            <td class="centro">${u.preguntas_correctas}</td>
            <td class="centro">${u.promedio > 0 ? u.promedio.toFixed(2) : "—"}</td>
            <td class="centro">${u.ultima_calificacion > 0 ? u.ultima_calificacion.toFixed(1) : "—"}</td>
            <td class="centro">${u.total_intentos}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    tabla.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("idiomaToggle");
    if (toggle) toggle.checked = (idiomaActual === "en");
    actualizarBotonIdioma();
    cargarContenido(idiomaActual);

    srtOnReady(function () {
        if (typeof window.renderAuthButtons === "function") {
            window.renderAuthButtons();
        }
        cargarRanking();
    });
});
