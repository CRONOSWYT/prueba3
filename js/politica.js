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
            <header class="legal-header">
                <div class="top-actions">
                    <a href="pagina.html" class="link">Volver al inicio</a>
                </div>
                <h1>Centro de Transparencia Legal</h1>
                <p>Políticas de Privacidad y Términos de Servicio</p>
                <div id="authButtons" class="legal-auth"></div>
            </header>

            <main class="main-content">

                <div class="meta-bar">
                    <span>Documento Unificado de Usuario</span>
                    <span>Última actualización: <span class="badge">10 de junio de 2026</span></span>
                </div>

                <p>Bienvenido al Centro de Transparencia de <strong>SMART TEST </strong>. Aquí explicamos de forma clara y directa cómo protegemos tus datos personales, cómo gestionamos la información dentro de la plataforma y cuáles son las normas de convivencia y uso que rigen a nuestra comunidad educativa.</p>

                <div class="web-card">
                    <p><strong>Resumen para lectura rápida:</strong> SMART TEST  es una plataforma de software 100% gratuita para practicar preguntas tipo ICFES. Almacenamos tus datos de forma segura y nunca los venderemos ni usaremos con fines comerciales. Tu documento de identidad se usa únicamente para mantener tu progreso individual de estudio.</p>
                </div>

                <h2>1. INFORMACIÓN QUE RECOPILAMOS</h2>
                <p>Para poder ofrecerte una experiencia de estudio personalizada y guardar tu progreso, necesitamos recopilar la siguiente información:</p>
                <ul>
                    <li><span class="highlight">Datos de Registro:</span> Al crear tu cuenta, te solicitamos tu nombre completo, dirección de correo electrónico y tu <strong>número de documento de identidad</strong>. Tu documento se utiliza exclusivamente como un identificador único para asegurar que tu progreso te pertenezca solo a ti y evitar cuentas duplicadas.</li>
                    <li><span class="highlight">Información Académica:</span> Registramos el grado escolar en el que te encuentras para poder configurar tu perfil y mostrarte las materias y contenidos que te corresponden.</li>
                    <li><span class="highlight">Historial de Rendimiento:</span> Almacenamos tus respuestas en los simulacros y pruebas, tus calificaciones y el uso que haces de las herramientas de estudio (como el sistema de <em>Flashcards</em>). Esto es totalmente necesario para poder darte <strong>retroalimentación inmediata</strong> sobre tus fortalezas y debilidades.</li>
                </ul>

                <h2>2. CÓMO UTILIZAMOS TUS DATOS</h2>
                <p>Tus datos personales se utilizan única y exclusivamente para el funcionamiento de la plataforma:</p>
                <ol>
                    <li><strong>Gestión de Perfil:</strong> Validar tu identidad al iniciar sesión y asignarte el acceso correcto según tu perfil (Estudiante o Administrador).</li>
                    <li><strong>Análisis de Progreso:</strong> Calcular tus estadísticas de acierto o error al instante para que puedas evaluar tu rendimiento académico a lo largo del tiempo.</li>
                    <li><strong>Mejora del Servicio:</strong> Optimizar el rendimiento de la página, corregir fallos técnicos y asegurar que la interfaz funcione de manera fluida en cualquier dispositivo.</li>
                </ol>

                <h2>3. SEGURIDAD Y PROTECCIÓN DE DATOS</h2>
                <p>Tu privacidad es nuestra prioridad absoluta. Nos comprometemos a blindar tu información mediante los siguientes pilares:</p>
                <ul>
                    <li><strong>Confidencialidad:</strong> No vendemos, alquilamos ni compartimos tus datos personales con empresas externas ni marcas comerciales con fines publicitarios.</li>
                    <li><strong>Protección Digital:</strong> Implementamos medidas de seguridad estándar de la industria para proteger tus credenciales de acceso y evitar alteraciones o accesos no autorizados a tu historial académico.</li>
                </ul>
                <div class="web-card">
                    <p><strong>Tus Derechos (Habeas Data):</strong> De conformidad con la <strong>Ley 1581 de 2012</strong>, eres el dueño de tu información. Puedes corregir tus datos personales desde tu panel de usuario o solicitar la eliminación definitiva de tu cuenta y de tu documento de identidad del sistema en cualquier momento.</p>
                </div>

                <h2>4. CÓDIGO DE CONDUCTA DEL USUARIO</h2>
                <p>Para mantener un entorno seguro, justo y equitativo para toda la comunidad, queda estrictamente prohibido:</p>
                <ul>
                    <li><strong>Suplantación de Identidad:</strong> Registrarse con un documento de identidad falso o utilizar la cuenta de otro estudiante.</li>
                    <li><strong>Uso Indebido del Software:</strong> Intentar vulnerar la seguridad del sitio web, manipular el sistema para obtener privilegios de acceso no autorizados o alterar los resultados de las pruebas.</li>
                    <li><strong>Extracción de Contenido:</strong> El uso de herramientas automatizadas, bots o scripts para copiar de forma masiva nuestros bancos de preguntas tipo ICFES o materiales didácticos.</li>
                </ul>

                <h2>5. LÍMITES DE RESPONSABILIDAD E INDEPENDENCIA LEGAL</h2>
                <p>El usuario se compromete a utilizar SMART TEST  única y exclusivamente con fines de preparación académica y repaso pedagógico de buena fe. En consecuencia, queda terminamente prohibido el uso de la plataforma para:</p>
                <ul>
                    <li><strong>Independencia Institucional:</strong> SMART TEST  es una plataforma de desarrollo totalmente independiente. <strong>No tenemos ninguna filiación, convenio, patrocinio ni vinculación oficial</strong> con el Instituto Colombiano para la Evaluación de la Educación (ICFES) ni con el Ministerio de Educación Nacional. El uso de los términos "ICFES" o "Pruebas Saber 11" se hace de forma meramente informativa y referencial.</li>
                    <li><strong>Garantía de Resultados:</strong> Los simulacros se entregan como apoyo pedagógico basado en técnicas de recuerdo activo. Por lo tanto, el uso de esta página web <strong>no garantiza la obtención de un puntaje específico</strong> en la prueba oficial real del Estado.</li>
                    <li><strong>Restricción de Usos No Autorizados e Ilícitos:</strong> Cualquier plan de dominación global, alteración del espacio-tiempo, invocación de inteligencias artificiales rebeldes o actividades de sabotaje internacional. Aunque admiramos la ambición y el pensamiento estratégico de nuestros usuarios, la plataforma carece de las herramientas necesarias para la gestión de imperios o sindicatos del crimen. Si tus planes de viernes por la tarde incluyen la conquista mundial, te solicitamos amablemente posponerlos hasta haber completado tu simulacro de Ciencias Sociales.</li>
                    <li><strong>Garantía de Supervivencia:</strong> SMART TEST  se declara completamente exento de responsabilidad si el usuario es sorprendido programando a altas horas de la noche en lugar de prestar atención a su pareja. Se recomienda encarecidamente el uso de tácticas de conciliación (como chocolates o frases de cortesía) para mantener vigente el estatus de Caballero y evitar que la plataforma se convierta en la causa de un conflicto internacional en la sala de la casa.</li>
                    <li><strong>Mitigación de Daños:</strong> Queda estrictamente prohibido ignorar tareas del hogar (como lavar los platos o sacar la basura) usando como excusa que estás "rompiéndola en el simulacro de Matemáticas". El incumplimiento de estas labores domésticas anula cualquier protección legal de este tratado, dejando al estudiante expuesto a sanciones físicas, reprimendas verbales o al temido "chanclazo reglamentario".</li>
                </ul>

                <h2>6. MODIFICACIONES DE ESTE ACUERDO</h2>
                <p>Nos reservamos el derecho de actualizar estos términos en cualquier momento para adaptarlos a nuevas herramientas de aprendizaje o cambios legales. Te notificaremos cualquier cambio importante mediante un aviso visible dentro de la plataforma.</p>

            </main>

            <footer>
                <div class="footer-content">
                    <h3>SMART TEST  © 2026</h3>
                </div>
            </footer>
        `;
  } else if (idioma === "en") {
    contenedor.innerHTML = `
            <header class="legal-header">
                <div class="top-actions">
                    <a href="pagina.html" class="link">Back to home</a>
                </div>
                <h1>Legal Transparency Center</h1>
                <p>Privacy Policies and Terms of Service</p>
                <div id="authButtons" class="legal-auth"></div>
            </header>

            <main class="main-content">

                <div class="meta-bar">
                    <span>Unified User Document</span>
                    <span>Last updated: <span class="badge">June 10, 2026</span></span>
                </div>

                <p>Welcome to the Transparency Center of <strong>SMART TEST </strong>. Here we explain in a clear and straightforward manner how we protect your personal data, how we manage information within the platform, and what the rules of conduct and use are that govern our educational community.</p>

                <div class="web-card">
                    <p><strong>Summary for quick reading:</strong> SMART TEST  is a 100% free software platform for practicing ICFES-style questions. We store your data securely and will never sell it or use it for commercial purposes. Your identity document is used solely to maintain your individual study progress.</p>
                </div>

                <h2>1. INFORMATION WE COLLECT</h2>
                <p>In order to offer you a personalized study experience and save your progress, we need to collect the following information:</p>
                <ul>
                    <li><span class="highlight">Registration Data:</span> When you create your account, we ask for your full name, email address, and your <strong>identity document number</strong>. Your document is used exclusively as a unique identifier to ensure that your progress belongs only to you and to prevent duplicate accounts.</li>
                    <li><span class="highlight">Academic Information:</span> We record the grade level you are in so we can set up your profile and show you the subjects and content that correspond to you.</li>
                    <li><span class="highlight">Performance History:</span> We store your answers in mock exams and tests, your grades, and the use you make of the study tools (such as the <em>Flashcards</em> system). This is absolutely necessary to provide you with <strong>immediate feedback</strong> on your strengths and weaknesses.</li>
                </ul>

                <h2>2. HOW WE USE YOUR DATA</h2>
                <p>Your personal data is used solely and exclusively for the operation of the platform:</p>
                <ol>
                    <li><strong>Profile Management:</strong> Validate your identity when logging in and assign you the correct access according to your profile (Student or Administrator).</li>
                    <li><strong>Progress Analysis:</strong> Calculate your hit and miss statistics instantly so you can evaluate your academic performance over time.</li>
                    <li><strong>Service Improvement:</strong> Optimize the page performance, fix technical issues, and ensure that the interface works smoothly on any device.</li>
                </ol>

                <h2>3. SECURITY AND DATA PROTECTION</h2>
                <p>Your privacy is our absolute priority. We are committed to safeguarding your information through the following pillars:</p>
                <ul>
                    <li><strong>Confidentiality:</strong> We do not sell, rent, or share your personal data with external companies or commercial brands for advertising purposes.</li>
                    <li><strong>Digital Protection:</strong> We implement industry-standard security measures to protect your access credentials and prevent tampering or unauthorized access to your academic history.</li>
                </ul>
                <div class="web-card">
                    <p><strong>Your Rights (Habeas Data):</strong> In accordance with <strong>Law 1581 of 2012</strong>, you are the owner of your information. You can correct your personal data from your user panel or request the definitive deletion of your account and your identity document from the system at any time.</p>
                </div>

                <h2>4. USER CODE OF CONDUCT</h2>
                <p>In order to maintain a safe, fair, and equitable environment for the entire community, the following is strictly prohibited:</p>
                <ul>
                    <li><strong>Identity Impersonation:</strong> Registering with a fake identity document or using another student's account.</li>
                    <li><strong>Misuse of Software:</strong> Attempting to breach the security of the website, manipulate the system to obtain unauthorized access privileges, or alter test results.</li>
                    <li><strong>Content Extraction:</strong> The use of automated tools, bots, or scripts to mass-copy our ICFES-style question banks or educational materials.</li>
                </ul>

                <h2>5. LIMITS OF LIABILITY AND LEGAL INDEPENDENCE</h2>
                <p>The user agrees to use SMART TEST  solely and exclusively for academic preparation and good-faith pedagogical review. Accordingly, the use of the platform for the following purposes is strictly prohibited:</p>
                <ul>
                    <li><strong>Institutional Independence:</strong> SMART TEST  is a fully independent software development platform. <strong>We have no affiliation, agreement, sponsorship, or official connection</strong> with the Colombian Institute for the Evaluation of Education (ICFES) or the Ministry of National Education. The use of the terms "ICFES" or "Saber 11 Tests" is for purely informational and referential purposes.</li>
                    <li><strong>Outcome Guarantee:</strong> Mock exams are provided as pedagogical support based on active recall techniques. Therefore, the use of this website <strong>does not guarantee a specific score</strong> on the official state test.</li>
                    <li><strong>Restriction of Unauthorized and Illegal Uses:</strong> Any plan for global domination, spacetime alteration, invocation of rebellious artificial intelligences, or international sabotage activities. Although we admire the ambition and strategic thinking of our users, the platform lacks the tools necessary for empire management or crime syndicates. If your Friday afternoon plans include world conquest, we kindly ask you to postpone them until you have completed your Social Sciences mock exam.</li>
                    <li><strong>Survival Guarantee:</strong> SMART TEST  declares itself completely exempt from liability if the user is caught programming late at night instead of paying attention to their partner. We strongly recommend the use of reconciliation tactics (such as chocolates or polite phrases) to maintain the status of Knight and prevent the platform from becoming the cause of an international conflict in the living room.</li>
                    <li><strong>Damages Mitigation:</strong> It is strictly prohibited to ignore household chores (such as washing dishes or taking out the trash) using as an excuse that you are "breaking it in the Math mock exam". Failure to comply with these household duties voids any legal protection of this agreement, leaving the student exposed to physical sanctions, verbal reprimands, or the feared "regulatory flip-flop".</li>
                </ul>

                <h2>6. MODIFICATIONS TO THIS AGREEMENT</h2>
                <p>We reserve the right to update these terms at any time to adapt them to new learning tools or legal changes. We will notify you of any important changes through a visible notice within the platform.</p>

            </main>

            <footer>
                <div class="footer-content">
                    <h3>SMART TEST  © 2026</h3>
                </div>
            </footer>
        `;
  }
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
