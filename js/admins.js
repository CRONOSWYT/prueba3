let idiomaActual = localStorage.getItem("idiomaSeleccionado") || "es";
let usuariosCache = [];
let selectedMateriaTema = null;
let temasCache = [];
let selectedTemaPregunta = null;
let preguntasCache = [];
let temasConPreguntas = [];

let seccionActiva = "usuarios";
let API_BASE = "php";

function alternarIdioma() {
  const toggle = document.getElementById("idiomaToggle");
  idiomaActual = toggle && toggle.checked ? "en" : "es";
  localStorage.setItem("idiomaSeleccionado", idiomaActual);
  actualizarBotonIdioma();
  cargarContenido(idiomaActual);
  if (typeof renderAuthButtons === "function") {
    renderAuthButtons();
  }
}

function actualizarBotonIdioma() {
  const btn = document.getElementById("idiomaBtn");
  if (btn) {
    btn.textContent = idiomaActual.toUpperCase();
  }
}

function cargarContenido(idioma) {
  let contenedor = document.getElementById("contenido");
  if (!contenedor) return;

  const t = (es, en) => (idioma === "es" ? es : en);

  const tituloAdmin = t("Panel de Administración", "Admin Panel");
  const backText = t("Volver a Inicio", "Back to Home");
  const tituloUsuario = t("Gestión de Usuarios", "User Management");
  const tituloTemas = t("Gestión de Temas", "Topic Management");
  const tituloPreguntas = t("Gestión de Preguntas", "Question Management");
  const btnGuardarUsuario = t("Guardar Cambios", "Save Changes");
  const editUsuarioLabel = t("Editar Usuario", "Edit User");
  const searchPlaceholder = t(
    "Buscar documento, nombre, correo...",
    "Search by ID, name, email...",
  );
  const colDoc = t("Documento", "ID");
  const colGrado = t("Grado", "Grade");
  const colAcciones = t("Acciones", "Actions");
  const editLabel = t("Editar", "Edit");
  const deleteLabel = t("Borrar", "Delete");
  const nombreTemaPlaceholder = t("Nombre del tema", "Topic name");
  const btnGuardarTema = t("Guardar Tema", "Save Topic");
  const btnCrearTema = t("Crear Nuevo Tema", "Create New Topic");
  const tituloCrearTema = t("Crear Nuevo Tema", "Create New Topic");
  const tituloEditarTema = t("Editar Tema", "Edit Topic");
  const searchTemaPlaceholder = t("Buscar tema...", "Search topic...");
  const preguntaLabel = t("Texto de la pregunta:", "Question text:");
  const correctaLabel = t("Respuesta correcta:", "Correct answer:");
  const btnGuardarPregunta = t("Crear Pregunta", "Create Question");
  const sinTemasMsg = t(
    "Selecciona una materia para ver sus temas",
    "Select a subject to see its topics",
  );
  const sinPreguntasMsg = t(
    "Selecciona un tema para ver sus preguntas",
    "Select a topic to see its questions",
  );
  const docPlaceholder = t("Documento", "ID number");
  const nombrePlaceholder = t("Nombre", "Name");
  const passPlaceholder = t("Contraseña", "Password");
  const gradoPlaceholder = t("Seleccione el grado", "Select grade");
  const rolPlaceholder = t("Seleccione el rol", "Select role");
  const btnRemoveOpcion = t("Quitar", "Remove");
  const requiredFieldsMsg = t(
    "Completa todos los campos requeridos.",
    "Fill in all required fields.",
  );
  const selectTemaPregunta = t("Selecciona un tema", "Select a topic");
  const selectMateriaMsg = t("Selecciona una materia", "Select a subject");
  const cargandoMsg = t("Cargando...", "Loading...");
  const btnCrearPregunta = t("Crear Nueva Pregunta", "Create New Question");
  const tituloCrearPregunta = t("Crear Nueva Pregunta", "Create New Question");
  const tituloEditarPregunta = t("Editar Pregunta", "Edit Question");
  const searchPreguntaPlaceholder = t(
    "Buscar pregunta...",
    "Search question...",
  );

  const btnAddOpcion = t("Agregar Opción", "Add Option");
  const btnBold = t("Negrita", "Bold");
  const btnItalic = t("Cursiva", "Italic");
  const btnStrike = t("Tachado", "Strikethrough");
  const resaltado = t("Resaltado", "Highlight");
  const btnList = t("Lista", "List");
  const btnNumberedList = t("Lista numerada", "Numbered list");
  const tituloH1 = t("Título H1", "Heading 1");
  const tituloH2 = t("Título H2", "Heading 2");
  const tituloH3 = t("Título H3", "Heading 3");
  const citaPlaceholder = t("Cita", "Quote");
  const insertarImagen = t("Insertar imagen", "Insert image");
  const seleccionarImagen = t("Seleccionar imagen", "Select image");
  const codigoBloque = t("Bloque de código", "Code block");
  const btnUndo = t("Deshacer", "Undo");
  const btnRedo = t("Rehacer", "Redo");
  const tamanoImagen = t("Tamaño imagen (px)", "Image size (px)");
  const quitarImagen = t("Quitar imagen", "Remove image");
  const btnRef = t("Referencias", "References");

  contenedor.innerHTML = `
    <div class="container">
      <!-- HEADER -->
      <div class="header-admin">
        <span class="admin-title">${tituloAdmin}</span>
        <div class="buttons" id="authButtons"></div>
        <button class="btn btn-back" onclick="window.location.href='pagina.html'">${backText}</button>
      </div>

      <!-- TABS DE NAVEGACIÓN -->
      <div class="admin-tabs">
        <button class="tab-btn ${seccionActiva === "usuarios" ? "active" : ""}" onclick="cambiarSeccion('usuarios')">${tituloUsuario}</button>
        <button class="tab-btn ${seccionActiva === "temas" ? "active" : ""}" onclick="cambiarSeccion('temas')">${tituloTemas}</button>
        <button class="tab-btn ${seccionActiva === "preguntas" ? "active" : ""}" onclick="cambiarSeccion('preguntas')">${tituloPreguntas}</button>
      </div>

      <!-- ========= SECCIÓN: USUARIOS ========= -->
      <div id="seccionUsuarios" class="admin-section ${seccionActiva === "usuarios" ? "active" : ""}">
        <h2 class="section-title">${tituloUsuario}</h2>

        <input id="searchEstudiante" onkeyup="filterTable()" placeholder="${searchPlaceholder}" class="search">

        <!-- Cards grid de usuarios -->
        <div id="cardsUsuarios" class="cards">
          <p class="loading">${cargandoMsg}</p>
        </div>
      </div>

      <!-- MODAL: EDITAR USUARIO -->
      <div id="modalEditarUsuario" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <h3 id="modalTitle">${editUsuarioLabel}</h3>
            <button type="button" class="modal-close" onclick="cerrarModalUsuario()">×</button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="id">
            <input type="text" id="documento" inputmode="numeric" placeholder="${docPlaceholder}" class="input-documento" disabled required>
            <input type="text" id="nombre" placeholder="${nombrePlaceholder}" required>
            <input type="email" id="correo" placeholder="Correo" required>
            <input type="password" id="contrasena" placeholder="${passPlaceholder}">
            <select id="nombre_grado" required>
              <option value="">${gradoPlaceholder}</option>
            </select>
            <select id="rol" required>
              <option value="">${rolPlaceholder}</option>
            </select>
            <button type="button" class="btn btn-primary" onclick="guardarUsuario()">${btnGuardarUsuario}</button>
          </div>
        </div>
      </div>

      <!-- ========= SECCIÓN: TEMAS ========= -->
      <div id="seccionTemas" class="admin-section ${seccionActiva === "temas" ? "active" : ""}">
        <div class="section-header">
          <h2 class="section-title">${tituloTemas}</h2>
          <button type="button" class="btn btn-primary" onclick="abrirModalTema()">${btnCrearTema}</button>
        </div>

        <select id="selectMateriaTema" onchange="cargarTarjetasTemas(this.value)">
          <option value="">${selectMateriaMsg}</option>
        </select>

        <input id="searchTema" onkeyup="filterTableTemas()" placeholder="${searchTemaPlaceholder}" class="search">

        <div id="cardsTemas" class="cards">
          <p class="no-data">${idiomaActual === "es" ? "Selecciona una materia para ver sus temas" : "Select a subject to see its topics"}</p>
        </div>
      </div>

      <!-- MODAL: CREAR / EDITAR TEMA -->
      <div id="modalTema" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <h3 id="modalTitleTema">${tituloCrearTema}</h3>
            <button type="button" class="modal-close" onclick="cerrarModalTema()">×</button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="temaId">
            <input type="text" id="nombreTema" placeholder="${nombreTemaPlaceholder}" required>
            <button type="button" class="btn btn-primary" onclick="guardarTema()">${btnGuardarTema}</button>
          </div>
        </div>
      </div>

      <!-- ========= SECCIÓN: PREGUNTAS ========= -->
      <div id="seccionPreguntas" class="admin-section ${seccionActiva === "preguntas" ? "active" : ""}">
        <div class="section-header">
          <h2 class="section-title">${tituloPreguntas}</h2>
          <button type="button" id="btnCrearPreguntaRow" class="btn btn-primary hidden" onclick="abrirModalPregunta()">${btnCrearPregunta}</button>
        </div>

        <div class="pregunta-controles">
          <div class="pregunta-selector">
            <select id="selectMateriaPreg" onchange="cargarTemasParaPreguntas(this.value)">
              <option value="">-- ${selectMateriaMsg} --</option>
            </select>
          </div>

          <input id="searchPregunta" onkeyup="filterTablePreguntas()" placeholder="${searchPreguntaPlaceholder}" class="search">
        </div>

        <div id="cardsPreguntas" class="cards">
          <p class="no-data">${idiomaActual === "es" ? "Selecciona una materia para ver sus temas y preguntas" : "Select a subject to see its topics and questions"}</p>
        </div>
      </div>

      <!-- MODAL: CREAR / EDITAR PREGUNTA -->
      <div id="modalPregunta" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <h3 id="modalTitlePregunta">${tituloCrearPregunta}</h3>
            <button type="button" class="modal-close" onclick="cerrarModalPregunta()">×</button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="preguntaId">
            <select id="selectTemaPreg" required onchange="selectedTemaPregunta = this.value">
              <option value="">-- ${selectTemaPregunta} --</option>
            </select>

            <!-- QUILL WYSIWYG EDITOR -->
            <div class="markdown-editor">
              <div class="editor-toolbar">
                <button type="button" id="btn-bold" class="btn btn-sm btn-markdown" onclick="qCmd('bold')" title="${btnBold} (Ctrl+B)"><i class="fa-solid fa-bold"></i></button>
                <button type="button" id="btn-italic" class="btn btn-sm btn-markdown" onclick="qCmd('italic')" title="${btnItalic} (Ctrl+I)"><i class="fa-solid fa-italic"></i></button>
                <button type="button" id="btn-strike" class="btn btn-sm btn-markdown" onclick="qCmd('strike')" title="${btnStrike}"><i class="fa-solid fa-strikethrough"></i></button>
                <button type="button" id="btn-code" class="btn btn-sm btn-markdown" onclick="qCmd('code')" title="${resaltado}"><i class="fa-solid fa-code"></i></button>
                <button type="button" id="btn-image" class="btn btn-sm btn-markdown" onclick="qCmd('image')" title="${insertarImagen}"><i class="fa-solid fa-image"></i></button>
              </div>
              <div class="editor-toolbar">
                <button type="button" id="btn-header1" class="btn btn-sm btn-markdown" onclick="qCmd('header1')" title="${tituloH1}"><i class="fa-solid fa-heading"></i><span class="btn-label">1</span></button>
                <button type="button" id="btn-header2" class="btn btn-sm btn-markdown" onclick="qCmd('header2')" title="${tituloH2}"><i class="fa-solid fa-heading"></i><span class="btn-label">2</span></button>
                <button type="button" id="btn-header3" class="btn btn-sm btn-markdown" onclick="qCmd('header3')" title="${tituloH3}"><i class="fa-solid fa-heading"></i><span class="btn-label">3</span></button>
                <button type="button" id="btn-blockquote" class="btn btn-sm btn-markdown" onclick="qCmd('blockquote')" title="${citaPlaceholder}"><i class="fa-solid fa-quote-left"></i></button>
                <button type="button" id="btn-referencias" class="btn btn-sm btn-markdown" onclick="qCmd('referencias')" title="${btnRef}"><i class="fa-solid fa-book-bookmark"></i></button>
                <button type="button" id="btn-code-block" class="btn btn-sm btn-markdown" onclick="qCmd('code-block')" title="${codigoBloque}"><i class="fa-solid fa-file-code"></i></button>
                <button type="button" id="btn-bullet" class="btn btn-sm btn-markdown" onclick="qCmd('bullet')" title="${btnList}"><i class="fa-solid fa-list-ul"></i></button>
                <button type="button" id="btn-ordered" class="btn btn-sm btn-markdown" onclick="qCmd('ordered')" title="${btnNumberedList}"><i class="fa-solid fa-list-ol"></i></button>
                <div id="quillImgEdit" class="img-edit-bar" title="${insertarImagen}">
                  <select id="quillImgPicker" title="${seleccionarImagen}"></select>
                  <input type="number" id="quillImgWidth" min="24" max="1600" step="4" placeholder="Ancho" title="${tamanoImagen}" />
                  <button type="button" id="quillImgRemove" title="${quitarImagen}"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>
              <div class="editor-toolbar">
                <button type="button" class="btn btn-sm btn-markdown" onclick="qCmd('undo')" title="${btnUndo} (Ctrl+Z)"><i class="fa-solid fa-rotate-left"></i></button>
                <button type="button" class="btn btn-sm btn-markdown" onclick="qCmd('redo')" title="${btnRedo} (Ctrl+Shift+Z)"><i class="fa-solid fa-rotate-right"></i></button>
              </div>
              <div id="textoPregunta" class="quill-canvas" data-placeholder="${preguntaLabel}"></div>
            </div>

            <div id="opcionesContainer">
              <div class="opcion-row">
                <input type="text" class="opcion-input" placeholder="Opción A" required>
                <button type="button" class="btn btn-sm btn-delete-opcion" onclick="eliminarOpcion(this)">${btnRemoveOpcion}</button>
              </div>
              <div class="opcion-row">
                <input type="text" class="opcion-input" placeholder="Opción B" required>
                <button type="button" class="btn btn-sm btn-delete-opcion" onclick="eliminarOpcion(this)">${btnRemoveOpcion}</button>
              </div>
            </div>
            <div class="opcion-accions">
              <button type="button" class="btn btn-outline btn-sm" onclick="agregarOpcion()">${btnAddOpcion}</button>
            </div>
            <select id="respuestaCorrecta" required>
              <option value="">${correctaLabel}</option>
            </select>
            <button type="button" class="btn btn-primary" onclick="guardarPregunta()">${btnGuardarPregunta}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  cargarGradosRoles();
  cargarMateriasSelect();
  setupForm();
  actualizarContadorResponsiveCorrecta();
  cargarTarjetasTemas();
}

function cambiarSeccion(seccion) {
  seccionActiva = seccion;
  document.querySelectorAll(".admin-section").forEach(function (s) {
    s.classList.remove("active");
  });
  document.querySelectorAll(".tab-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  var map = {
    usuarios: "seccionUsuarios",
    temas: "seccionTemas",
    preguntas: "seccionPreguntas",
  };
  var sec = document.getElementById(map[seccion]);
  if (sec) sec.classList.add("active");
  var tab = document.querySelector(
    ".tab-btn[onclick=\"cambiarSeccion('" + seccion + "')\"]",
  );
  if (tab) tab.classList.add("active");

  if (seccion === "temas") cargarTarjetasTemas(selectedMateriaTema);
  if (seccion === "preguntas") renderizarPreguntasCache();
}

/* renderAuthButtons y obtenerNombreUsuario están centralizados en auth.js
   para que todas las páginas muestren el nombre completo (window.SRT.nombre)
   de forma consistente y con soporte de idioma. */

function cerrarSesion() {
  localStorage.removeItem("nombre");
  localStorage.removeItem("documento");

  window.location.href = "login.html";
}

async function cargarGradosRoles() {
  try {
    const selectGrado = document.getElementById("nombre_grado");
    const selectRol = document.getElementById("rol");
    if (!selectGrado || !selectRol) return;

    selectGrado.innerHTML = `<option value="">${idiomaActual === "es" ? "Seleccione el grado" : "Select grade"}</option>`;
    selectRol.innerHTML = `<option value="">${idiomaActual === "es" ? "Seleccione el rol" : "Select role"}</option>`;

    // Fetch grados
    try {
      const res = await fetch(`${API_BASE}/admin_datos.php?accion=grados`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      (data.grados || []).forEach(function (g) {
        const opt = document.createElement("option");
        opt.value = g.id_grado;
        opt.textContent = g.numero_grado + "°";
        selectGrado.appendChild(opt);
      });
    } catch (e) {
      console.error("Error cargando grados:", e);
    }

    // Fetch roles (separate try/catch so one failure doesn't block the other)
    try {
      const rolRes = await fetch(`${API_BASE}/admin_datos.php?accion=roles`);
      if (!rolRes.ok) throw new Error(`HTTP ${rolRes.status}`);
      const rolData = await rolRes.json();
      (rolData.roles || []).forEach(function (r) {
        const opt = document.createElement("option");
        opt.value = r.id_rol;
        opt.textContent = r.nombre_rol;
        selectRol.appendChild(opt);
      });
    } catch (e) {
      console.error("Error cargando roles:", e);
    }
  } catch (e) {
    console.error("Error cargando grados/roles:", e);
  }
}

async function cargarMateriasSelect() {
  try {
    const res = await fetch(`${API_BASE}/admin_datos.php?accion=materias`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    if (!data.ok) return;

    const selectTema = document.getElementById("selectMateriaTema");
    const selectPreg = document.getElementById("selectMateriaPreg");

    const placeholder = `-- ${idiomaActual === "es" ? "Selecciona una materia" : "Select a subject"} --`;

    let htmlTema = `<option value="">${placeholder}</option>`;
    let htmlPreg = htmlTema;

    data.materias.forEach(function (m) {
      htmlTema += `<option value="${m.id_materia}">${m.nombre_materia}</option>`;
      htmlPreg += `<option value="${m.id_materia}">${m.nombre_materia}</option>`;
    });

    if (selectTema) selectTema.innerHTML = htmlTema;
    if (selectPreg) selectPreg.innerHTML = htmlPreg;
  } catch (e) {
    console.error("Error cargando materias:", e);
  }
}

async function cargarUsuarios() {
  try {
    const res = await fetch(`${API_BASE}/admin_datos.php?accion=usuarios`);
    const data = await res.json();
    if (!data.ok) {
      showMessage(
        data.mensaje ||
          (idiomaActual === "es"
            ? "Error al cargar usuarios"
            : "Error loading users"),
        "red",
      );
      return;
    }
    usuariosCache = data.usuarios;
    renderTarjetasUsuarios(data.usuarios);
  } catch (e) {
    console.error("Error:", e);
    showMessage(
      idiomaActual === "es"
        ? "Error al cargar usuarios."
        : "Error loading users.",
      "red",
    );
  }
}

function renderTarjetasUsuarios(data) {
  const container = document.getElementById("cardsUsuarios");
  if (!container) return;
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "No hay usuarios registrados." : "No users registered."}</p>`;
    return;
  }

  const editLabel = idiomaActual === "es" ? "Editar" : "Edit";
  const deleteLabel = idiomaActual === "es" ? "Borrar" : "Delete";

  data.forEach(function (u) {
    const tipoUsuario =
      u.nombre_rol && u.nombre_rol === "Admin" ? "Admin" : "Estudiante";
    const esAdmin = tipoUsuario === "Admin";
    const gradoLabel = u.numero_grado ? u.numero_grado + "°" : "-";

    container.innerHTML += `
      <div class="user-card">
        <div class="user-card-row">
          <div class="user-col-info">
            <div class="user-card-name">${u.nombre_usuario}</div>
            <div class="user-card-info">
              <span class="info-label">${idiomaActual === "es" ? "Documento" : "ID"}:</span>
              <span class="info-value">${u.documento}</span>
            </div>
            <div class="user-card-info">
              <span class="info-label">${idiomaActual === "es" ? "Correo" : "Email"}:</span>
              <span class="info-value">${u.correo}</span>
            </div>
            <div class="user-card-info">
              <span class="info-label">${idiomaActual === "es" ? "Grado" : "Grade"}:</span>
              <span class="info-value">${gradoLabel}</span>
            </div>
          </div>
          <div class="user-col-rol">
            <span class="rol-badge ${esAdmin ? "rol-admin" : "rol-estudiante"}">${tipoUsuario}</span>
          </div>
          <div class="user-col-acciones">
            <button onclick="editarUsuario(${u.id_usuario})" class="btn-accion btn-edit">${editLabel}</button>
            <button onclick="eliminarUsuario(${u.id_usuario})" class="btn-accion btn-delete">${deleteLabel}</button>
          </div>
        </div>
      </div>
    `;
  });
}

