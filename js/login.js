const API_BASE = "php";

let idiomaActual = localStorage.getItem("idiomaSeleccionado") || "es";

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

  if (idioma === "es") {
    contenedor.innerHTML = `
            <form>
                <!-- REGISTRO -->
                <div class="formulario" id="rF">
                <a href="index.html" alt="Volver al inicio">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                    </a>
                    <h2>Registro</h2>
                    <div class="input-group">
                        <input type="text" id="rDI" inputmode="numeric" placeholder="Documento de Identidad" class="input-documento">
                    </div>
                    <input type="text" id="rN" placeholder="Nombre" required>
                    <input type="email" id="rU" placeholder="Correo" required>
                    <input type="password" id="rP" placeholder="Contraseña" required>
                    <select id="grado" required onchange="verificarGrado(this)">
                        <option value="">Seleccione su grado</option>
                        <option value="6">6°</option>
                        <option value="7">7°</option>
                        <option value="8">8°</option>
                        <option value="9">9°</option>
                        <option value="10">10°</option>
                        <option value="11">11°</option>
                    </select>
                    <button type="button" class="bn" onclick="registrar()">Registrar</button>
                    <div class="link" onclick="mostrarLogin()">¿Ya tienes cuenta? Haz clic aquí para iniciar sesión</div>
                </div>

                <!-- LOGIN -->
                <div class="formulario hidden" id="lF">
                <a href="index.html" alt="Volver al inicio">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                    </a>
                    <h2>Iniciar Sesión</h2>
                    <input type="email" id="lu" placeholder="Correo" required>
                    <input type="password" id="lP" placeholder="Contraseña" required>
                    <div class="link-recuperar" onclick="mostrarecuperar()">Recuperar contraseña</div>
                    <button type="button" onclick="login()">Entrar</button>
                    <div class="link" onclick="mostrarRegistro()">¿No tienes cuenta? Haz clic aquí para registrarte</div>
                </div>

                <!-- RECUPERAR -->
                <div class="formulario hidden" id="recF">
                <a href="index.html" alt="Volver al inicio">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                    </a>
                    <h2>Recuperar Contraseña</h2>
                    <div class="input-group">
                        <input type="text" id="recDI" inputmode="numeric" placeholder="Documento de Identidad" class="input-documento">
                    </div>
                    <input type="email" id="recU" placeholder="Correo" required>
                    <input type="password" id="recP" placeholder="Nueva Contraseña" required>
                    <button type="button" onclick="recuperar()">Actualizar Contraseña</button>
                    <div class="link" onclick="mostrarLogin()">¿Recordaste tu contraseña? Iniciar sesión</div>
                </div>

                <div id="mensaje"></div>
            </form>
        `;
  } else if (idioma === "en") {
    contenedor.innerHTML = `
            <form>
                <!-- REGISTER -->
                <div class="formulario" id="rF">
                <a href="index.html" alt="Volver al inicio">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                    </a>
                    <h2>Register</h2>
                    <div class="input-group">
                        <input type="text" id="rDI" inputmode="numeric" placeholder="ID number" class="input-documento">
                    </div>
                    <input type="text" id="rN" placeholder="Name" required>
                    <input type="email" id="rU" placeholder="Email" required>
                    <input type="password" id="rP" placeholder="Password" required>
                    <select id="grado" required onchange="verificarGrado(this)">
                        <option value="">Select your grade</option>
                        <option value="6">6th</option>
                        <option value="7">7th</option>
                        <option value="8">8th</option>
                        <option value="9">9th</option>
                        <option value="10">10th</option>
                        <option value="11">11th</option>
                    </select>
                    <button type="button" class="bn" onclick="registrar()">Register</button>
                    <div class="link" onclick="mostrarLogin()">Already have an account? Click here to log in</div>
                </div>

                <!-- LOGIN -->
                <div class="formulario hidden" id="lF">
                <a href="index.html" alt="Volver al inicio">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                    </a>
                    <h2>Log in</h2>
                    <input type="email" id="lu" placeholder="Email" required>
                    <input type="password" id="lP" placeholder="Password" required>
                    <div class="link-recuperar" onclick="mostrarecuperar()">Recover password</div>
                    <button type="button" onclick="login()">Enter</button>
                    <div class="link" onclick="mostrarRegistro()">Don't have an account? Click here to register</div>
                </div>

                <!-- RECOVER -->
                <div class="formulario hidden" id="recF">
                <a href="index.html" alt="Volver al inicio">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                    </a>
                    <h2>Recover Password</h2>
                    <div class="input-group">
                        <input type="text" id="recDI" inputmode="numeric" placeholder="ID number" class="input-documento">
                    </div>
                    <input type="email" id="recU" placeholder="Email" required>
                    <input type="password" id="recP" placeholder="New Password" required>
                    <button type="button" onclick="recuperar()">Update Password</button>
                    <div class="link" onclick="mostrarLogin()">Remembered your password? Log in</div>
                </div>

                <div id="mensaje"></div>
            </form>
        `;
  }
}

