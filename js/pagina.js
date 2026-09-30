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
            <!-- HEADER -->
            <header class="header">
                <div class="left">
                <a href="index.html">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                    </a>
                    <h2>APRENDER ENGANCHA,<br>GANAR TE IMPULSA</h2>
                </div>
                <div class="buttons" id="authButtons"></div>
            </header>

            <!-- TARJETAS -->
            <section class="cards">
                <a href="preguntas.html?materia=matematicas" class="card">
                    <img src="img/chart.png" alt="Matemáticas">
                    <h3>Matemáticas</h3>
                </a>
                <a href="preguntas.html?materia=lectura_critica" class="card">
                    <img src="img/chart (1).png" alt="Lectura Crítica">
                    <h3>Lectura Crítica</h3>
                </a>
                <a href="preguntas.html?materia=ingles" class="card">
                    <img src="img/chart (2).png" alt="Inglés">
                    <h3>Inglés</h3>
                </a>
                <a href="preguntas.html?materia=ciencias_naturales" class="card">
                    <img src="img/chart (3).png" alt="Ciencias Naturales">
                    <h3>Ciencias Naturales</h3>
                </a>
                <a href="preguntas.html?materia=ciencias_sociales" class="card">
                    <img src="img/chart (4).png" alt="Ciencias Sociales">
                    <h3>Ciencias Sociales</h3>
                </a>
            </section>

            <!-- FOOTER -->
            <footer>
                <div class="footer-content">
                    <h3>SMART TEST  © 2026</h3>
                    <span class="footer-separator">•</span>
                    <a href="politica.html" class="footer-link">Términos y Condiciones</a>
                </div>
            </footer>
        `;
  } else if (idioma === "en") {
    contenedor.innerHTML = `
            <!-- HEADER -->
            <header class="header">
                <div class="left">
                <a href="index.html">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-circular">
                    </a>
                    <h2>LEARNING IS ENGAGING,<br>WINNING DRIVES YOU</h2>
                </div>
                <div class="buttons" id="authButtons"></div>
            </header>

            <!-- CARDS -->
            <section class="cards">
                <a href="preguntas.html?materia=matematicas" class="card">
                    <img src="img/chart.png" alt="Mathematics">
                    <h3>Mathematics</h3>
                </a>
                <a href="preguntas.html?materia=lectura_critica" class="card">
                    <img src="img/chart (1).png" alt="Critical Reading">
                    <h3>Critical Reading</h3>
                </a>
                <a href="preguntas.html?materia=ingles" class="card">
                    <img src="img/chart (2).png" alt="English">
                    <h3>English</h3>
                </a>
                <a href="preguntas.html?materia=ciencias_naturales" class="card">
                    <img src="img/chart (3).png" alt="Natural Sciences">
                    <h3>Natural Sciences</h3>
                </a>
                <a href="preguntas.html?materia=ciencias_sociales" class="card">
                    <img src="img/chart (4).png" alt="Social Sciences">
                    <h3>Social Sciences</h3>
                </a>
            </section>

            <!-- FOOTER -->
            <footer>
                <div class="footer-content">
                    <h3>SMART TEST  © 2026</h3>
                    <span class="footer-separator">•</span>
                    <a href="politica.html" class="footer-link">Terms and Conditions</a>
                </div>
            </footer>
        `;
  }
}

/* renderAuthButtons y obtenerNombreUsuario están centralizados en auth.js
   para que todas las páginas muestren el nombre completo (window.SRT.nombre)
   de forma consistente y con soporte de idioma. */

function cerrarSesion() {
  localStorage.removeItem("nombre");
  localStorage.removeItem("documento");

  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("idiomaToggle");
  if (toggle) {
    toggle.checked = idiomaActual === "en";
  }
  actualizarBotonIdioma();
  cargarContenido(idiomaActual);
  renderAuthButtons();
});