function setupForm() {
  window.addEventListener("click", function (e) {
    if (e.target === document.getElementById("modalEditarUsuario"))
      cerrarModalUsuario();
    if (e.target === document.getElementById("modalTema")) cerrarModalTema();
    if (e.target === document.getElementById("modalPregunta"))
      cerrarModalPregunta();
  });
}

function cerrarModalUsuario() {
  const modal = document.getElementById("modalEditarUsuario");
  if (modal) modal.classList.add("hidden");
}

async function guardarUsuario() {
  const id = document.getElementById("id").value || null;
  const documento = document.getElementById("documento").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const id_grado = document.getElementById("nombre_grado").value;
  const id_rol = document.getElementById("rol").value;

  if (!nombre || !correo || !id_rol) {
    showMessage(
      idiomaActual === "es"
        ? "Completa todos los campos requeridos."
        : "Fill in all required fields.",
      "red",
    );
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/admin_datos.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "guardar_usuario",
        id: id,
        documento,
        nombre,
        correo,
        contrasena,
        id_grado,
        id_rol,
      }),
    });
    const result = await res.json();
    if (result.ok) {
      showMessage(result.mensaje, "green");
      cerrarModalUsuario();
      cargarUsuarios();
    } else {
      showMessage(result.mensaje, "red");
    }
  } catch (e) {
    showMessage(
      idiomaActual === "es" ? "Error de conexión." : "Connection error.",
      "red",
    );
  }
}

