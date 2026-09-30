const API_BASE = "php";

let idiomaActual = localStorage.getItem("idiomaSeleccionado") || "es";

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
                ? 'Debes <strong>iniciar sesión</strong> para ver tu historial de exámenes.'
                : 'You must <strong>log in</strong> to view your exam history.',
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
        return null;
    }
    return documento;
}

function actualizarBotonIdioma() {
    const btn = document.getElementById("idiomaBtn");
    if (btn) btn.textContent = idiomaActual.toUpperCase();
}

function alternarIdioma() {
    const toggle = document.getElementById("idiomaToggle");
    idiomaActual = (toggle && toggle.checked) ? "en" : "es";
    localStorage.setItem("idiomaSeleccionado", idiomaActual);
    actualizarBotonIdioma();
    cargarContenido(idiomaActual);
}

function cargarContenido(idioma) {
    const contenedor = document.getElementById("contenido");
    if (!contenedor) return;

    const es = idioma === "es";
    const titulo = es ? "Historial de Exámenes" : "Exam History";
    const subtitulo = es
        ? "Revisa todos los exámenes que has realizado"
        : "Review all the exams you have taken";

    contenedor.innerHTML = `
        <header class="historial-header">
            <h1>${titulo}</h1>
            <p class="subtitle">${subtitulo}</p>
            <div id="authButtons" class="historial-auth"></div>
        </header>

        <!-- Panel de usuario (se renderiza después de la auth) -->
        <div id="usuarioPanelContainer"></div>

        <!-- Tabla de historial -->
        <div class="historial-table-container">
            <table class="historial-table">
                <thead>
                    <tr>
                        <th class="centro">#</th>
                        <th>${es ? "Materia" : "Subject"}</th>
                        <th class="centro">${es ? "Puntuación" : "Score"}</th>
                        <th class="centro">${es ? "Correctas" : "Correct"}</th>
                        <th class="centro">${es ? "Incorrectas" : "Incorrect"}</th>
                        <th>${es ? "Fecha" : "Date"}</th>
                    </tr>
                </thead>
                <tbody id="historialTablaBody">
                    <tr><td colspan="6" class="empty-row">${es ? "Cargando..." : "Loading..."}</td></tr>
                </tbody>
            </table>
        </div>

        <footer class="historial-footer">
            ${es ? "SMART TEST  - Historial de exámenes" : "SMART TEST  - Exam History"}
        </footer>
    `;

    cargarHistorial();

    if (typeof window.renderAuthButtons === "function") {
        window.renderAuthButtons();
    }
}

async function cargarHistorial() {
    const documento = await requerirLogin();
    if (!documento) return;

    const es = idiomaActual === "es";
    const tablaBody = document.getElementById("historialTablaBody");
    const panelContainer = document.getElementById("usuarioPanelContainer");
    if (!tablaBody) return;

    tablaBody.innerHTML = `<tr><td colspan="6" class="empty-row">${es ? "Cargando..." : "Loading..."}</td></tr>`;

    try {
        const res = await fetch(`${API_BASE}/historial.php?documento=${documento}`);
        const data = await res.json();

        if (!data.ok) {

            Swal.fire({
                title: es ? "Sesión expirada" : "Session expired",
                text: es
                    ? "Tu sesión ha expirado. Por favor, inicia sesión de nuevo."
                    : "Your session has expired. Please log in again.",
                icon: "warning",
                confirmButtonText: es ? "Iniciar Sesión" : "Log in",
                customClass: {
                    popup: "swal-smart-popup",
                    title: "swal-smart-title",
                    confirmButton: "swal-smart-confirm",
                },
            }).then(function (r) {
                if (r.isConfirmed) window.location.href = "login.html";
            });
            return;
        }

        const totalExamenes = data.historial ? data.historial.length : 0;
        const totalPuntos = data.historial
            ? data.historial.reduce((sum, h) => sum + (parseFloat(h.puntuacion) || 0), 0)
            : 0;

        if (panelContainer) {
            panelContainer.innerHTML = renderUsuarioPanel(
                data.usuario, totalExamenes, totalPuntos, es
            );
        }

        tablaBody.innerHTML = renderTabla(data.historial, es);
    } catch (e) {
        console.error("Error cargando historial:", e);
        tablaBody.innerHTML = `<tr><td colspan="6" class="empty-row">
            <i class="fa-solid fa-triangle-exclamation empty-icon"></i>
            <p>${es ? "Error al cargar el historial." : "Error loading history."}</p>
        </td></tr>`;
    }
}

function renderUsuarioPanel(usuario, totalExamenes, totalPuntos, es) {
    const inicial = (usuario.nombre || "U").charAt(0).toUpperCase();

    return `<div class="usuario-panel">
        <div class="info">
            <div class="avatar">${inicial}</div>
            <span class="nombre">${usuario.nombre || (es ? "Usuario" : "User")}</span>
        </div>
        <div class="stats">
            <div class="stat-item">
                <div class="value">${totalExamenes}</div>
                <div class="label">${es ? "Exámenes" : "Exams"}</div>
            </div>
            <div class="stat-item">
                <div class="value stat-value-points">${totalPuntos.toFixed(1)}</div>
                <div class="label">${es ? "Puntos totales" : "Total points"}</div>
            </div>
        </div>
    </div>`;
}

function renderTabla(historial, es) {
    if (!historial || historial.length === 0) {
        const icono = '<i class="fa-solid fa-clipboard-list empty-icon"></i>';
        const msg = es
            ? "Aún no has realizado ningún examen."
            : "You haven't taken any exams yet.";
        return `<tr><td colspan="6" class="empty-row">${icono}<p>${msg}</p></td></tr>`;
    }

    let html = "";
    let i = 0;

    for (const h of historial) {
        i++;

        const pts = parseFloat(h.puntuacion || 0);
        let ptsClass = "pts-bajo";
        if (pts >= 1.5) ptsClass = "pts-alto";
        else if (pts >= 1.0) ptsClass = "pts-medio";

        let materiaNombre = h.materia || "";
        const match = materiaNombre.match(/:\s*(.+)/);
        if (match) materiaNombre = match[1];
        if (!materiaNombre) materiaNombre = h.materia || (es ? "Sin materia" : "No subject");

        const fecha = h.fecha
            ? new Date(h.fecha.replace(" ", "T")).toLocaleDateString(
                idiomaActual === "es" ? "es-ES" : "en-US",
                { year: "numeric", month: "short", day: "numeric" }
            )
            : "-";

        html += `<tr>
            <td class="centro fila-numero">${i}</td>
            <td class="materia-cell">
                <i class="fa-solid fa-book-open materia-icon"></i> ${materiaNombre}
            </td>
            <td class="centro">
                <span class="puntuacion-cell ${ptsClass}">
                    <span class="puntos">${pts.toFixed(1)}</span>
                </span>
            </td>
            <td class="centro cell-correctas">${h.buenas || 0}</td>
            <td class="centro cell-incorrectas">${h.malas || 0}</td>
            <td>${fecha}</td>
        </tr>`;
    }

    return html;
}

document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("idiomaToggle");
    if (toggle) {
        toggle.checked = idiomaActual === "en";
    }
    actualizarBotonIdioma();
    cargarContenido(idiomaActual);
});
