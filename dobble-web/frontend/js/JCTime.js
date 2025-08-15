let simboloCorrecto = null;
let puntaje = 0;
let tiempoInicio;
let tiempoTranscurrido = 0;
let intervaloCronometro = null;
let juegoPausado = false;

const simbolosDisponibles = ["🛹", "🌭", "🍔", "🍕", "🪬", "🧩", "⚽", "🎮", "🖼️", "🌺", "🚌", "💫", "🍀", "🏍️", "☕", "🍪", "🤎", "📜"];
const puntajeFinal = 10;
const TIEMPO_LIMITE = 10;

document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem('usuario') || 'Jugador';
  document.getElementById("nombreUsuario").textContent = nombre;

  const carta1 = document.getElementById("carta1");
  const carta2 = document.getElementById("carta2");
  const resultado = document.getElementById("resultado");
  const zonaJuego = document.getElementById("zonaJuego");
  const btnIniciar = document.getElementById("btnIniciar");
  const btnReiniciar = document.getElementById("btnReiniciar");
  const btnMenu = document.getElementById("btnMenu");
  const puntajeSpan = document.getElementById("puntaje");
  const btnPausa = document.getElementById("btnPausa");
  const btnReanudar = document.getElementById("btnReanudar");
  const menuPausa = document.getElementById("menuPausa");
  const btnVolverMenu = document.getElementById("btnVolverMenu");

  if (btnVolverMenu) {
    btnVolverMenu.addEventListener("click", () => {
      window.location.href = "Menu2.0.html";
    });
  }

  function generarCartas() {
    const simbolosMezclados = [...simbolosDisponibles].sort(() => 0.5 - Math.random());
    const simboloComun = simbolosMezclados[0];
    const carta1Simbolos = [simboloComun, ...simbolosMezclados.slice(1, 9)];
    const carta2Simbolos = [simboloComun, ...simbolosMezclados.slice(9, 17)];

    renderizarCarta(carta1, carta1Simbolos.sort(() => 0.5 - Math.random()));
    renderizarCarta(carta2, carta2Simbolos.sort(() => 0.5 - Math.random()));

    return simboloComun;
  }

  function renderizarCarta(cartaElement, simbolos) {
    cartaElement.innerHTML = "";
    simbolos.forEach(simbolo => {
      const span = document.createElement("span");
      span.classList.add("simbolo");
      span.textContent = simbolo;

      // Estilo aleatorio
      const size = Math.floor(Math.random() * 20) + 24;
      span.style.fontSize = `${size}px`;
      span.style.position = "relative";
      span.style.top = `${Math.floor(Math.random() * 10) - 5}px`;
      span.style.left = `${Math.floor(Math.random() * 10) - 5}px`;

      cartaElement.appendChild(span);
    });
  }

  function iniciarCronometro() {
    tiempoInicio = Date.now();
    intervaloCronometro = setInterval(() => {
      const tiempoActual = (Date.now() - tiempoInicio) / 1000 + tiempoTranscurrido;
      document.getElementById("tiempo").textContent = tiempoActual.toFixed(2);

      if (tiempoActual >= TIEMPO_LIMITE) {
        detenerCronometro();
        resultado.textContent = "⏱ ¡Tiempo agotado! Juego terminado.";
        resultado.style.background = "rgba(244, 67, 54, 0.2)";
        eliminarListenersSimbolos();
        btnPausa.style.display = "none";
        mostrarBotonesFinJuego();
        registrarPuntaje();
      }
    }, 100);
  }

  function detenerCronometro() {
    clearInterval(intervaloCronometro);
    intervaloCronometro = null;
    mostrarBotonesFinJuego();
  }

  function mostrarBotonesFinJuego() {
    btnReiniciar.style.display = "inline-block";
    btnMenu.style.display = "inline-block";
  }

  function pausarJuego() {
    if (juegoPausado || !intervaloCronometro) return;
    juegoPausado = true;
    tiempoTranscurrido += (Date.now() - tiempoInicio) / 1000;
    clearInterval(intervaloCronometro);
    eliminarListenersSimbolos();
    menuPausa.style.display = "block";
  }

  function reanudarJuego() {
    if (!juegoPausado) return;
    juegoPausado = false;
    menuPausa.style.display = "none";
    agregarListenersSimbolos();
    iniciarCronometro();
  }

  function manejarClicSimbolo(e) {
    if (juegoPausado || !e.target.classList.contains("simbolo")) return;

    const seleccion = e.target.textContent;

    if (seleccion === simboloCorrecto) {
      puntaje++;
      puntajeSpan.textContent = puntaje;
      resultado.textContent = "🎉 ¡Correcto! Has encontrado el símbolo común";
      resultado.style.background = "linear-gradient(45deg, #4CAF50, #8BC34A)";
      e.target.classList.add("correcto");

      if (puntaje >= puntajeFinal) {
        detenerCronometro();
        resultado.textContent = "🎉 ¡Has ganado! Juego terminado.";
        eliminarListenersSimbolos();
        registrarPuntaje();
        actualizarEstadisticas();
        btnPausa.style.display = "none";
        return;
      }

    } else {
      resultado.textContent = "❌ Incorrecto. Nuevas cartas...";
      resultado.style.background = "rgba(244, 67, 54, 0.2)";
      e.target.classList.add("incorrecto");
      setTimeout(() => e.target.classList.remove("incorrecto"), 500);
    }

    eliminarListenersSimbolos();
    simboloCorrecto = generarCartas();
    agregarListenersSimbolos();
  }

  function agregarListenersSimbolos() {
    document.querySelectorAll(".simbolo").forEach(simbolo => {
      simbolo.addEventListener("click", manejarClicSimbolo);
    });
  }

  
  function eliminarListenersSimbolos() {
    document.querySelectorAll(".simbolo").forEach(simbolo => {
      simbolo.replaceWith(simbolo.cloneNode(true));
    });
  }

  function registrarPuntaje() {
    fetch('/guardar-intento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, puntaje })
    })
      .then(res => res.json())
      .then(data => console.log("Puntaje guardado:", data))
      .catch(err => console.error("Error al guardar puntaje:", err));
  }

  function actualizarEstadisticas() {
    const usuario_id = localStorage.getItem('user_id');
    const tiempoTotal = (tiempoTranscurrido + (Date.now() - tiempoInicio) / 1000).toFixed(2);
    const victoria = puntaje >= puntajeFinal ? 1 : 0;

    fetch('http://localhost:3000/api/estadisticas/actualizar-estadisticas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuario_id,
        tiempo: parseFloat(tiempoTotal),
        victoria: victoria
      })
    })
      .then(res => res.json())
      .then(data => console.log("✅ Estadísticas guardadas:", data))
      .catch(err => console.error("❌ Error guardando estadísticas:", err));
  }

  function iniciarJuego() {
    puntaje = 0;
    tiempoTranscurrido = 0;
    document.getElementById("tiempo").textContent = "0.00";
    puntajeSpan.textContent = puntaje;
    simboloCorrecto = generarCartas();
    agregarListenersSimbolos();
    iniciarCronometro();
    zonaJuego.style.display = "block";
    btnIniciar.style.display = "none";
    resultado.textContent = "";
    resultado.style.background = "transparent";
    btnPausa.style.display = "inline-block";
  }

  // Eventos
  btnIniciar.addEventListener("click", iniciarJuego);
  btnReiniciar.addEventListener("click", () => {
    iniciarJuego();
    btnReiniciar.style.display = "none";
    btnMenu.style.display = "none";
  });
  btnMenu.addEventListener("click", () => window.location.href = "Menu2.0.html");
  btnPausa.addEventListener("click", pausarJuego);
  btnReanudar.addEventListener("click", reanudarJuego);
  
});