function editarUsuario(id) {
  const u = usuariosCache.find(function (usr) {
    return usr.id_usuario == id;
  });
  if (!u) return;

  document.getElementById("id").value = u.id_usuario;
  document.getElementById("documento").value = u.documento;
  document.getElementById("nombre").value = u.nombre_usuario;
  document.getElementById("correo").value = u.correo;
  document.getElementById("contrasena").value = "";
  document.getElementById("nombre_grado").value = u.id_grado || "";
  document.getElementById("rol").value = u.id_rol || "";

  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) {
    modalTitle.textContent =
      idiomaActual === "es" ? "Editar Usuario" : "Edit User";
  }

  const modal = document.getElementById("modalEditarUsuario");
  if (modal) modal.classList.remove("hidden");
}

async function eliminarUsuario(id) {
  const title = idiomaActual === "es" ? "¿Eliminar usuario?" : "Delete user?";
  const { isConfirmed } = await Swal.fire({
    title: title,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: idiomaActual === "es" ? "Sí, borrar" : "Yes, delete",
    cancelButtonText: idiomaActual === "es" ? "Cancelar" : "Cancel",
    customClass: {
      confirmButton: "swal-smart-confirm",
      popup: "swal-smart-popup",
    },
  });

  if (!isConfirmed) return;

  try {
    const res = await fetch(`${API_BASE}/admin_datos.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "eliminar_usuario", id: id }),
    });
    const result = await res.json();
    if (result.ok) {
      showMessage(result.mensaje, "green");
      cargarUsuarios();
    } else {
      showMessage(result.mensaje, "red");
    }
  } catch (e) {
    showMessage(
      idiomaActual === "es" ? "Error de conexión." : "Connection error.",
      "red",
    );
  }
}

function filterTable() {
  const q = document.getElementById("searchEstudiante").value.toLowerCase();
  const filtrado = usuariosCache.filter(function (u) {
    const doc = u.documento ? String(u.documento).toLowerCase() : "";
    const nom = u.nombre_usuario ? u.nombre_usuario.toLowerCase() : "";
    const corr = u.correo ? u.correo.toLowerCase() : "";
    const grado = u.numero_grado ? String(u.numero_grado).toLowerCase() : "";
    return (
      doc.includes(q) ||
      nom.includes(q) ||
      corr.includes(q) ||
      grado.includes(q)
    );
  });
  renderTarjetasUsuarios(filtrado);
}

async function cargarTarjetasTemas(idMateria) {
  selectedMateriaTema = idMateria ? String(idMateria) : null;
  const container = document.getElementById("cardsTemas");
  if (!container) return;

  if (!idMateria) {
    container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "Selecciona una materia para ver sus temas" : "Select a subject to see its topics"}</p>`;
    return;
  }

  container.innerHTML = `<p class="loading">${idiomaActual === "es" ? "Cargando temas..." : "Loading topics..."}</p>`;

  try {
    const res = await fetch(
      `${API_BASE}/admin_datos.php?accion=temas&id_materia=${idMateria}`,
    );
    const data = await res.json();
    if (!data.ok) {
      container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "No se pudieron cargar los temas." : "Could not load topics."}</p>`;
      return;
    }
    temasCache = data.temas || [];
    renderTarjetasTemas(temasCache);
  } catch (e) {
    console.error("Error:", e);
    container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "Error al cargar temas." : "Error loading topics."}</p>`;
  }
}

function renderTarjetasTemas(data) {
  const container = document.getElementById("cardsTemas");
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "No hay temas para esta materia." : "No topics for this subject."}</p>`;
    return;
  }

  const editLabel = idiomaActual === "es" ? "Editar" : "Edit";
  const deleteLabel = idiomaActual === "es" ? "Borrar" : "Delete";

  let html = "";
  data.forEach(function (t) {
    html += `
      <div class="user-card">
        <div class="user-card-row">
          <div class="user-col-info">
            <div class="user-card-name">${t.nombre_tema}</div>
          </div>
          <div class="user-col-rol">
            <span class="rol-badge rol-admin">${t.nombre_materia || "-"}</span>
          </div>
          <div class="user-col-acciones">
            <button class="btn-accion btn-edit" onclick="editarTemaPorId(${t.id_tema})">${editLabel}</button>
            <button class="btn-accion btn-delete" onclick="eliminarTema(${t.id_tema})">${deleteLabel}</button>
          </div>
        </div>
      </div>`;
  });
  container.innerHTML = html;
}

function filterTableTemas() {
  const q = (document.getElementById("searchTema")?.value || "")
    .toLowerCase()
    .trim();
  if (!q) {
    renderTarjetasTemas(temasCache);
    return;
  }
  const filtrado = temasCache.filter(function (t) {
    const nombre = (t.nombre_tema || "").toLowerCase();
    const materia = (t.nombre_materia || "").toLowerCase();
    return nombre.includes(q) || materia.includes(q);
  });
  renderTarjetasTemas(filtrado);
}

function abrirModalTema() {
  if (!selectedMateriaTema) {
    showMessage(
      idiomaActual === "es"
        ? "Selecciona una materia primero."
        : "Select a subject first.",
      "red",
    );
    return;
  }
  const modal = document.getElementById("modalTema");
  const title = document.getElementById("modalTitleTema");
  const temaId = document.getElementById("temaId");
  const nombreTema = document.getElementById("nombreTema");

  if (temaId) temaId.value = "";
  if (nombreTema) nombreTema.value = "";
  if (title) {
    title.textContent =
      idiomaActual === "es" ? "Crear Nuevo Tema" : "Create New Topic";
  }
  if (modal) modal.classList.remove("hidden");
}

function cerrarModalTema() {
  const modal = document.getElementById("modalTema");
  if (modal) modal.classList.add("hidden");
}

async function guardarTema() {
  const id = document.getElementById("temaId").value || null;
  const nombre = document.getElementById("nombreTema")?.value.trim();
  const idMateria = selectedMateriaTema;

  if (!nombre || !idMateria) {
    showMessage(
      idiomaActual === "es"
        ? "Selecciona una materia y escribe el nombre del tema."
        : "Select a subject and enter the topic name.",
      "red",
    );
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/admin_datos.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "guardar_tema",
        id: id,
        nombre,
        id_materia: idMateria,
      }),
    });
    const result = await res.json();
    if (result.ok) {
      showMessage(result.mensaje, "green");
      cerrarModalTema();
      cargarTarjetasTemas(selectedMateriaTema);
    } else {
      showMessage(result.mensaje, "red");
    }
  } catch (e) {
    showMessage(
      idiomaActual === "es" ? "Error de conexión." : "Connection error.",
      "red",
    );
  }
}

async function editarTemaPorId(idTema) {
  if (!selectedMateriaTema && !idTema) {
    showMessage(
      idiomaActual === "es"
        ? "Selecciona una materia primero."
        : "Select a subject first.",
      "red",
    );
    return;
  }
  try {
    const res = await fetch(
      `${API_BASE}/admin_datos.php?accion=tema_detalle&id_tema=${idTema}`,
    );
    const data = await res.json();
    if (!data.ok) {
      showMessage(data.mensaje, "red");
      return;
    }
    const tema = data.tema;

    document.getElementById("temaId").value = tema.id_tema;
    document.getElementById("nombreTema").value = tema.nombre_tema;

    const title = document.getElementById("modalTitleTema");
    if (title) {
      title.textContent = idiomaActual === "es" ? "Editar Tema" : "Edit Topic";
    }

    const modal = document.getElementById("modalTema");
    if (modal) modal.classList.remove("hidden");
  } catch (e) {
    showMessage(
      idiomaActual === "es" ? "Error de conexión." : "Connection error.",
      "red",
    );
  }
}

async function eliminarTema(id) {
  const title = idiomaActual === "es" ? "¿Eliminar tema?" : "Delete topic?";
  const { isConfirmed } = await Swal.fire({
    title: title,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: idiomaActual === "es" ? "Sí, borrar" : "Yes, delete",
    cancelButtonText: idiomaActual === "es" ? "Cancelar" : "Cancel",
    customClass: {
      confirmButton: "swal-smart-confirm",
      popup: "swal-smart-popup",
    },
  });

  if (!isConfirmed) return;

  try {
    const res = await fetch(`${API_BASE}/admin_datos.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "eliminar_tema", id: id }),
    });
    const result = await res.json();
    if (result.ok) {
      showMessage(result.mensaje, "green");
      cargarTarjetasTemas(selectedMateriaTema);
    } else {
      showMessage(result.mensaje, "red");
    }
  } catch (e) {
    showMessage(
      idiomaActual === "es" ? "Error de conexión." : "Connection error.",
      "red",
    );
  }
}

