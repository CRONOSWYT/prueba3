(function () {
  window.SRT = { nombre: "", documento: "", correo: "", avatar: "", rol: "estudiante", ready: false };

  /* ===== Helper global de avatares =====
     - foto por URL (con fallback a iniciales si la URL falla)
     - iniciales con color aleatorio cuando no hay foto
     Usado por ranking, index y la bienvenida. ===== */
  function _escAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var _PALETTE_AVATAR = [
    "#1bb3a7", "#0b3556", "#14b8a8", "#2563eb",
    "#7c3aed", "#dc2626", "#ea580c", "#ca8a04",
  ];

  function _colorPara(nombre) {
    nombre = nombre || "";
    var hash = 0;
    for (var i = 0; i < nombre.length; i++) {
      hash = (hash * 31 + nombre.charCodeAt(i)) | 0;
    }
    if (hash < 0) hash = -hash;
    return _PALETTE_AVATAR[hash % _PALETTE_AVATAR.length];
  }

  function _inicialesDe(nombre) {
    nombre = (nombre || "").trim();
    if (!nombre) return "U";
    var partes = nombre.split(/\s+/).filter(Boolean).slice(0, 2);
    var ini = partes.map(function (p) {
      return p.charAt(0).toUpperCase();
    }).join("");
    return ini || nombre.charAt(0).toUpperCase() || "U";
  }

  /* <div> con iniciales + color de fondo (usado como fallback) */
  window.avatarDiv = function (nombre, cls) {
    cls = cls || "user-avatar";
    var iniciales = _inicialesDe(nombre);
    var color = _colorPara(nombre);
    return (
      '<div class="' + cls + ' avatar-inicial" style="background:' + color +
      '" title="' + _escAttr(nombre || "") + '">' + _escAttr(iniciales) + "</div>"
    );
  };

  /* Reemplaza una <img> rota por el avatar de iniciales */
  window.avatarImgError = function (img) {
    var nombre = img.getAttribute("data-fallback-nombre") || "U";
    var cls = img.getAttribute("data-fallback-cls") || "user-avatar";
    img.outerHTML = window.avatarDiv(nombre, cls);
  };

  /* Renderiza un avatar: <img> si hay URL, <div> de iniciales si no.
     Si la URL falla al cargar, se sustituye por iniciales. */
  window.avatarTag = function (nombre, url, cls) {
    cls = cls || "user-avatar";
    var src = (url && String(url).trim()) || "";
    if (src) {
      return (
        '<img class="' + cls + '" src="' + _escAttr(src) +
        '" alt="' + _escAttr(nombre || "") +
        '" data-fallback-nombre="' + _escAttr(nombre || "") +
        '" data-fallback-cls="' + _escAttr(cls) +
        '" onerror="window.avatarImgError(this)">'
      );
    }
    return window.avatarDiv(nombre, cls);
  };

  window.showSmartConfirm = function (title, html, icon) {
    if (icon === undefined) icon = "warning";
    return Swal.fire({
      title: title,
      html: html,
      icon: icon,
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, continuar",
      customClass: {
        popup: "swal-smart-popup",
        title: "swal-smart-title",
        confirmButton: "swal-smart-confirm",
      },
    });
  };

  var readyCbs = [];
  window.srtOnReady = function (cb) {
    if (window.SRT.ready) { cb(); return; }
    readyCbs.push(cb);
  };
  function fireReady() {
    window.SRT.ready = true;
    readyCbs.forEach(function (cb) { try { cb(); } catch (e) {} });
    readyCbs = [];
    try { window.dispatchEvent(new window.CustomEvent("srt:ready")); } catch (e) {}
  }

  function idiomaEs() {
    if (typeof idiomaActual !== "undefined" && idiomaActual === "en") return false;
    var guardado = localStorage.getItem("idiomaSeleccionado");
    return !(guardado === "en");
  }

  function limpiarStorage() {
    var nombre = localStorage.getItem("nombre");
    var documento = localStorage.getItem("documento");
    var idioma = localStorage.getItem("idiomaSeleccionado");
    localStorage.clear();
    if (nombre !== null) localStorage.setItem("nombre", nombre);
    if (documento !== null) localStorage.setItem("documento", documento);
    if (idioma !== null) localStorage.setItem("idiomaSeleccionado", idioma);
  }

  function fetchRol() {
    var doc = localStorage.getItem("documento");
    window.SRT.documento = doc || "";
    if (!doc) {
      window.SRT.nombre = "";
      window.SRT.rol = "estudiante";
      fireReady();
      return;
    }
    fetch("php/admin_datos.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "verificar_rol", documento: doc }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          window.SRT.nombre = localStorage.getItem("nombre") || d.nombre || "";
          window.SRT.rol = d.rol || "estudiante";
          window.SRT.correo = d.correo || "";
          window.SRT.avatar = d.avatar_url || "";
        } else {
          window.SRT.rol = "estudiante";
          window.SRT.correo = "";
          window.SRT.avatar = "";
        }
      })
      .catch(function () { window.SRT.rol = "estudiante"; })
      .then(function () { fireReady(); });
  }

  if (typeof window.renderAuthButtons !== "function") {
    window.renderAuthButtons = function () {
      var authDiv = document.getElementById("authButtons");
      if (!authDiv) return;
      var nombre = (window.SRT && window.SRT.nombre) || "";

      /* Toggle hero login button visibility based on auth state (index page) */
      var heroLoginBtn = document.getElementById("heroLoginBtn");
      if (heroLoginBtn) {
        heroLoginBtn.style.display = nombre ? "none" : "";
      }

      if (!nombre) {
        authDiv.innerHTML = idiomaEs()
          ? '<a href="login.html" class="btn btn-primary">Iniciar Sesión</a><a href="login.html?form=registro" class="btn btn-outline">Registrarse</a>'
          : '<a href="login.html" class="btn btn-primary">Log in</a><a href="login.html?form=registro" class="btn btn-outline">Register</a>';
        return;
      }
      var avatar = (window.SRT && window.SRT.avatar) || "";
      authDiv.innerHTML = '<span class="welcome">' +
        window.avatarTag(nombre, avatar, "welcome-avatar") +
        (idiomaEs() ? " Bienvenido, " : " Welcome, ") + nombre +
        "</span>";
    };
  }
  if (typeof window.cerrarSesion !== "function") {
    window.cerrarSesion = function () {
      localStorage.clear();
      window.location.href = "login.html";
    };
  }

  function itemsFor() {
    var nombre = (window.SRT && window.SRT.nombre) || "";
    var rol = (window.SRT && window.SRT.rol) || "estudiante";
    if (!nombre) {
      return [
        { es: "Ranking", en: "Ranking", action: "accionRanking", icon: "trophy" },
        { es: "Iniciar sesión", en: "Log in", action: "accionLogin", icon: "right-to-bracket" },
        { es: "Registrarse", en: "Register", action: "accionRegistro", icon: "user-plus" },
      ];
    }
    var out = [
      { es: "Volver", en: "Back", action: "accionVolver", icon: "arrow-left" },
      { es: "Ranking", en: "Ranking", action: "accionRanking", icon: "trophy" },
      { es: "Historial", en: "History", action: "accionHistorial", icon: "clock" },
      { es: "Configuración", en: "Settings", action: "accionConfiguracion", icon: "sliders" },
    ];
    if (rol === "admin") out.push({ es: "Panel de admin", en: "Admin panel", action: "accionPanelAdmin", icon: "user-shield" });
    out.push({ es: "Cerrar sesión", en: "Sign out", action: "accionCerrarSesion", red: true, icon: "right-from-bracket" });
    return out;
  }

  window.renderCogWidget = function () {
    var menu = document.getElementById("srtCogMenu");
    if (!menu) return;
    var ix = idiomaEs() ? "es" : "en";
    var items = itemsFor();
    menu.innerHTML = items.map(function (it) {
      var c = "srt-item" + (it.red ? " srt-logout" : "");
      return '<button type="button" class="' + c + '" role="menuitem" onclick="cogItemClick(\'' + it.action + '\')">' +
        '<i class="fa-solid fa-' + it.icon + '" aria-hidden="true"></i> ' + it[ix] + "</button>";
    }).join("");
    var btn = document.getElementById("srtCogBtn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  };

  window.toggleCogWidget = function () {
    var m = document.getElementById("srtCogMenu");
    if (!m) return;
    var abierto = m.classList.toggle("srt-open");
    var b = document.getElementById("srtCogBtn");
    if (b) b.setAttribute("aria-expanded", abierto ? "true" : "false");
  };
  window.closeCogWidget = function () {
    var m = document.getElementById("srtCogMenu");
    if (m) m.classList.remove("srt-open");
    var b = document.getElementById("srtCogBtn");
    if (b) b.setAttribute("aria-expanded", "false");
  };

  window.cogItemClick = function (action) {
    closeCogWidget();
    switch (action) {
      case "accionVolver": window.history.back(); break;
      case "accionCerrarSesion": window.accionCerrarSesion(); break;
      case "accionRanking": window.accionRanking(); break;
      case "accionHistorial": window.accionHistorial(); break;
      case "accionPanelAdmin": window.accionPanelAdmin(); break;
      case "accionConfiguracion": window.accionConfiguracion(); break;
      case "accionLogin": window.location.href = "login.html"; break;
      case "accionRegistro": window.location.href = "login.html?form=registro"; break;
    }
  };

  window.accionCerrarSesion = function () {
    var es = idiomaEs();
    window.showSmartConfirm(
      es ? "¿Cerrar sesión?" : "Sign out?",
      es ? "¿Estás seguro que deseas cerrar tu sesión?" : "Are you sure you want to sign out?",
    ).then(function (r) { if (r.isConfirmed) window.cerrarSesion(); });
  };
  window.accionRanking = function () {

    if (window.location.pathname.endsWith("ranking.html")) {
      if (typeof window.cargarRanking === "function") window.cargarRanking();
      return;
    }
    window.location.href = "ranking.html";
  };
  window.accionHistorial = function () {

    if (window.location.pathname.endsWith("historial.html")) {
      if (typeof window.cargarHistorial === "function") window.cargarHistorial();
      return;
    }
    window.location.href = "historial.html";
  };
  window.accionPanelAdmin = function () {
    var es = idiomaEs();
    window.showSmartConfirm(
      es ? "¿Ir al panel de administración?" : "Go to admin panel?",
      es ? "Serás dirigido al panel de administración." : "You will be redirected to the admin panel.",
    ).then(function (r) { if (r.isConfirmed) window.location.href = "admins.html"; });
  };

  function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function cfgLabel(esTx, enTx, forId) {
    return '<label class="cfg-label" for="' + forId + '">' + (idiomaEs() ? esTx : enTx) + "</label>";
  }

  window.accionConfiguracion = function () {
    var es = idiomaEs();
    var srt = window.SRT || {};

    var html =
      '<div class="cfg-form">' +
      '  <div class="cfg-col">' +
      cfgLabel("Nombre de usuario", "Username", "cfgNombre") +
      '<input id="cfgNombre" class="swal2-input cfg-input" type="text" value="' + escHtml(srt.nombre || "") + '">' +
      cfgLabel("Documento", "ID number", "cfgDocumento") +
      '<input id="cfgDocumento" class="swal2-input cfg-input" type="number" value="' + escHtml(srt.documento || "") + '">' +
      cfgLabel("Correo", "Email", "cfgCorreo") +
      '<input id="cfgCorreo" class="swal2-input cfg-input" type="email" value="' + escHtml(srt.correo || "") + '">' +
      cfgLabel("Nueva contraseña (opcional)", "New password (optional)", "cfgPassword") +
      '<input id="cfgPassword" class="swal2-input cfg-input" type="password" value="">' +
      "  </div>" +
      '  <div class="cfg-col cfg-cta">' +
      cfgLabel("Foto de perfil", "Profile image", "cfgAvatar") +
      '<input id="cfgAvatar" class="swal2-input cfg-input" type="text" value="' + escHtml(srt.avatar || "") + '" placeholder="https://ejemplo.com/avatar.png">' +
      '<div class="cfg-hint">' + (es ? "Pega la URL de tu foto. Si la dejas vacía, usarás tus iniciales." : "Paste your photo URL. Leave empty to use your initials.") + '</div>' +
      '<div class="cfg-avatar-preview" id="cfgAvatarPreview">' +
      '  <div class="cfg-preview-label">' + (es ? "Previsualización" : "Preview") + "</div>" +
      '  <div class="cfg-preview-circle">' +
      window.avatarTag(srt.nombre, srt.avatar, "cfg-avatar-preview-img") +
      "  </div>" +
      "</div>" +
      "  </div>" +
      "</div>";

    Swal.fire({
      title: es ? "Configuración de la cuenta" : "Account settings",
      html: html,
      width: 640,
      showCancelButton: true,
      confirmButtonText: es ? "Guardar cambios" : "Save changes",
      cancelButtonText: es ? "Cancelar" : "Cancel",
      customClass: {
        popup: "swal-smart-popup",
        title: "swal-smart-title",
        confirmButton: "swal-smart-confirm",
      },
      didOpen: function () {
        /* Previsualizar el avatar en vivo al escribir la URL o el nombre */
        var urlInput = document.getElementById("cfgAvatar");
        var nameInput = document.getElementById("cfgNombre");
        var circle = document.querySelector("#cfgAvatarPreview .cfg-preview-circle");
        function refreshPreview() {
          if (!circle) return;
          var url = urlInput ? urlInput.value.trim() : "";
          var nombre = (nameInput && nameInput.value.trim()) || srt.nombre || "";
          circle.innerHTML = window.avatarTag(nombre, url, "cfg-avatar-preview-img");
        }
        if (urlInput) urlInput.addEventListener("input", refreshPreview);
        if (nameInput) nameInput.addEventListener("input", refreshPreview);
      },
      preConfirm: function () {
        var v = {
          nombre: document.getElementById("cfgNombre").value.trim(),
          documento: document.getElementById("cfgDocumento").value.trim(),
          correo: document.getElementById("cfgCorreo").value.trim(),
          password: document.getElementById("cfgPassword").value,
          avatar: document.getElementById("cfgAvatar").value.trim(),
        };
        if (!v.nombre || !v.documento || !v.correo) {
          Swal.showValidationMessage(
            es ? "Completa nombre, documento y correo." : "Fill in name, ID and email."
          );
          return null;
        }
        return fetch("php/admin_datos.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "actualizar_perfil",
            documento_actual: srt.documento || v.documento,
            nombre_usuario: v.nombre,
            documento: v.documento,
            correo: v.correo,
            password: v.password,
            avatar_url: v.avatar,
          }),
        })
          .then(function (r) { return r.json(); })
          .catch(function (err) {
            return {
              ok: false,
              mensaje: (err && err.message) || (es ? "Error de conexión." : "Connection error."),
            };
          });
      },
    }).then(function (r) {
      if (!r.isConfirmed) return;
      var d = r.value;
      if (!d || !d.ok) {
        Swal.fire({
          icon: "error",
          title: es ? "Error" : "Error",
          text: (d && d.mensaje) || (es ? "No se pudo guardar." : "Could not save."),
          confirmButtonText: es ? "Aceptar" : "OK",
          customClass: { popup: "swal-smart-popup" },
        });
        return;
      }

      /* Actualizar estado del usuario en cliente */
      if (d.nombre) localStorage.setItem("nombre", d.nombre);
      if (d.documento) localStorage.setItem("documento", d.documento);
      window.SRT.nombre = d.nombre || srt.nombre;
      window.SRT.documento = d.documento || srt.documento;
      window.SRT.correo = d.correo || "";
      window.SRT.avatar = d.avatar_url || "";
      if (typeof window.renderAuthButtons === "function") window.renderAuthButtons();

      Swal.fire({
        icon: "success",
        title: es ? "Guardado" : "Saved",
        text: d.mensaje || (es ? "Cambios guardados." : "Changes saved."),
        confirmButtonText: es ? "Aceptar" : "OK",
        customClass: { popup: "swal-smart-popup" },
      });
    });
  };

  document.addEventListener("click", function (e) {
    var wrap = document.getElementById("srtCog");
    var menu = document.getElementById("srtCogMenu");
    if (wrap && menu && menu.classList.contains("srt-open") && !wrap.contains(e.target)) {
      closeCogWidget();
    }
  });

  function init() {
    limpiarStorage();
    document.addEventListener("DOMContentLoaded", function () {
      srtOnReady(function () { renderCogWidget(); });
      srtOnReady(function () {
        if (typeof window.renderAuthButtons === "function") window.renderAuthButtons();
      });
    });
    fetchRol();
  }

  init();
})();
