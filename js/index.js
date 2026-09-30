let idiomaActual = localStorage.getItem("idiomaSeleccionado") || "es";

function alternarIdioma() {
  const toggle = document.getElementById("idiomaToggle");
  idiomaActual = toggle && toggle.checked ? "en" : "es";

  localStorage.setItem("idiomaSeleccionado", idiomaActual);

  actualizarBotonIdioma();
  cargarContenido(idiomaActual);
  cargarEquipo();
  if (typeof renderAuthButtons === "function") {
    renderAuthButtons();
  }
  setTimeout(cargarRankingPreview, 50);
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
                <div class="header-left">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-check">
                    <h2>APRENDER ENGANCHA,<br>GANAR TE IMPULSA</h2>
                </div>
                <div class="header-buttons" id="authButtons"></div>
            </header>

            <!-- HERO -->
            <section class="hero">
                <div class="hero-content">
                    <div class="hero-text">
                        <h1>SMART TEST </h1>
                        <p class="hero-subtitle">Plataforma 100% gratuita para practicar preguntas tipo ICFES y mejorar su rendimiento.</p>
                        <div class="hero-buttons">
                            <a href="pagina.html" class="btn btn-hero">Empezar</a>
                            <a href="login.html" class="btn btn-hero-outline" id="heroLoginBtn">Iniciar Sesión</a>
                        </div>
                    </div>
                    <div class="hero-icon">
                        <img src="img/LOGO_SMART_TEST.png" alt="Gráfico de resultados" class="chart-img">
                    </div>
                </div>
            </section>

            <!-- RANKING PREVIEW -->
            <section class="ranking-preview section">
                <div class="section-content">
                    <div id="rankingPreviewContainer" class="ranking-preview-cards">
                        <p class="ranking-loading">Cargando ranking...</p>
                    </div>
                </div>
            </section>

            <!-- ¿QUÉ ES SMART TEST ? -->
            <section class="about section">
                <div class="about-container">
                    <div class="about-text">
                        <h2>¿QUÉ ES SMART TEST ?</h2>
                        <p>SMART TEST  es una plataforma web 100 % gratuita para practicar preguntas tipo ICFES. Almacenamos los datos de forma segura para ayudar a los usuarios en sus exámenes académicos. Tu identidad y tus datos serán utilizados para monitorear tu progreso individual de estudio.</p>
                    </div>
                </div>
            </section>

            <!-- EL PROBLEMA Y NUESTRA SOLUCIÓN -->
            <section class="problem-solution section">
                <div class="problem-solution-container">
                    <div class="problem">
                        <h2>EL PROBLEMA</h2>
                        <ul class="bullet-list">
                            <li>Falta de acceso a simulacros y a preguntas tipo ICFES.</li>
                            <li>Dificultad para practicar de forma recurrente.</li>
                            <li>Pocas retroalimentaciones inmediatas sobre las respuestas.</li>
                            <li>Escasez de plataformas adaptadas y gratuitas para estudiantes.</li>
                        </ul>
                    </div>
                    <div class="solution">
                        <h2>NUESTRA SOLUCIÓN</h2>
                        <ul class="bullet-list">
                            <li>Acceso rápido y gratuito a ejercicios tipo ICFES.</li>
                            <li>Práctica constante desde cualquier dispositivo con internet y navegador.</li>
                            <li>Evaluación inmediata de respuestas.</li>
                            <li>Sin costo para preparar el examen de Estado de Educación Media.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- NUESTRO FACTOR DIFERENCIAL -->
            <section class="factor section">
                <div class="section-content">
                    <h2>NUESTRO FACTOR DIFERENCIAL</h2>
                    <p>Lo que nos diferencia es la frecuencia del estudio para las Pruebas Saber 11, este diseño se visualiza como material didáctico adaptado a sus contenidos: un sistema de gamificación basado en el recuerdo activo y la repetición espaciada y un sistema de niveles y recompensas que incentive el aprendizaje diario. Todo esto, 100% gratuito, con el objetivo de que los estudiantes tengan más oportunidades para el acceso a becas.</p>
                </div>
            </section>

            <!-- IMPACTO ESPERADO -->
            <section class="impacto section">
                <div class="section-content">
                    <h2>IMPACTO ESPERADO</h2>
                    <p>SMART TEST  busca mejorar la preparación académica de los estudiantes antes de las pruebas Saber 11, reforzar conocimientos, familiarizarse con el tipo de preguntas del examen y aumentar su confianza para abordar la prueba oficial, democratizando el acceso a la preparación.</p>
                    <div class="impact-boxes">
                        <div class="impact-box">
                            <div class="impact-big">100%</div>
                            <div class="impact-small">GRATIS!</div>
                        </div>
                        <div class="impact-box">
                            <div class="impact-big">ICFES</div>
                            <div class="impact-small">TODAS LAS MATERIAS</div>
                        </div>
                        <div class="impact-box">
                            <div class="impact-big">24/7</div>
                            <div class="impact-small">EN CUALQUIER DISPOSITIVO</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- VENTAJAS SMART TEST  -->
            <section class="ventajas section">
                <div class="section-content">
                    <h2>VENTAJAS SMART TEST </h2>
                    <div class="advantages-grid">
                        <div class="advantage-card">
                            <div class="advantage-title">Recuerdo activo</div>
                            <p>Las preguntas están diseñadas para poner a prueba tus conocimientos, no solo leer notas.</p>
                        </div>
                        <div class="advantage-card">
                            <div class="advantage-title">Repetición espaciada</div>
                            <p>Los flashcards repiten los temas justo cuando los estás olvidando.</p>
                        </div>
                        <div class="advantage-card">
                            <div class="advantage-title">Sin costo</div>
                            <p>Prepárate sin costo, sin cargos extras de la plataforma.</p>
                        </div>
                        <div class="advantage-card">
                            <div class="advantage-title">Gratis</div>
                            <p>Entra a la página, regístrate y usa la plataforma sin costo alguno.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ¿CÓMO FUNCIONA? -->
            <section class="how-it-works section">
                <div class="section-content">
                    <h2>¿CÓMO FUNCIONA?</h2>
                    <div class="steps-container">
                        <div class="step">
                            <div class="step-circle">1</div>
                            <div class="step-title">CREA TU CUENTA</div>
                            <p class="step-text">Regístrate con tu correo electrónico y contraseña.</p>
                        </div>
                        <div class="step">
                            <div class="step-circle">2</div>
                            <div class="step-title">INICIA SESIÓN</div>
                            <p class="step-text">Inicia sesión con tu  correo electrónico y contraseña para que tu progreso se guarde de forma individual.</p>
                        </div>
                        <div class="step">
                            <div class="step-circle">3</div>
                            <div class="step-title">PRÁCTICA POR MATERIAS</div>
                            <p class="step-text">Planificación, Lectura Crítica, Inglés, Ciencias Naturales y Ciencias Sociales y estudios ciudadanos.</p>
                        </div>
                        <div class="step">
                            <div class="step-circle">4</div>
                            <div class="step-title">REVISA TUS RESULTADOS</div>
                            <p class="step-text">Revisa tu rendimiento en el tiempo, mira qué temas son tu fuerte y cómo has avanzado en tu estudio.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- BENEFICIOS -->
            <section class="beneficios section">
                <div class="section-content">
                    <h2>BENEFICIOS</h2>
                    <div class="benefits-grid">
                        <div class="benefit-card">
                            <img src="img/chart.png" alt="Matemáticas" class="benefit-icon">
                            <div class="benefit-title">MATEMÁTICAS</div>
                            <p>Practica tus bases de razonamiento matemático para el examen de Saber 11.</p>
                        </div>
                        <div class="benefit-card">
                            <img src="img/chart (1).png" alt="Critical Reading" class="benefit-icon">
                            <div class="benefit-title">LECTURA CRÍTICA</div>
                            <p>Obtén retroalimentación inmediata y conoce tus respuestas al momento.</p>
                        </div>
                        <div class="benefit-card">
                            <img src="img/chart (2).png" alt="English" class="benefit-icon">
                            <div class="benefit-title">INGLÉS</div>
                            <p>En este día la práctica no te resultará aburrida.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- EQUIPO -->
            <section class="team section">
                <div class="section-content">
                    <h2> NUESTRO EQUIPO </h2>
                    <p class="team-subtitle">Los creadores detrás de SMART TEST</p>
                    <div class="team-grid">
                        <div class="team-card" data-creator="1">
                            <div class="team-avatar-wrap">
                                <img src="#" alt="Creador 1" class="team-avatar">
                            </div>
                            <h3 class="team-name">Creador 1</h3>
                            <span class="team-role">Desarrollador Full Stack</span>
                        </div>
                        <div class="team-card" data-creator="2">
                            <div class="team-avatar-wrap">
                                <img src="#" alt="Creador 2" class="team-avatar">
                            </div>
                            <h3 class="team-name">Creador 2</h3>
                            <span class="team-role">Diseñador UI/UX</span>
                        </div>
                        <div class="team-card" data-creator="3">
                            <div class="team-avatar-wrap">
                                <img src="#" alt="Creador 3" class="team-avatar">
                            </div>
                            <h3 class="team-name">Creador 3</h3>
                            <span class="team-role">Product Manager</span>
                        </div>
                    </div>
                </div>
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
                <div class="header-left">
                    <img src="img/LOGO_SMART_TEST.png" alt="Logo Smart Test " class="logo-check">
                    <h2>APRENDER ENGANCHA,<br>GANAR TE IMPULSA</h2>                </div>
                <div class="header-buttons" id="authButtons"></div>
            </header>

            <!-- HERO -->
            <section class="hero">
                <div class="hero-content">
                    <div class="hero-text">
                        <h1>SMART TEST </h1>
                        <p class="hero-subtitle">A 100% free platform for practicing ICFES-style questions and improving your performance.</p>
                        <div class="hero-buttons">
                            <a href="pagina.html" class="btn btn-hero">Start</a>
                            <a href="login.html" class="btn btn-hero-outline" id="heroLoginBtn">Log in</a>
                        </div>
                    </div>
                    <div class="hero-icon">
                        <img src="img/LOGO_SMART_TEST.png" alt="Results chart" class="chart-img">
                    </div>
                </div>
            </section>

            <!-- LIVE RANKING -->
            <section class="ranking-preview section">
                <div class="section-content">
                    <div id="rankingPreviewContainer" class="ranking-preview-cards">
                        <p class="ranking-loading">Loading ranking...</p>
                    </div>
                </div>
            </section>

            <!-- ABOUT -->
            <section class="about section">
                <div class="about-container">
                    <div class="about-text">
                        <h2>WHAT IS SMART TEST ?</h2>
                        <p>SMART TEST  is a 100% free software platform for practicing ICFES-style questions. We store data securely and aim to help users in academic exams. Your identity and ID will be used to monitor your individual study progress.</p>
                    </div>
                </div>
            </section>

            <!-- THE PROBLEM AND OUR SOLUTION -->
            <section class="problem-solution section">
                <div class="problem-solution-container">
                    <div class="problem">
                        <h2>THE PROBLEM</h2>
                        <ul class="bullet-list">
                            <li>Lack of access to mock exams and ICFES-style questions.</li>
                            <li>Difficulty practicing on a recurring basis.</li>
                            <li>Lack of immediate feedback on answers.</li>
                            <li>Shortage of adapted and free platforms for students.</li>
                        </ul>
                    </div>
                    <div class="solution">
                        <h2>OUR SOLUTION</h2>
                        <ul class="bullet-list">
                            <li>Quick and free access to ICFES-style exercises.</li>
                            <li>Constant practice from any device with internet.</li>
                            <li>Immediate evaluation of answers.</li>
                            <li>No cost to prepare for the high school State exam.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- OUR DIFFERENTIAL FACTOR -->
            <section class="factor section">
                <div class="section-content">
                    <h2>OUR DIFFERENTIAL FACTOR</h2>
                    <p>What sets us apart is the study frequency for the Saber 11 Tests. This design is visualized as didactic material with its contents: a gamification system based on active recall and spaced repetition, and a system of levels and rewards that encourages daily learning. All of this, 100% free, with the objective that students have more opportunities for scholarship access.</p>
                </div>
            </section>

            <!-- EXPECTED IMPACT -->
            <section class="impacto section">
                <div class="section-content">
                    <h2>EXPECTED IMPACT</h2>
                    <p>SMART TEST  aims to improve students' academic preparation before the Saber 11 tests, reinforce knowledge, familiarize themselves with the type of questions on the exam, and increase their confidence to tackle the official test, democratizing access to preparation.</p>
                    <div class="impact-boxes">
                        <div class="impact-box">
                            <div class="impact-big">100%</div>
                            <div class="impact-small">FREE!</div>
                        </div>
                        <div class="impact-box">
                            <div class="impact-big">ICFES</div>
                            <div class="impact-small">ALL SUBJECTS</div>
                        </div>
                        <div class="impact-box">
                            <div class="impact-big">24/7</div>
                            <div class="impact-small">ON ANY DEVICE</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SMART TEST  ADVANTAGES -->
            <section class="ventajas section">
                <div class="section-content">
                    <h2>SMART TEST  ADVANTAGES</h2>
                    <div class="advantages-grid">
                        <div class="advantage-card">
                            <div class="advantage-title">Active recall</div>
                            <p>Questions are designed to test your knowledge, not just read notes.</p>
                        </div>
                        <div class="advantage-card">
                            <div class="advantage-title">Spaced repetition</div>
                            <p>Flashcards repeat topics just when you are forgetting them.</p>
                        </div>
                        <div class="advantage-card">
                            <div class="advantage-title">No cost</div>
                            <p>Prepare without cost, with no extra fees on the platform.</p>
                        </div>
                        <div class="advantage-card">
                            <div class="advantage-title">Free</div>
                            <p>Download, register, and use the platform at no cost.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- HOW IT WORKS -->
            <section class="how-it-works section">
                <div class="section-content">
                    <h2>HOW DOES IT WORK?</h2>
                    <div class="steps-container">
                        <div class="step">
                            <div class="step-circle">1</div>
                            <div class="step-title">CREATE YOUR ACCOUNT</div>
                            <p class="step-text">Register with your email and password, or log in with your Google account.</p>
                        </div>
                        <div class="step">
                            <div class="step-circle">2</div>
                            <div class="step-title">LOG IN</div>
                            <p class="step-text">Log in with your account or password so your progress is saved individually.</p>
                        </div>
                        <div class="step">
                            <div class="step-circle">3</div>
                            <div class="step-title">PRACTICE BY SUBJECT</div>
                            <p class="step-text">Planning, Critical Reading, English, Natural Sciences and Social Sciences and citizenship studies.</p>
                        </div>
                        <div class="step">
                            <div class="step-circle">4</div>
                            <div class="step-title">CHECK YOUR RESULTS</div>
                            <p class="step-text">Check your performance over , see which topics are your strength and how you have progressed in your study.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- BENEFITS -->
            <section class="beneficios section">
                <div class="section-content">
                    <h2>BENEFITS</h2>
                    <div class="benefits-grid">
                        <div class="benefit-card">
                            <img src="img/chart.png" alt="Mathematics" class="benefit-icon">
                            <div class="benefit-title">MATHEMATICS</div>
                            <p>Practice your mathematical reasoning basics for the Saber 11 exam.</p>
                        </div>
                        <div class="benefit-card">
                            <img src="img/chart (1).png" alt="Critical Reading" class="benefit-icon">
                            <div class="benefit-title">CRITICAL READING</div>
                            <p>Get immediate feedback and know your answers right away.</p>
                        </div>
                        <div class="benefit-card">
                            <img src="img/chart (2).png" alt="English" class="benefit-icon">
                            <div class="benefit-title">ENGLISH</div>
                            <p>On this day practice will not seem boring to you.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- OUR TEAM -->
            <section class="team section">
                <div class="section-content">
                    <h2> OUR TEAM </h2>
                    <p class="team-subtitle">The creators behind SMART TEST</p>
                    <div class="team-grid">
                        <div class="team-card" data-creator="1">
                            <div class="team-avatar-wrap">
                                <img src="#" alt="Creator 1" class="team-avatar">
                            </div>
                            <h3 class="team-name">Creator 1</h3>
                            <span class="team-role">Full Stack Developer</span>
                        </div>
                        <div class="team-card" data-creator="2">
                            <div class="team-avatar-wrap">
                                <img src="#" alt="Creator 2" class="team-avatar">
                            </div>
                            <h3 class="team-name">Creator 2</h3>
                            <span class="team-role">UI/UX Designer</span>
                        </div>
                        <div class="team-card" data-creator="3">
                            <div class="team-avatar-wrap">
                                <img src="#" alt="Creator 3" class="team-avatar">
                            </div>
                            <h3 class="team-name">Creator 3</h3>
                            <span class="team-role">Product Manager</span>
                        </div>
                    </div>
                </div>
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

async function cargarRankingPreview() {
  const container = document.getElementById("rankingPreviewContainer");
  if (!container) return;

  const es = idiomaActual === "es";

  try {
    const res = await fetch("php/ranking.php");
    const data = await res.json();
    if (!data.ok) {
      container.innerHTML = `<p class="ranking-error">${es ? "No se pudo cargar el ranking." : "Could not load ranking."}</p>`;
      return;
    }

    const top3 = (data.ranking || []).slice(0, 3);
    const total = data.total_usuarios || 0;
    container.innerHTML = renderRankingPreview(top3, total, es);
  } catch (e) {
    container.innerHTML = `<p class="ranking-error">${es ? "Error al cargar el ranking." : "Error loading ranking."}</p>`;
  }
}

function renderRankingPreview(top3, total, es) {
  var medallas = ["", "🥇", "🥈", "🥉"];

  var userList = "";
  top3.forEach(function (u) {
    var posicion = u.posicion;
    var icono = posicion <= 3 ? medallas[posicion] : "#" + posicion;
    userList += `<div class="ranking-preview-user">
      <span class="ranking-preview-posicion">${icono}</span>
      ${window.avatarTag(u.nombre, u.avatar_url, "ranking-preview-avatar")}
      <span class="ranking-preview-nombre">${u.nombre}</span>
      <span class="ranking-preview-puntos">${u.total_puntos.toFixed(1)}</span>
    </div>`;
  });

  if (!userList) {
    userList = `<span class="ranking-preview-empty">${es ? "Aún no hay usuarios en el ranking." : "No users in ranking yet."}</span>`;
  }

  return `<div class="ranking-preview-cartas">
    <div class="ranking-card">
      <div class="ranking-card-title">${es ? "Usuarios" : "Users"}</div>
      <div class="ranking-card-total">
        <i class="fa-solid fa-users"></i> ${total}
      </div>
      <div class="ranking-card-subtitle">${es ? "registrados" : "registered"}</div>
    </div>
    <div class="ranking-card">
      <div class="ranking-card-title">${es ? "Top 3" : "Top 3"}</div>
      <div class="ranking-preview-list">${userList}</div>
    </div>
  </div>`;
}

/* ===== Equipo (NUESTRO EQUIPO) =====
   Sincroniza las tarjetas de creadores con usuarios reales buscados por email.
   Usa window.avatarTag() (de auth.js) para el avatar con fallback a iniciales. */
const CREACIONES = [
  { id: 1, correo: "cronoswyt@gmail.com" },
  { id: 2, correo: "shannonalexa2509@gmail.com" },
  { id: 3, correo: "sanintnicolas93@gmail.com" },
];

async function cargarEquipo() {
  const grid = document.querySelector(".team-grid");
  if (!grid) return;

  const resultados = await Promise.all(
    CREACIONES.map((c) =>
      fetch(`php/admin_datos.php?accion=usuario_por_correo&correo=${encodeURIComponent(c.correo)}`)
        .then((r) => r.json())
        .catch(() => ({ ok: false }))
    )
  );

  resultados.forEach((data, i) => {
    const id = CREACIONES[i].id;
    const card = grid.querySelector(`.team-card[data-creator="${id}"]`);
    if (!card) return;

    const nombre = (data.ok && data.nombre)
      ? data.nombre
      : (idiomaActual === "es" ? `Creador ${id}` : `Creator ${id}`);
    const avatar = (data.ok && data.avatar_url) || "";

    const wrap = card.querySelector(".team-avatar-wrap");
    if (wrap) wrap.innerHTML = window.avatarTag(nombre, avatar, "team-avatar");

    const nameEl = card.querySelector(".team-name");
    if (nameEl) nameEl.textContent = nombre;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("idiomaToggle");
  if (toggle) {
    toggle.checked = idiomaActual === "en";
  }
  actualizarBotonIdioma();
  cargarContenido(idiomaActual);
  renderAuthButtons();
  cargarEquipo();
  cargarRankingPreview();
});