async function cargarTemasParaPreguntas(idMateria) {
  const selectMateriaPreg = document.getElementById("selectMateriaPreg");
  const selectTemaPreg = document.getElementById("selectTemaPreg");
  const container = document.getElementById("cardsPreguntas");
  if (!selectMateriaPreg && !container) return;

  if (selectTemaPreg) {
    const placeholder =
      idiomaActual === "es" ? "Selecciona un tema" : "Select a topic";
    selectTemaPreg.innerHTML = `<option value="">${placeholder}</option>`;
  }

  if (!idMateria) {
    temasConPreguntas = [];
    preguntasCache = [];
    document.getElementById("btnCrearPreguntaRow")?.classList.add("hidden");
    if (container)
      container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "Selecciona una materia para ver sus temas y preguntas" : "Select a subject to see its topics and questions"}</p>`;
    return;
  }

  /* Mostrar el botón de crear pregunta solo cuando hay una materia seleccionada */
  document.getElementById("btnCrearPreguntaRow")?.classList.remove("hidden");

  if (container)
    container.innerHTML = `<p class="loading">${idiomaActual === "es" ? "Cargando temas y preguntas..." : "Loading topics and questions..."}</p>`;

  try {
    const res = await fetch(
      `${API_BASE}/admin_datos.php?accion=temas&id_materia=${idMateria}`,
    );
    const data = await res.json();
    if (!data.ok) {
      if (container)
        container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "No se pudieron cargar los temas." : "Could not load topics."}</p>`;
      return;
    }

    const temas = (data.temas || []).slice().sort(function (a, b) {
      return String(a.nombre_tema || "").localeCompare(
        String(b.nombre_tema || ""),
        undefined,
        {
          sensitivity: "base",
        },
      );
    });

    if (selectTemaPreg) {
      const placeholder =
        idiomaActual === "es" ? "Selecciona un tema" : "Select a topic";
      temas.forEach(function (t) {
        const opt = document.createElement("option");
        opt.value = t.id_tema;
        opt.textContent = t.nombre_tema;
        selectTemaPreg.appendChild(opt);
      });
    }

    const resultados = await Promise.all(
      temas.map(async function (t) {
        const preg = await cargarPreguntasDeTema(t.id_tema);
        return {
          id_tema: t.id_tema,
          nombre_tema: t.nombre_tema,
          preguntas: preg,
        };
      }),
    );

    temasConPreguntas = resultados;
    preguntasCache = [];
    resultados.forEach(function (tp) {
      tp.preguntas.forEach(function (p) {
        preguntasCache.push(
          Object.assign({}, p, {
            id_tema: tp.id_tema,
            nombre_tema: tp.nombre_tema,
          }),
        );
      });
    });
    renderTarjetasPreguntas(preguntasCache);
  } catch (e) {
    console.error("Error:", e);
    if (container)
      container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "Error al cargar los temas." : "Error loading topics."}</p>`;
  }
}

async function cargarPreguntasDeTema(idTema) {
  try {
    const res = await fetch(
      `${API_BASE}/admin_datos.php?accion=preguntas_tema&id_tema=${idTema}`,
    );
    const data = await res.json();
    if (!data.ok) return [];
    return (data.preguntas || []).slice().sort(function (a, b) {
      return Number(a.id_pregunta || 0) - Number(b.id_pregunta || 0);
    });
  } catch (e) {
    console.error("Error preguntas tema:", e);
    return [];
  }
}

function renderizarPreguntasCache() {
  if (preguntasCache.length === 0) {
    const container = document.getElementById("cardsPreguntas");
    if (container)
      container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "Selecciona una materia para ver sus temas y preguntas" : "Select a subject to see its topics and questions"}</p>`;
    return;
  }
  const q = (document.getElementById("searchPregunta")?.value || "")
    .trim()
    .toLowerCase();
  if (q) {
    filterTablePreguntas();
  } else {
    renderTarjetasPreguntas(preguntasCache);
  }
}

async function refrescarPreguntas() {
  const m = document.getElementById("selectMateriaPreg");
  if (m && m.value) await cargarTemasParaPreguntas(m.value);
}

