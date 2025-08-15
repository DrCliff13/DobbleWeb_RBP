let tiempo = 0;
let intervalo;
let puntaje = 0;
const puntajeFinal = 10;

let carta1, carta2, resultado, zonaJuego, btnIniciar, simboloCorrecto;

const simbolosDisponibles = ["🛹", "🌭", "🍔", "🍕", "🪬", "🧩", "⚽", "🎮", "🖼️", "🌺", "🚌", "💫", "🍀", "🏍️", 
  "🤖", "🚂","🌍","✖️","🏎️","🎪","🎿","👽","🐺","⛷️","🐈","🥕","🌸","🦖","🌙","🎁","🎡"];

function generarCartas() {
  // Mezcla todos los símbolos disponibles
  const simbolosMezclados = [...simbolosDisponibles].sort(() => 0.5 - Math.random());

  // Selecciona el símbolo común que estará en ambas cartas
  const simboloComun = simbolosMezclados[0];

  // Construye las dos cartas con 9 símbolos cada una (1 común + 8 distintos)
  const carta1Simbolos = [simboloComun, ...simbolosMezclados.slice(1, 9)];
  const carta2Simbolos = [simboloComun, ...simbolosMezclados.slice(9, 17)];

  // Mezcla los símbolos dentro de cada carta
  const mezclar = arr => arr.sort(() => 0.5 - Math.random());
  const carta1Final = mezclar(carta1Simbolos);
  const carta2Final = mezclar(carta2Simbolos);

  // Muestra las cartas en pantalla
  renderizarCarta(carta1, carta1Final);
  renderizarCarta(carta2, carta2Final);

  return simboloComun;
}


function renderizarCarta(cartaElement, simbolos) {
  cartaElement.innerHTML = "";

  simbolos.forEach(simbolo => {
    const span = document.createElement("span");
    span.classList.add("simbolo");
    span.textContent = simbolo;

    // Tamaño aleatorio
    const size = Math.floor(Math.random() * 20) + 24; // entre 24px y 44px
    span.style.fontSize = `${size}px`;

    // Posición aleatoria
    span.style.position = "relative";
    span.style.top = `${Math.floor(Math.random() * 10) - 5}px`;
    span.style.left = `${Math.floor(Math.random() * 10) - 5}px`;

    cartaElement.appendChild(span);
  });
}



function iniciarCronometro() {
  tiempo = 0;
  intervalo = setInterval(() => {
    tiempo += 0.1;
    document.getElementById("tiempo").textContent = tiempo.toFixed(2);
    if (tiempo >= TIEMPO_LIMITE) {
      detenerCronometro();
      resultado.textContent = "⏱ ¡Tiempo agotado! Juego terminado.";
      eliminarListenersSimbolos();
      document.getElementById("btnReiniciar").style.display = "inline-block";
      document.getElementById("btnMenu").style.display = "inline-block";
      registrarPuntaje();
    }
  }, 100);
}

function detenerCronometro() {
  clearInterval(intervalo);
  document.getElementById("btnReiniciar").style.display = "inline-block";
  document.getElementById("btnMenu").style.display = "inline-block";
}

function manejarClicSimbolo(e) {
  if (e.target.classList.contains("simbolo")) {
    const seleccion = e.target.textContent;

    if (seleccion === simboloCorrecto) {
      puntaje++;
      document.getElementById("puntaje").textContent = puntaje;
      resultado.textContent = "🎉 ¡Correcto! Has encontrado el símbolo común";
      resultado.style.background = "linear-gradient(45deg, #4CAF50, #8BC34A)";
      
      // ✅ Agregar clase de acierto
      e.target.classList.add("correcto");

      if (puntaje >= puntajeFinal) {
        detenerCronometro();
        resultado.textContent = "🎉 ¡Has ganado! Juego terminado.";
        registrarPuntaje();
        eliminarListenersSimbolos();
        document.getElementById("btnReiniciar").style.display = "inline-block";
        document.getElementById("btnMenu").style.display = "inline-block";
        return;
      }

    } else {
      resultado.textContent = "❌ Incorrecto. Nuevas cartas...";
      resultado.style.background = "rgba(244, 67, 54, 0.2)";
      
      // ❌ Agregar clase de error temporal
      e.target.classList.add("incorrecto");
      setTimeout(() => {
        e.target.classList.remove("incorrecto");
      }, 500);

      // Cambiar cartas si se falla
      simboloCorrecto = generarCartas();
      agregarListenersSimbolos();
    }
  }



    // En ambos casos, regenerar cartas y volver a escuchar
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
  document.getElementById("puntaje").textContent = puntaje;
  resultado.textContent = "";
  simboloCorrecto = generarCartas();
  agregarListenersSimbolos();
  iniciarCronometro();
  zonaJuego.style.display = "block";
  btnIniciar.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  carta1 = document.getElementById("carta1");
  carta2 = document.getElementById("carta2");
  resultado = document.getElementById("resultado");
  zonaJuego = document.getElementById("zonaJuego");
  btnIniciar = document.getElementById("btnIniciar");
  

  const nombre = localStorage.getItem('usuario') || 'Jugador';
  document.getElementById("nombreUsuario").textContent = nombre;

  btnIniciar.addEventListener("click", iniciarJuego);

  document.getElementById("btnReiniciar").addEventListener("click", () => {
    puntaje = 0;
    document.getElementById("puntaje").textContent = puntaje;
    resultado.textContent = "";
    zonaJuego.style.display = "block";
    document.getElementById("btnReiniciar").style.display = "none";
    document.getElementById("btnMenu").style.display = "none";
    simboloCorrecto = generarCartas();
    agregarListenersSimbolos();
    iniciarCronometro();
  });

  document.getElementById("btnMenu").addEventListener("click", () => {
    window.location.href = "menu.html";
  });
});