function mostrarLogin() {
  document.getElementById("rF").classList.add("hidden");
  document.getElementById("recF").classList.add("hidden");
  document.getElementById("lF").classList.remove("hidden");
  clearMessage();
}

function mostrarRegistro() {
  document.getElementById("lF").classList.add("hidden");
  document.getElementById("recF").classList.add("hidden");
  document.getElementById("rF").classList.remove("hidden");
  clearMessage();
}

function mostrarecuperar() {
  document.getElementById("rF").classList.add("hidden");
  document.getElementById("lF").classList.add("hidden");
  document.getElementById("recF").classList.remove("hidden");
  clearMessage();
}

function verificarGrado(select) {
  const grado = parseInt(select.value, 10);

  if (grado >= 6 && grado <= 10) {
    const es = idiomaActual === "es";
    const gradoNombresEs = ["6°", "7°", "8°", "9°", "10°"];
    const gradoNombresEn = ["6th", "7th", "8th", "9th", "10th"];
    const gradoNombre = es
      ? gradoNombresEs[grado - 6]
      : gradoNombresEn[grado - 6];
    Swal.fire({
      title: es ? "Sistema en construcción" : "System under construction",
      html: es
        ? `El sistema aún no está disponible para el <strong>${gradoNombre}</strong>.<br><br>Estamos construyendo el sistema para los grados <strong>6° al 10°</strong>.<br>Por ahora solo se permite el registro para <strong>11°</strong>.`
        : `The system is not yet available for <strong>${gradoNombre}</strong>.<br><br>We are building the system for grades <strong>6th through 10th</strong>.<br>Registration is currently only available for <strong>11th grade</strong>.`,
      icon: "info",
      confirmButtonText: es ? "Entendido" : "Got it",
      customClass: {
        popup: "swal-smart-popup",
        title: "swal-smart-title",
        confirmButton: "swal-smart-confirm",
      },
    });

    select.value = "";
  }
}

async function registrar() {
  clearMessage();
  const documento = document.getElementById("rDI").value.trim();
  const nombre = document.getElementById("rN").value.trim();
  const correo = document.getElementById("rU").value.trim();
  const contrasena = document.getElementById("rP").value.trim();
  const grado = parseInt(document.getElementById("grado").value, 10);

  if (!documento || !nombre || !correo || !contrasena || !grado) {
    showMessage(
      idiomaActual === "es"
        ? "Por favor, completa todos los campos requeridos antes de continuar."
        : "Please fill in all required fields before continuing.",
    );
    return;
  }

  if (!/^\d+$/.test(documento)) {
    showMessage(
      idiomaActual === "es"
        ? "El documento debe contener solo números."
        : "The ID number must contain only digits.",
    );
    return;
  }

  if (grado >= 6 && grado <= 10) {
    verificarGrado(document.getElementById("grado"));
    return;
  }

  await enviarFormulario(
    "registro.php",
    { documento, nombre, correo, contrasena, grado },
    function (respuesta) {
      showMessage(respuesta.mensaje, "green");
      ["rDI", "rN", "rU", "rP", "grado"].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      mostrarLogin();
    },
  );
}