function renderTarjetasPreguntas(data) {
  const container = document.getElementById("cardsPreguntas");
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="no-data">${idiomaActual === "es" ? "No hay preguntas para esta materia." : "No questions for this subject."}</p>`;
    return;
  }

  const editLabel = idiomaActual === "es" ? "Editar" : "Edit";
  const deleteLabel = idiomaActual === "es" ? "Borrar" : "Delete";
  const letras = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  const ordenTemas = (temasConPreguntas || []).map(function (t) {
    return t.nombre_tema;
  });

  const porTema = {};
  const vistos = [];
  data.forEach(function (p) {
    const t = p.nombre_tema || "";
    if (!porTema[t]) {
      porTema[t] = [];
      vistos.push(t);
    }
    porTema[t].push(p);
  });
  vistos.sort(function (a, b) {
    const ia = ordenTemas.indexOf(a);
    const ib = ordenTemas.indexOf(b);
    if (ia === -1 && ib === -1) {
      return a.localeCompare(b, undefined, { sensitivity: "base" });
    }
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  let html = "";
  vistos.forEach(function (t) {
    html += `<div class="tema-section"><h3 class="tema-title">${t || "Sin tema"}</h3><div class="preguntas-tema">`;
    porTema[t].forEach(function (p) {
      const texto = p.pregunta || p.texto_pregunta || "";
      const opciones = p.opciones || [];
      const correcta = p.respuesta_correcta || "";

      let opcionesHtml = "";
      opciones.forEach(function (opt, i) {
        const letra = letras[i] || i + 1;
        const esCorrecta =
          String(letra).toUpperCase() === String(correcta).toUpperCase();
        opcionesHtml += `<span class="pregunta-opcion ${esCorrecta ? "correcta" : ""}">${letra}. ${opt}</span>`;
      });

      html += `
      <div class="user-card pregunta-card">
        <div class="pregunta-card-header">
          <span class="rol-badge rol-estudiante">${idiomaActual === "es" ? "Pregunta" : "Question"}</span>
          <div class="pregunta-acciones">
            <button class="btn-accion btn-edit" onclick="editarPreguntaPorId(${p.id_pregunta})">${editLabel}</button>
            <button class="btn-accion btn-delete" onclick="eliminarPregunta(${p.id_pregunta})">${deleteLabel}</button>
          </div>
        </div>
        <div class="pregunta-card-body">
          <div class="smart-visor pregunta-visor">${texto}</div>
          <div class="pregunta-opciones">${opcionesHtml}</div>
        </div>
      </div>`;
    });
    html += `</div></div>`;
  });
  container.innerHTML = html;
}

function agregarOpcion() {
  const container = document.getElementById("opcionesContainer");
  if (!container) return;
  const count = container.children.length;
  const letra = String.fromCharCode(65 + count);

  const row = document.createElement("div");
  row.className = "opcion-row";
  row.innerHTML = `
    <input type="text" class="opcion-input" placeholder="${idiomaActual === "es" ? "Opción" : "Option"} ${letra}" required>
    <button type="button" class="btn btn-sm btn-delete-opcion" onclick="eliminarOpcion(this)">${idiomaActual === "es" ? "Quitar" : "Remove"}</button>
  `;
  container.appendChild(row);
  actualizarContadorResponsiveCorrecta();
}

function eliminarOpcion(btn) {
  const row = btn.parentNode;
  if (row && row.parentNode) {
    row.parentNode.removeChild(row);
  }
  actualizarContadorResponsiveCorrecta();
}

function actualizarContadorResponsiveCorrecta() {
  const container = document.getElementById("opcionesContainer");
  const select = document.getElementById("respuestaCorrecta");
  if (!container || !select) return;

  // Preserve current selection when rebuilding the select
  const currentSelection = select.value;

  select.innerHTML = `<option value="">${idiomaActual === "es" ? "Respuesta correcta:" : "Correct answer:"}</option>`;

  const inputs = container.querySelectorAll(".opcion-input");
  inputs.forEach(function (input, i) {
    const letra = String.fromCharCode(65 + i);
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${letra}. ${input.value || (idiomaActual === "es" ? "Opción" : "Option") + " " + letra}`;
    // Restore selection if it still corresponds to a valid option
    if (String(i) === currentSelection) opt.selected = true;
    select.appendChild(opt);
  });
}

document.addEventListener("input", function (e) {
  if (e.target && e.target.classList.contains("opcion-input")) {
    actualizarContadorResponsiveCorrecta();
  }
});

function abrirModalPregunta() {
  const modal = document.getElementById("modalPregunta");
  const title = document.getElementById("modalTitlePregunta");
  const preguntaId = document.getElementById("preguntaId");
  const textoPregunta = document.getElementById("textoPregunta");
  const selectTemaPreg = document.getElementById("selectTemaPreg");

  if (preguntaId) preguntaId.value = "";
  const editor =
    typeof initQuillEditor === "function"
      ? initQuillEditor(textoPregunta)
      : null;
  if (editor) editor.setText("");
  if (title) {
    title.textContent =
      idiomaActual === "es" ? "Crear Nueva Pregunta" : "Create New Question";
  }

  const container = document.getElementById("opcionesContainer");
  const es = idiomaActual === "es";
  if (container) {
    container.innerHTML = `
      <div class="opcion-row"><input type="text" class="opcion-input" placeholder="${es ? "Opción" : "Option"} A" required><button type="button" class="btn btn-sm btn-delete-opcion" onclick="eliminarOpcion(this)">${es ? "Quitar" : "Remove"}</button></div>
      <div class="opcion-row"><input type="text" class="opcion-input" placeholder="${es ? "Opción" : "Option"} B" required><button type="button" class="btn btn-sm btn-delete-opcion" onclick="eliminarOpcion(this)">${es ? "Quitar" : "Remove"}</button></div>
    `;
  }
  actualizarContadorResponsiveCorrecta();

  if (selectTemaPreg && selectedTemaPregunta) {
    selectTemaPreg.value = selectedTemaPregunta;
  }

  if (modal) modal.classList.remove("hidden");
}

function cerrarModalPregunta() {
  const modal = document.getElementById("modalPregunta");
  if (modal) modal.classList.add("hidden");

  if (typeof clearPreguntaQuill === "function") clearPreguntaQuill();
}

function filterTablePreguntas() {
  const q = (document.getElementById("searchPregunta")?.value || "")
    .toLowerCase()
    .trim();
  if (!q) {
    renderTarjetasPreguntas(preguntasCache);
    return;
  }
  const filtrado = preguntasCache.filter(function (p) {
    const texto = (p.pregunta || p.texto_pregunta || "").toLowerCase();
    const opciones = (p.opciones || []).map(function (o) {
      return (o || "").toLowerCase();
    });
    if (texto.includes(q)) return true;
    return opciones.some(function (o) {
      return o.includes(q);
    });
  });
  renderTarjetasPreguntas(filtrado);
}

async function guardarPregunta() {
  const id = document.getElementById("preguntaId").value || null;
  const textoPregunta = getHTMLPregunta();
  const idTema = document.getElementById("selectTemaPreg").value;
  const correcta = document.getElementById("respuestaCorrecta").value;

  const inputs = document.querySelectorAll("#opcionesContainer .opcion-input");
  const opciones = [];
  inputs.forEach(function (input) {
    const val = input.value.trim();
    if (val) opciones.push(val);
  });

  const faltan = [];
  if (isEmptyPregunta()) faltan.push(idiomaActual === "es" ? "el texto de la pregunta" : "the question text");
  if (!idTema) faltan.push(idiomaActual === "es" ? "el tema" : "the topic");
  if (opciones.length < 2) faltan.push(idiomaActual === "es" ? "al menos 2 opciones" : "at least 2 options");
  if (correcta === "") faltan.push(idiomaActual === "es" ? "la respuesta correcta" : "the correct answer");

  if (faltan.length > 0) {
    showMessage(
      idiomaActual === "es"
        ? "Falta completar: " + faltan.join(", ") + "."
        : "Missing: " + faltan.join(", ") + ".",
      "red",
    );
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/admin_datos.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "guardar_pregunta",
        id: id,
        pregunta: textoPregunta,
        texto_pregunta: textoPregunta,
        id_tema: idTema,
        opciones: opciones,
        correcta: correcta,
      }),
    });
    const result = await res.json();
    if (result.ok) {
      showMessage(result.mensaje, "green");
      selectedTemaPregunta = idTema;
      cerrarModalPregunta();
      await refrescarPreguntas();
    } else {
      showMessage(result.mensaje, "red");
    }
  } catch (e) {
    showMessage(
      idiomaActual === "es" ? "Error de conexión." : "Connection error.",
      "red",
    );
  }
}

