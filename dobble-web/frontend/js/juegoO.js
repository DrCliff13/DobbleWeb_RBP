let tiempo = 0;
let intervalo;
let intervaloCronometro; 
let puntaje = 0;
const puntajeFinal = 10;
const TIEMPO_LIMITE = 60;
let juegoPausado = false;
let tiempoTranscurrido = 0; 
let tiempoInicio = 0; 

let carta1, carta2, resultado, zonaJuego, btnIniciar, simboloCorrecto;
let figurasCarta1, figurasCarta2;
let btnReiniciar, btnMenu, btnVolverMenu, btnPausa, btnReanudar, puntajeSpan, menuPausa;

const simbolosDisponibles = [
  "☀️", "☁️", "⛄", "⚡", "🔥", "🌟", "💧", "🌿", "🌳",
  "🌺", "🎉", "💫", "🎮", "🍕", "🚀", "🏀", "📚", "🧩", "🎲", "🎯"
];

// Obtener nombre del usuario (usar variables en memoria en lugar de localStorage)
let nombreUsuario = 'Jugador';

function generarCartas() {
  const simbolosMezclados = [...simbolosDisponibles].sort(() => 0.5 - Math.random());
  const simboloComun = simbolosMezclados[0];

  const carta1Simbolos = [simboloComun, ...simbolosMezclados.slice(1, 9)].sort(() => 0.5 - Math.random());
  const carta2Simbolos = [simboloComun, ...simbolosMezclados.slice(9, 17)].sort(() => 0.5 - Math.random());

  figurasCarta1.innerHTML = '';
  carta1Simbolos.forEach(s => {
    const span = document.createElement("span");
    span.className = "simbolo";
    span.textContent = s;
    figurasCarta1.appendChild(span);
  });

  figurasCarta2.innerHTML = '';
  carta2Simbolos.forEach(s => {
    const span = document.createElement("span");
    span.className = "simbolo";
    span.textContent = s;
    figurasCarta2.appendChild(span);
  });

  return simboloComun;
}

function iniciarCronometro() {
  clearInterval(intervaloCronometro);
  tiempoInicio = Date.now();
  intervaloCronometro = setInterval(() => {
    if (!juegoPausado) {
      tiempo += 0.1;
      document.getElementById("tiempo").textContent = tiempo.toFixed(2);
      if (tiempo >= TIEMPO_LIMITE) {
        detenerCronometro();
        resultado.textContent = "⏱ ¡Tiempo agotado! Juego terminado.";
        eliminarListenersSimbolos();
        mostrarBotonesFinJuego();
        registrarPuntaje();
      }
    }
  }, 100);
}

function detenerCronometro() {
  clearInterval(intervaloCronometro);
  intervaloCronometro = null;
  mostrarBotonesFinJuego();
}

function mostrarBotonesFinJuego() {
  if (btnReiniciar) btnReiniciar.style.display = "inline-block";
  if (btnMenu) btnMenu.style.display = "inline-block";
  if (btnPausa) btnPausa.style.display = "none";
}

function pausarJuego() {
  if (juegoPausado || !intervaloCronometro) return;
  juegoPausado = true;
  tiempoTranscurrido += (Date.now() - tiempoInicio) / 1000;
  clearInterval(intervaloCronometro);
  eliminarListenersSimbolos();
  if (menuPausa) menuPausa.style.display = "block";
}

function reanudarJuego() {
  if (!juegoPausado) return;
  juegoPausado = false;
  tiempoInicio = Date.now();
  iniciarCronometro();
  agregarListenersSimbolos();
  if (menuPausa) menuPausa.style.display = "none";
}

function manejarClicSimbolo(e) {
  if (juegoPausado || !e.target.classList.contains("simbolo")) return;

  const seleccion = e.target.textContent;

  if (seleccion === simboloCorrecto) {
    puntaje++;
    if (puntajeSpan) puntajeSpan.textContent = puntaje;
    resultado.textContent = "🎉 ¡Correcto! Has encontrado el símbolo común";
    resultado.style.background = "linear-gradient(45deg, #4CAF50, #8BC34A)";
    e.target.classList.add("correcto");

    if (puntaje >= puntajeFinal) {
      detenerCronometro();
      resultado.textContent = "🎉 ¡Has ganado! Juego terminado.";
      eliminarListenersSimbolos();
      registrarPuntaje();
      actualizarEstadisticas();
      if (btnPausa) btnPausa.style.display = "none";
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
  const nombre = localStorage.getItem('usuario') || 'Jugador';
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
  // Función placeholder para actualizar estadísticas
  console.log("Actualizando estadísticas...");
}

function iniciarJuego() {
  puntaje = 0;
  tiempo = 0;
  tiempoTranscurrido = 0;
  juegoPausado = false;
  
  document.getElementById("tiempo").textContent = "0.00";
  if (puntajeSpan) puntajeSpan.textContent = puntaje;
  
  simboloCorrecto = generarCartas();
  agregarListenersSimbolos();
  iniciarCronometro();
  
  if (zonaJuego) zonaJuego.style.display = "block";
  if (btnIniciar) btnIniciar.style.display = "none";
  if (btnReiniciar) btnReiniciar.style.display = "none";
  if (btnMenu) btnMenu.style.display = "none";
  if (btnPausa) btnPausa.style.display = "inline-block";
  
  resultado.textContent = "";
  resultado.style.background = "transparent";
}

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar elementos del DOM
  carta1 = document.getElementById("carta1");
  carta2 = document.getElementById("carta2");
  resultado = document.getElementById("resultado") || document.createElement("div");
  zonaJuego = document.getElementById("zonaJuego");
  btnIniciar = document.getElementById("btnIniciar");
  figurasCarta1 = document.getElementById("figurasCarta1");
  figurasCarta2 = document.getElementById("figurasCarta2");
  btnReiniciar = document.getElementById("btnReiniciar");
  btnMenu = document.getElementById("btnMenu");
  btnVolverMenu = document.getElementById("btnVolverMenu");
  btnPausa = document.getElementById("btnPausa");
  btnReanudar = document.getElementById("btnReanudar");
  puntajeSpan = document.getElementById("puntaje");
  menuPausa = document.getElementById("menuPausa");

  // Mostrar nombre del usuario
   const nombre = localStorage.getItem('usuario') || 'Jugador';
  document.getElementById("nombreUsuario").textContent = nombre;


  // Event listeners
  if (btnIniciar) {
    btnIniciar.addEventListener("click", iniciarJuego);
  }

  if (btnPausa) {
    btnPausa.addEventListener("click", pausarJuego);
  }

  if (btnReanudar) {
    btnReanudar.addEventListener("click", reanudarJuego);
  }

  const btnReanudarPausa = document.getElementById("btnReanudarPausa");
  if (btnReanudarPausa) {
    btnReanudarPausa.addEventListener("click", reanudarJuego);
  }

  if (btnVolverMenu) {
    btnVolverMenu.addEventListener("click", () => {
      window.location.href = "Menu2.0.html";
    });
  }

  if (btnReiniciar) {
    btnReiniciar.addEventListener("click", () => {
      iniciarJuego();
    });
  }

  if (btnMenu) {
    btnMenu.addEventListener("click", () => {
      window.location.href = "Menu2.0.html";
    });
  }
});