async function login() {
  clearMessage();
  const correo = document.getElementById("lu").value.trim();
  const contrasena = document.getElementById("lP").value;

  if (!correo || !contrasena) {
    showMessage(
      idiomaActual === "es"
        ? "Por favor, ingresa tu correo y contraseña."
        : "Please enter your email and password.",
    );
    return;
  }

  await enviarFormulario(
    "login.php",
    { correo, contrasena },
    function (respuesta) {
      localStorage.setItem("nombre", respuesta.usuario.nombre || "Usuario");
      localStorage.setItem("documento", String(respuesta.usuario.documento));

      window.location.href = "pagina.html";
    },
  );
}

async function recuperar() {
  clearMessage();
  const documento = document.getElementById("recDI").value.trim();
  const correo = document.getElementById("recU").value.trim();
  const nuevaPassword = document.getElementById("recP").value.trim();

  if (!documento || !correo || !nuevaPassword) {
    showMessage(
      idiomaActual === "es"
        ? "Por favor, completa todos los campos requeridos."
        : "Please fill in all required fields.",
    );
    return;
  }

  if (!/^\d+$/.test(documento)) {
    showMessage(
      idiomaActual === "es"
        ? "El documento debe contener solo números."
        : "The ID number must contain only digits.",
    );
    return;
  }

  await enviarFormulario(
    "recuperar.php",
    { documento, correo, nueva_password: nuevaPassword },
    function (respuesta) {
      showMessage(respuesta.mensaje, "green");
      document.getElementById("recDI").value = "";
      document.getElementById("recU").value = "";
      document.getElementById("recP").value = "";
      setTimeout(function () {
        Swal.close();
        mostrarLogin();
      }, 2000);
    },
  );
}

async function enviarFormulario(endpoint, datos, alCompletar) {
  try {
    const respuesta = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const textoRespuesta = await respuesta.text();
    let resultado;
    try {
      resultado = textoRespuesta ? JSON.parse(textoRespuesta) : {};
    } catch (error) {
      console.error("Respuesta inválida del servidor:", textoRespuesta);
      showMessage(
        idiomaActual === "es"
          ? "El servidor devolvió una respuesta inesperada. Por favor, intenta de nuevo más tarde."
          : "The server returned an unexpected response. Please try again later.",
      );
      return;
    }
    if (!respuesta.ok || !resultado.ok) {
      const mensajePredeterminado =
        endpoint === "registro.php"
          ? idiomaActual === "es"
            ? "No se pudo registrar el usuario. Verifica los datos e inténtalo de nuevo."
            : "Could not register the user. Please check the data and try again."
          : idiomaActual === "es"
            ? "Error en la solicitud. Por favor, inténtalo más tarde."
            : "Error in the request. Please try again later.";
      showMessage(resultado.mensaje || mensajePredeterminado);
      return;
    }
    alCompletar(resultado);
  } catch (error) {
    console.error("Error de comunicación con PHP:", error);
    showMessage(
      idiomaActual === "es"
        ? "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo."
        : "Could not connect to the server. Check your connection and try again.",
    );
  }
}

function showMessage(text, color = "error") {
  let iconType = "error";
  if (color === "green") {
    iconType = "success";
  }
  Swal.fire({
    html: text,
    icon: iconType,
    confirmButtonText: "OK",
    customClass: {
      popup: "swal-smart-popup",
      title: "swal-smart-title",
      confirmButton: "swal-smart-confirm",
    },
  });
}

function clearMessage() {
  Swal.close();
}

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("idiomaToggle");
  if (toggle) {
    toggle.checked = idiomaActual === "en";
  }

  cargarContenido(idiomaActual);

  const params = new URLSearchParams(window.location.search);
  const form = params.get("form");
  if (form === "registro") {
    mostrarRegistro();
  } else {
    mostrarLogin();
  }
});