async function editarPreguntaPorId(idPregunta) {
  try {
    const res = await fetch(
      `${API_BASE}/admin_datos.php?accion=pregunta_detalle&id_pregunta=${idPregunta}`,
    );
    const data = await res.json();
    if (!data.ok) {
      showMessage(data.mensaje, "red");
      return;
    }
    const p = data.pregunta;
    const es = idiomaActual === "es";

    document.getElementById("preguntaId").value = p.id_pregunta;
    const editorEditar =
      typeof initQuillEditor === "function"
        ? initQuillEditor(document.getElementById("textoPregunta"))
        : null;
    if (editorEditar && p.texto_pregunta) {
      editorEditar.setContents(
        editorEditar.clipboard.convert(p.texto_pregunta),
        "silent",
      );
      /* clipboard.convert puede stripear atributos de ancho; reaplicar
         ancho por defecto a las imágenes sin ancho */
      setTimeout(function () {
        var imgs = editorEditar.root.querySelectorAll("img");
        for (var i = 0; i < imgs.length; i++) {
          var img = imgs[i];
          if (!img.getAttribute("width") && !img.style.width) {
            img.setAttribute("width", "200");
            img.style.width = "200px";
          }
        }
      }, 0);
    }

    const selectTemaPreg = document.getElementById("selectTemaPreg");
    if (selectTemaPreg && selectTemaPreg.children.length <= 1) {
      const selectMateriaPreg = document.getElementById("selectMateriaPreg");
      if (selectMateriaPreg && selectMateriaPreg.value) {
        await cargarTemasParaPreguntas(selectMateriaPreg.value);
      }
    }
    if (selectTemaPreg) selectTemaPreg.value = p.id_tema;
    selectedTemaPregunta = p.id_tema;

    const container = document.getElementById("opcionesContainer");
    container.innerHTML = "";
    p.opciones.forEach(function (opt, i) {
      const letra = String.fromCharCode(65 + i);
      const row = document.createElement("div");
      row.className = "opcion-row";
      row.innerHTML = `
        <input type="text" class="opcion-input" placeholder="${es ? "Opción" : "Option"} ${letra}" value="${opt}" required>
        <button type="button" class="btn btn-sm btn-delete-opcion" onclick="eliminarOpcion(this)">${es ? "Quitar" : "Remove"}</button>
      `;
      container.appendChild(row);
    });

    actualizarContadorResponsiveCorrecta();

    setTimeout(function () {
      document.getElementById("respuestaCorrecta").value = p.respuesta_correcta;
    }, 100);

    const title = document.getElementById("modalTitlePregunta");
    if (title) {
      title.textContent =
        idiomaActual === "es" ? "Editar Pregunta" : "Edit Question";
    }

    const modal = document.getElementById("modalPregunta");
    if (modal) modal.classList.remove("hidden");
  } catch (e) {
    showMessage(
      idiomaActual === "es" ? "Error de conexión." : "Connection error.",
      "red",
    );
  }
}

