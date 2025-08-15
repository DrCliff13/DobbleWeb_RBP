let tiempo = 0;
let intervalo;
let puntaje = 0;
const puntajeFinal = 10;
const TIEMPO_LIMITE = 60;
let juegoPausado = false;

let carta1, carta2, resultado, zonaJuego, btnIniciar, btnPausa, simboloCorrecto;

const simbolosDisponibles = ["🛹", "🌭", "🍔", "🍕", "🪬", "🧩", "⚽", "🎮", "🖼️", "🌺", "🚌", "💫", "🍀", "🏍️"];

function generarCartas() {
  const simbolosMezclados = [...simbolosDisponibles].sort(() => 0.5 - Math.random());
  const simboloComun = simbolosMezclados[0];

  const carta1Simbolos = [simboloComun, ...simbolosMezclados.slice(1, 6)];
  const carta2Simbolos = [simboloComun, ...simbolosMezclados.slice(6, 11)];

  const mezclar = arr => arr.sort(() => 0.5 - Math.random());
  renderizarCarta(carta1, mezclar(carta1Simbolos));
  renderizarCarta(carta2, mezclar(carta2Simbolos));

  return simboloComun;
}

function renderizarCarta(cartaElement, simbolos) {
  cartaElement.innerHTML = "";
  simbolos.forEach(simbolo => {
    const span = document.createElement("span");
    span.classList.add("simbolo");
    span.textContent = simbolo;
    span.style.fontSize = `${Math.floor(Math.random() * 20) + 24}px`;
    span.style.position = "relative";
    span.style.top = `${Math.floor(Math.random() * 10) - 5}px`;
    span.style.left = `${Math.floor(Math.random() * 10) - 5}px`;
    cartaElement.appendChild(span);
  });
}

function iniciarCronometro() {
  clearInterval(intervalo);
  intervalo = setInterval(() => {
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
  clearInterval(intervalo);
  mostrarBotonesFinJuego();
}

function mostrarBotonesFinJuego() {
  document.getElementById("btnReiniciar").style.display = "inline-block";
  document.getElementById("btnVolverMenu").style.display = "inline-block";
  if (btnPausa) btnPausa.style.display = "none"; 
}


function pausarJuego() {
  juegoPausado = true;
  document.getElementById("menuPausa").style.display = "block";
  eliminarListenersSimbolos();
  btnPausa.disabled = true; // desactiva el botón mientras está pausado
}


function reanudarJuego() {
  juegoPausado = false;
  document.getElementById("menuPausa").style.display = "none";
  agregarListenersSimbolos();
  btnPausa.disabled = false; // reactiva el botón
}


function manejarClicSimbolo(e) {
  if (juegoPausado || !e.target.classList.contains("simbolo")) return;

  const seleccion = e.target.textContent;

  if (seleccion === simboloCorrecto) {
    puntaje++;
    document.getElementById("puntaje").textContent = puntaje;
    resultado.textContent = "🎉 ¡Correcto! Has encontrado el símbolo común";
    resultado.style.background = "linear-gradient(45deg, #4CAF50, #8BC34A)";
    e.target.classList.add("correcto");

    if (puntaje >= puntajeFinal) {
    detenerCronometro();
    resultado.textContent = "🎉 ¡Has ganado! Juego terminado.";
    eliminarListenersSimbolos();
    registrarPuntaje();
    mostrarBotonesFinJuego(); // <-- necesario aquí también
    return;
    }
  } else {
    resultado.textContent = "❌ Incorrecto. Nuevas cartas...";
    resultado.style.background = "rgba(244, 67, 54, 0.2)";
    e.target.classList.add("incorrecto");
    setTimeout(() => {
      e.target.classList.remove("incorrecto");
    }, 500);
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

function iniciarJuego() {
  puntaje = 0;
  tiempo = 0;
  juegoPausado = false;
  document.getElementById("puntaje").textContent = puntaje;
  document.getElementById("tiempo").textContent = tiempo.toFixed(2);
  simboloCorrecto = generarCartas();
  agregarListenersSimbolos();
  iniciarCronometro();
  resultado.textContent = "";
  zonaJuego.style.display = "block";
  btnIniciar.style.display = "none";
  btnPausa.style.display = "inline-block";
  btnPausa.disabled = false; // asegúrate de reactivarlo
}

document.addEventListener("DOMContentLoaded", () => {
  carta1 = document.getElementById("carta1");
  carta2 = document.getElementById("carta2");
  resultado = document.getElementById("resultado");
  zonaJuego = document.getElementById("zonaJuego");
  btnIniciar = document.getElementById("btnIniciar");
  btnPausa = document.getElementById("btnPausa");

  const nombre = localStorage.getItem('usuario') || 'Jugador';
  document.getElementById("nombreUsuario").textContent = nombre;

  btnIniciar.addEventListener("click", iniciarJuego);
  btnPausa.addEventListener("click", pausarJuego);
  document.getElementById("btnReanudar").addEventListener("click", reanudarJuego);

  document.getElementById("btnReiniciar").addEventListener("click", () => {
    iniciarJuego();
    document.getElementById("btnReiniciar").style.display = "none";
    document.getElementById("btnVolverMenu").style.display = "none";
  });

  document.getElementById("btnVolverMenu").addEventListener("click", () => {
    window.location.href = "Menu2.0.html";
  });
});
