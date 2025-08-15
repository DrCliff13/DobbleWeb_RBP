// Función utilitaria para obtener la URL base
function getApiBaseUrl() {
    return location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "http://localhost:3000"
        : "https://dobbleweb.onrender.com";
}

// Datos del juego simulados (como respaldo)
let gameStats = {
    gamesPlayed: Math.floor(Math.random() * 50) + 10,
    bestScore: Math.floor(Math.random() * 1000) + 500,
    wins: Math.floor(Math.random() * 30) + 5
};

// Inicializar estadísticas
async function initStats() {
    const userId = localStorage.getItem('user_id');
    const nombre = localStorage.getItem('usuario') || 'USER';

    document.getElementById('nombreUsuarioMenu').textContent = nombre;

    if (!userId) {
        console.warn('No se encontró user_id en localStorage');
        return;
    }

    try {
        const res = await fetch(`${getApiBaseUrl()}/api/auth/estadisticas/${userId}`);
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('gamesPlayed').textContent = data.gamesPlayed;
            document.getElementById('bestTime').textContent = data.bestTime + "s";
            document.getElementById('winRate').textContent = 
                data.gamesPlayed > 0 
                    ? Math.round((data.wins / data.gamesPlayed) * 100) + '%'
                    : '0%';
        } else {
            console.error("Error en respuesta del servidor:", data.message);
            // Usar datos simulados como respaldo
            showFallbackStats();
        }
    } catch (err) {
        console.error("Error cargando estadísticas:", err);
        // Usar datos simulados como respaldo
        showFallbackStats();
    }
}

// Función para mostrar estadísticas de respaldo en caso de error
function showFallbackStats() {
    document.getElementById('gamesPlayed').textContent = gameStats.gamesPlayed;
    document.getElementById('bestTime').textContent = "N/A";
    document.getElementById('winRate').textContent = 
        Math.round((gameStats.wins / gameStats.gamesPlayed) * 100) + '%';
}

document.addEventListener("DOMContentLoaded", initStats);

// Mostrar notificación
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function selectMode(mode) {
    const modeNames = {
        'classic': 'Modo Clásico',
        'educational': 'Modo Educativo',
        'challenge': 'Modo Reto Contrarreloj',
        'collaborative': 'Modo Colaborativo',
        'ranking': 'Ver Ranking'
    };
    
    const modePages = {
        'classic': 'juego.html',
        'educational': 'juegoEdu.html',
        'challenge': 'juegoCR.html',
        'collaborative': 'historia.html',
        'ranking': 'Rankin.html'
    };
    
    // Efecto visual del botón
    event.target.classList.add('pulse');
    setTimeout(() => {
        event.target.classList.remove('pulse');
    }, 1000);
    
    showNotification(`¡${modeNames[mode]} seleccionado!`);
    
    // Redirigir a la página correspondiente
    setTimeout(() => {
        window.location.href = modePages[mode];
    }, 1500);
}

// Salir del juego
function exitGame() {
    event.target.classList.add('pulse');
    setTimeout(() => {
        event.target.classList.remove('pulse');
    }, 1000);
    
    if (confirm('¿Estás seguro de que quieres salir del juego?')) {
        showNotification('¡Gracias por jugar Dobble!');
        setTimeout(() => {
            // Limpiar localStorage al salir
            localStorage.removeItem('user_id');
            localStorage.removeItem('usuario');
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Efectos adicionales (removí la simulación automática de stats)
function addRandomEffects() {
    // Efectos visuales adicionales si los necesitas
    console.log('Efectos adicionales inicializados');
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initStats();
    addRandomEffects();
    
    // Animación de entrada
    const container = document.getElementById('gameContainer');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.8s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        const nombre = localStorage.getItem('usuario') || 'Usuario';
        showNotification(`¡Bienvenido a Dobble, ${nombre}!`);
    }, 1500);
});

// Efectos de hover mejorados
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('game-mode-btn')) {
        e.target.style.transform = 'translateY(-3px) scale(1.02)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('game-mode-btn')) {
        e.target.style.transform = 'translateY(0) scale(1)';
    }
});