async function eliminarPregunta(id) {
  const title =
    idiomaActual === "es" ? "¿Eliminar pregunta?" : "Delete question?";
  const { isConfirmed } = await Swal.fire({
    title: title,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: idiomaActual === "es" ? "Sí, borrar" : "Yes, delete",
    cancelButtonText: idiomaActual === "es" ? "Cancelar" : "Cancel",
    customClass: {
      confirmButton: "swal-smart-confirm",
      popup: "swal-smart-popup",
    },
  });

  if (!isConfirmed) return;

  try {
    const res = await fetch(`${API_BASE}/admin_datos.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "eliminar_pregunta", id: id }),
    });
    const result = await res.json();
    if (result.ok) {
      showMessage(result.mensaje, "green");
      await refrescarPreguntas();
    } else {
      showMessage(result.mensaje, "red");
    }
  } catch (e) {
    showMessage(
      idiomaActual === "es" ? "Error de conexión." : "Connection error.",
      "red",
    );
  }
}

function showMessage(mensaje, tipo) {
  const icon = tipo === "red" ? "error" : tipo === "green" ? "success" : "info";
  Swal.fire({
    title:
      icon === "success"
        ? idiomaActual === "es"
          ? "Éxito"
          : "Success"
        : idiomaActual === "es"
          ? "Error"
          : "Error",
    text: mensaje,
    icon: icon,
    timer: 3000,
    customClass: { popup: "swal-smart-popup" },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("idiomaToggle");
  if (toggle) {
    toggle.checked = idiomaActual === "en";
  }
  actualizarBotonIdioma();
  cargarContenido(idiomaActual);

  window.srtOnReady(function () {
    if (!window.SRT || !window.SRT.nombre) {
      window.location.href = "login.html";
      return;
    }
    if (window.SRT.rol !== "admin") {
      window.location.href = "pagina.html";
      return;
    }
    window.adminInicializado = true;
    cargarUsuarios();
  });
});


// ============================================
// Quill Editor Initialization
// ============================================

let quillEditor = null;
let currentQuillEl = null;
let lastRange = null;
let toolbarMouseDown = false;
let quillImgEditEl = null;
let quillImgPickerEl = null;
let quillImgWidthEl = null;
let quillImgRemoveEl = null;
let imageDragSrc = null;
let imageDragIndex = -1;
let currentImageIndex = null;

// Register custom format for image width attribute (required for Quill 1.3.6)
// Quill 1.3.6 doesn't support custom attributes on image blots by default
// We provide a workaround by directly manipulating the DOM
(function() {
  if (typeof Quill === "undefined" || typeof Quill.register !== "function") {
    console.warn("Quill not available for width format registration");
    return;
  }

  // Try to register width format if Quill supports it
  // Note: In Quill 1.3.6, this may not work for image blots natively
  try {
    Quill.register('format/width', {
      size: 64, // Blot size in Quill units
      filter: function(format, value) {
        if (value === false || value === null || value === "") {
          return false;
        }
        return value;
      },
      format: function(domNode, value, oldDomNode) {
        if (value === false || value === null || value === "") {
          if (oldDomNode) {
            oldDomNode.removeAttribute("width");
            oldDomNode.style.width = "";
          }
        } else {
          domNode.setAttribute("width", value);
          domNode.style.width = value + "px";
        }
      },
      parse: function(domNode) {
        var width = domNode.getAttribute("width");
        if (width) {
          return parseInt(width, 10);
        }
        var styleWidth = domNode.style.width;
        if (styleWidth) {
          return parseInt(styleWidth.replace("px", ""), 10);
        }
        return null;
      }
    });
  } catch (e) {
    console.warn("Could not register width format, DOM manipulation will be used as fallback:", e);
  }
})();

function initQuillEditor(containerEl) {
  const el = containerEl || document.getElementById("textoPregunta");
  if (!el) return null;

  if (
    quillEditor &&
    currentQuillEl === el &&
    quillEditor.root &&
    quillEditor.root.parentNode === el
  ) {
    return quillEditor;
  }


  if (quillEditor) {
    quillEditor = null;
    currentQuillEl = null;
  }

  if (typeof Quill === "undefined") {
    console.error("Quill no está cargado.");
    return null;
  }

  try {
    const q = new Quill(el, {
      modules: {
        toolbar: false,
        history: {},
      },
      theme: "snow",
      placeholder: el.getAttribute("data-placeholder") || "",
    });

    quillEditor = q;
    currentQuillEl = el;
    quillImgEditEl = document.getElementById("quillImgEdit");
    quillImgPickerEl = document.getElementById("quillImgPicker");
    quillImgWidthEl = document.getElementById("quillImgWidth");
    quillImgRemoveEl = document.getElementById("quillImgRemove");

    if (q.root) {
      q.root.setAttribute(
        "data-placeholder",
        el.getAttribute("data-placeholder") || "",
      );
      q.root.classList.toggle("ql-blank", q.getText().trim() === "");
    }
    q.on("text-change", function () {
      if (!q.root) return;
      q.root.classList.toggle("ql-blank", q.getText().trim() === "");
      rebuildImagePicker(q);
    });

    const toolbarWrap = el.closest(".markdown-editor");
    if (toolbarWrap && !toolbarWrap.__quillToolbarBound) {
      toolbarWrap.addEventListener(
        "mousedown",
        function (e) {
          const hit = e.target.closest(
            ".btn-markdown, #quillImgPicker, #quillImgWidth, #quillImgRemove",
          );
          if (hit && quillEditor) {
            const s = quillEditor.getSelection();
            if (s) {
              lastRange = s;
              toolbarMouseDown = true;
            }
          }
        },
        true,
      );
      toolbarWrap.__quillToolbarBound = true;
    }

    q.on("selection-change", function (range) {
      if (range) lastRange = range;

      let leaf = selectedImageLeaf(q, range);

      /*
       * FIX: cuando el editor pierde el foco (range === null) Quill emite
       * selection-change con null. Esto pasa, por ejemplo, cuando el usuario
       * hace clic sobre el propio input de ancho / el selector / el botón de
       * borrar de la barra de edición de imágenes (que viven en la toolbar,
       * fuera del `.ql-editor`). Sin este guardián la barra se le quita la
       * clase `visible` y DESAPARECE justo cuando el usuario intenta
       * editar la imagen. Mientras la imagen siga existiendo, mantenla visible
       * y conserva los valores; solo se oculta al borrarla o al seleccionar
       * otro rango que no sea una imagen.
       */
      const editorBlurred = range === null || range === undefined;
      if (
        !leaf &&
        editorBlurred &&
        currentImageIndex != null &&
        quillImgEditEl
      ) {
        if (imageExistsAt(q, currentImageIndex)) {
          try {
            const at = q.getLeaf(currentImageIndex);
            leaf = at && at[0] ? at[0] : null;
          } catch (e) {
            leaf = null;
          }
        }
      }

      if (quillImgEditEl) {
        if (leaf) {
          // Sólo actualizamos el índice cuando la selección es real (no
          // estamos en modo "sticky"), para no perder la imagen activa.
          if (range) currentImageIndex = q.getIndex(leaf);
          quillImgEditEl.classList.add("visible");
          if (quillImgPickerEl)
            quillImgPickerEl.value = String(currentImageIndex);

          // Read width from format or from DOM element
          let w = "";
          try {
            const fmt = q.getFormat(currentImageIndex, 1);
            w = fmt.width ? fmt.width : "";
          } catch (e) {
            w = "";
          }

          // Fallback: read width directly from the image DOM element
          if (!w) {
            try {
              const imgElement = getSelectedImageDOM(q, currentImageIndex)
                || leaf.domNode
                || (quillEditor && quillEditor.root.querySelector("img"));
              if (imgElement) {
                w =
                  imgElement.getAttribute("width") ||
                  imgElement.style.width ||
                  "";
                // Extract numeric value from style width (e.g., "200px")
                if (typeof w === "string" && w.includes("px")) {
                  w = w.replace("px", "");
                }
              }
            } catch (e) {
              //Ignore
            }
          }

          if (quillImgWidthEl) quillImgWidthEl.value = w ? parseInt(w, 10) : "";
        } else {
          currentImageIndex = null;
          if (quillImgPickerEl) quillImgPickerEl.value = "";
          if (quillImgWidthEl) quillImgWidthEl.value = "";
          quillImgEditEl.classList.remove("visible");
        }
      }
      updateToolbarActive(q, range);
    });

    if (quillImgWidthEl && !quillImgWidthEl.__bound) {
      // Helper function to apply width directly to image DOM element
      // This is needed because Quill 1.3.6 doesn't natively support width formatting
      const applyImageWidthToDOM = function (width) {
        if (!quillEditor || currentImageIndex == null) return;
        try {
          // Apuntar a la imagen seleccionada y no a la primera <img> del
          // editor (que era el comportamiento anterior y fallaba con varias
          // imágenes, aplicando el ancho a la equivocada).
          let img = getSelectedImageDOM(quillEditor, currentImageIndex);
          if (!img) {
            try {
              img = quillEditor.root.querySelector("img");
            } catch (e) {}
          }
          if (img) {
            if (width && width > 0) {
              img.setAttribute("width", width);
              img.style.width = width + "px";
            } else {
              img.removeAttribute("width");
              img.style.width = "";
            }
          }
        } catch (e) {
          console.warn("Could not apply width to image DOM:", e);
        }
      };

      quillImgWidthEl.addEventListener("input", function () {
        if (quillEditor && currentImageIndex != null) {
          const v = parseInt(this.value, 10);
          // Apply width format through Quill
          try {
            quillEditor.formatText(
              currentImageIndex,
              1,
              "width",
              v ? v : false,
            );
          } catch (e) {
            // If format fails (width not registered as a format), apply directly to DOM
            console.warn(
              "Width format not registered, applying directly to DOM:",
              e,
            );
          }
          // Always apply width directly to DOM as fallback (works in Quill 1.3.6)
          applyImageWidthToDOM(v);
        }
      });
      quillImgWidthEl.__bound = true;
    }

    if (quillImgRemoveEl && !quillImgRemoveEl.__bound) {
      quillImgRemoveEl.addEventListener("click", function () {
        if (quillEditor && currentImageIndex != null) {
          quillEditor.deleteText(currentImageIndex, 1);
          currentImageIndex = null;
          if (quillImgEditEl) quillImgEditEl.classList.remove("visible");
        }
      });
      quillImgRemoveEl.__bound = true;
    }

    if (quillImgPickerEl && !quillImgPickerEl.__bound) {
      quillImgPickerEl.addEventListener("change", function () {
        const idx = parseInt(this.value, 10);
        if (quillEditor && !isNaN(idx)) {
          quillEditor.setSelection(idx, 1);
        }
      });
      quillImgPickerEl.__bound = true;
    }

    if (q.root && !q.root.__quillImageDnDBound) {
      q.root.addEventListener("dragstart", function (e) {
        const img = e.target && e.target.tagName === "IMG" ? e.target : null;
        if (!img) {
          imageDragSrc = null;
          imageDragIndex = -1;
          return;
        }
        imageDragSrc = img.getAttribute("src") || img.src || "";
        imageDragIndex = domPositionToIndex(q, img, 0);
        try {
          e.dataTransfer.effectAllowed = "move";
        } catch (err) {}
      });

      q.root.addEventListener("dragover", function (e) {
        if (!q || !q.root) return;
        const dt = e.dataTransfer;
        if (!dt) return;
        let imgUrl = "";
        try {
          imgUrl =
            dt.getData("text/uri-list") || dt.getData("text/plain") || "";
        } catch (err) {
          imgUrl = "";
        }
        if (imageDragSrc || imgUrl) {
          e.preventDefault();
          try {
            dt.dropEffect = "move";
          } catch (err) {}
        }
      });

      q.root.addEventListener("drop", function (e) {
        const dt = e.dataTransfer;
        if (!dt) return;
        let imgUrl = "";
        try {
          imgUrl =
            dt.getData("text/uri-list") || dt.getData("text/plain") || "";
        } catch (err) {
          imgUrl = "";
        }

        if (imageDragSrc) {
          const toIdx = dropIndexAtPoint(q, e);
          e.preventDefault();
          const src = imageDragSrc;
          const fromIdx = imageDragIndex;
          resetImageDrag();
          moveImageInEditor(q, src, fromIdx, toIdx);
          return;
        }

        if (imgUrl) {
          const toIdx = dropIndexAtPoint(q, e);
          e.preventDefault();
          q.insertEmbed(toIdx, "image", imgUrl);
          q.setSelection(toIdx, 1);
          resetImageDrag();
          return;
        }
      });
      q.root.__quillImageDnDBound = true;
    }

    return quillEditor;
  } catch (e) {
    console.error("No se pudo iniciar Quill:", e);
    quillEditor = null;
    currentQuillEl = null;
    return null;
  }
}

function selectedImageLeaf(q, range) {
  if (!range) return null;

  // Get the leaf at the selection position
  const leafStart = q.getLeaf(range.index);
  const startBlot = leafStart && leafStart[0];

  // Check if the start blot is an image (handles both selection and cursor-on-image cases)
  if (startBlot && startBlot.domNode && startBlot.domNode.tagName === "IMG") {
    return startBlot;
  }

  // Also check the end position if there's a range selection
  if (range.length > 0) {
    const leafEnd = q.getLeaf(range.index + range.length);
    const endBlot = leafEnd && leafEnd[0];
    if (endBlot && endBlot.domNode && endBlot.domNode.tagName === "IMG") {
      return endBlot;
    }
  }

  return null;
}

// Devuelve el blot (leaf) de la imagen que se encuentra en el índice de
// documento dado, o null si en esa posición no hay una imagen.
function getLeafAtImage(q, index) {
  if (index == null) return null;
  try {
    const leaf = q.getLeaf(index);
    const blot = leaf && leaf[0];
    if (blot && blot.domNode && blot.domNode.tagName === "IMG") {
      return blot;
    }
  } catch (e) {}
  return null;
}

// Indica si en el índice de documento dado sigue habiendo una imagen.
function imageExistsAt(q, index) {
  return !!getLeafAtImage(q, index);
}

// Devuelve el nodo <img> DOM de la imagen activa (por índice).
// Apunta siempre a la imagen seleccionada, incluso cuando hay varias
// imágenes en el editor (el antiguo querySelector("img") tomaba siempre la
// primera, por lo que editaba la imagen equivocada).
function getSelectedImageDOM(q, index) {
  const blot = getLeafAtImage(q, index);
  return blot ? blot.domNode : null;
}

function rebuildImagePicker(q) {
  if (!quillImgPickerEl) return;
  const ops = (q.getContents() && q.getContents().ops) || [];
  const items = [];
  let idx = 0;
  ops.forEach(function (op) {
    const ins = op.insert;
    if (
      ins &&
      typeof ins === "object" &&
      Object.prototype.hasOwnProperty.call(ins, "image")
    ) {
      items.push({ index: idx, src: ins.image });
    }
    if (typeof ins === "string") {
      idx += ins.length;
    } else if (ins && typeof ins === "object") {
      idx += 1;
    }
  });

  const changed = items.length !== quillImgPickerEl.options.length;
  quillImgPickerEl.innerHTML = "";
  items.forEach(function (it, i) {
    const opt = document.createElement("option");
    opt.value = String(it.index);
    opt.textContent = "Imagen " + (i + 1);
    quillImgPickerEl.appendChild(opt);
  });
  return changed;
}

function domNodeQuillLen(n) {
  if (!n) return 0;
  if (n.nodeType === 3) return n.length;
  if (n.nodeType === 1) {
    if (n.tagName === "IMG" || n.tagName === "BR") return 1;
    let s = 0;
    for (let i = 0; i < n.childNodes.length; i++)
      s += domNodeQuillLen(n.childNodes[i]);
    return s;
  }
  return 0;
}

function domPositionToIndex(q, node, offset) {
  const root = q.root;
  if (!root || node === root || offset < 0) return 0;
  let index = 0;
  let maxLen = 1e9;
  try {
    maxLen = q.getLength();
  } catch (e) {}
  function dfs(n) {
    if (n === node) {
      if (n.nodeType === 3) {
        index += offset;
        return true;
      }
      const kids = n.childNodes;
      for (let i = 0; i < offset && i < kids.length; i++)
        index += domNodeQuillLen(kids[i]);
      if (kids.length === 0 && offset > 0) index += domNodeQuillLen(n);
      return true;
    }
    if (n.nodeType === 1) {
      const kids = n.childNodes;
      for (let i = 0; i < kids.length; i++) {
        const c = kids[i];
        if (dfs(c)) return true;
        index += domNodeQuillLen(c);
      }
    }
    return false;
  }
  dfs(root);
  return Math.max(0, Math.min(index, maxLen));
}

function dropIndexAtPoint(q, e) {
  const win = window;
  let node = null,
    offset = 0;
  try {
    if (win.caretPositionFromPoint) {
      const pos = win.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) {
        node = pos.offsetNode;
        offset = pos.offset;
      }
    } else if (win.caretRangeFromPoint) {
      const r = win.caretRangeFromPoint(e.clientX, e.clientY);
      if (r) {
        node = r.startContainer;
        offset = r.startOffset;
      }
    }
  } catch (err) {
    node = null;
  }
  if (node) return domPositionToIndex(q, node, offset);
  const sel = q.getSelection(true);
  if (sel) return sel.index;
  const L = (q.getLength() || 1) - 1;
  return L >= 0 ? L : 0;
}

function resetImageDrag() {
  imageDragSrc = null;
  imageDragIndex = -1;
}

function moveImageInEditor(q, src, fromIdx, toIdx) {
  if (fromIdx < 0 || toIdx === fromIdx) {
    return;
  }
  const len = q.getLength() || 0;
  toIdx = Math.max(0, Math.min(toIdx, len));
  fromIdx = Math.max(0, Math.min(fromIdx, len - 1));
  if (toIdx === fromIdx) return;
  try {
    q.deleteText(fromIdx, 1);
  } catch (e) {}

  if (toIdx > fromIdx) toIdx = toIdx - 1;
  toIdx = Math.max(0, Math.min(toIdx, q.getLength() || 0));
  try {
    q.insertEmbed(toIdx, "image", src);
  } catch (e) {}
  try {
    q.setSelection(toIdx, 1);
  } catch (e) {}
}

function qCmd(cmd) {
  const q =
    quillEditor ||
    (typeof initQuillEditor === "function" ? initQuillEditor() : null);
  if (!q) return;

  let range =
    toolbarMouseDown && lastRange
      ? lastRange
      : q.getSelection(true) || lastRange || { index: 0, length: 0 };
  toolbarMouseDown = false;
  if (range && range.length > 0) lastRange = range;

  switch (cmd) {
    case "bold":
    case "italic":
    case "strike":
    case "code":
      {
        const active =
          q.getFormat(range.index, Math.max(range.length, 1))[cmd] || false;
        q.formatText(range.index, range.length, cmd, !active);
      }
      break;
    case "image":
      insertImageQ(q, range);
      break;

    case "blockquote":
    case "code-block":
      {
        const active =
          q.getFormat(range.index, Math.max(range.length, 1))[cmd] || false;
        q.formatLine(range.index, range.length, cmd, !active);
      }
      break;
    case "header1":
      toggleHeaderQ(q, range, 1);
      break;
    case "header2":
      toggleHeaderQ(q, range, 2);
      break;
    case "header3":
      toggleHeaderQ(q, range, 3);
      break;
    case "bullet":
      toggleListQ(q, range, "bullet");
      break;
    case "ordered":
      toggleListQ(q, range, "ordered");
      break;

    case "referencias":
      {
        const refLabel =
          typeof idiomaActual !== "undefined" && idiomaActual === "en"
            ? "References:\n"
            : "Referencias:\n";
        const refFormat = { italic: true, color: "#6b728b" };

        if (range && range.length > 0) {
          // Si hay texto seleccionado: aplicar formato de referencia al texto seleccionado
          q.formatText(range.index, range.length, refFormat);
          q.setSelection(range.index + range.length, 0);
        } else {
          // Sin selección: insertar etiqueta "Referencias:" con formato
          const idx = range.index;
          q.insertText(idx, refLabel);
          q.formatText(idx, refLabel.length - 1, refFormat);
          q.insertText(idx + refLabel.length, "\n");
          // Activar formato para el texto que se escriba o pegue a continuación
          q.format("italic", true);
          q.format("color", "#6b728b");
          q.setSelection(idx + refLabel.length + 1, 0);
        }
      }
      break;

    case "undo":
      if (q.history) q.history.undo();
      break;
    case "redo":
      if (q.history) q.history.redo();
      break;
  }

  updateToolbarActive(q, range);
}

function toggleHeaderQ(q, range, level) {
  const current = q.getFormat(range.index, Math.max(range.length, 1)).header;
  q.formatLine(
    range.index,
    range.length,
    "header",
    current === level ? false : level,
  );
}

function toggleListQ(q, range, type) {
  const current = q.getFormat(range.index, Math.max(range.length, 1)).list;
  q.formatLine(
    range.index,
    range.length,
    "list",
    current === type ? false : type,
  );
}

function updateToolbarActive(q, range) {
  const ids = [
    "btn-bold",
    "btn-italic",
    "btn-strike",
    "btn-code",
    "btn-blockquote",
    "btn-code-block",
    "btn-bullet",
    "btn-ordered",
    "btn-header1",
    "btn-header2",
    "btn-header3",
  ];
  function setOn(id, on) {
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle("active", !!on);
  }
  if (!range) {
    ids.forEach(function (id) {
      setOn(id, false);
    });
    return;
  }
  let fmt = {};
  try {
    fmt = q.getFormat(range.index, Math.max(range.length, 1)) || {};
  } catch (e) {
    fmt = {};
  }
  setOn("btn-bold", !!fmt.bold);
  setOn("btn-italic", !!fmt.italic);
  setOn("btn-strike", !!fmt.strike);
  setOn("btn-code", !!fmt.code);
  setOn("btn-blockquote", !!fmt.blockquote);
  setOn("btn-code-block", !!fmt["code-block"]);
  setOn("btn-bullet", fmt.list === "bullet");
  setOn("btn-ordered", fmt.list === "ordered");
  const h = fmt.header;
  setOn("btn-header1", h === 1);
  setOn("btn-header2", h === 2);
  setOn("btn-header3", h === 3);
}

async function insertImageQ(q, range) {
  const r = await Swal.fire({
    title: idiomaActual === "es" ? "Insertar imagen" : "Insert image",
    input: "text",
    inputPlaceholder: "https://...",
    showCancelButton: true,
    confirmButtonText: idiomaActual === "es" ? "Insertar" : "Insert",
    cancelButtonText: idiomaActual === "es" ? "Cancelar" : "Cancel",
    customClass: { popup: "swal-smart-popup" },
  });
  if (!r.isConfirmed) return;

  const src = r.value;
  if (!src) return;

  var rng = range || q.getSelection(true) || { index: 0, length: 0 };
  var insertIdx = rng.index;
  q.insertEmbed(insertIdx, "image", src);

  /* Aplicar ancho por defecto a la imagen insertada */
  // Use requestAnimationFrame for better timing with Quill 1.3.6
  requestAnimationFrame(function () {
    var imgs = q.root.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img.getAttribute("width") && !img.style.width) {
        img.setAttribute("width", "200");
        img.style.width = "200px";
      }
    }
    // Update the width input to show the default value
    if (quillImgWidthEl) {
      quillImgWidthEl.value = "200";
    }
  });

  q.setSelection(insertIdx, 1);
}

function getHTMLPregunta() {
  if (!quillEditor) return "";
  try {
    return quillEditor.root.innerHTML;
  } catch (e) {
    return "";
  }
}

function isEmptyPregunta() {
  if (!quillEditor) return true;
  try {
    const t = quillEditor.getText().trim();
    return t === "" || t === "\n";
  } catch (e) {
    return true;
  }
}

function clearPreguntaQuill() {
  if (!quillEditor) return;
  try {
    quillEditor.setText("");
  } catch (e) {}
}

window.initQuillEditor = initQuillEditor;
window.qCmd = qCmd;
window.getHTMLPregunta = getHTMLPregunta;
window.isEmptyPregunta = isEmptyPregunta;
window.clearPreguntaQuill = clearPreguntaQuill;
