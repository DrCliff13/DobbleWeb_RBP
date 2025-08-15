function createStars() {
        const starsContainer = document.getElementById('stars');
        const numberOfStars = 50;

        for (let i = 0; i < numberOfStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.innerHTML = '✨';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.fontSize = (Math.random() * 10 + 10) + 'px';
            starsContainer.appendChild(star);
        }
    }

    // Mostrar mensaje temporal
    function showTemporaryMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = text;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 20px;
            font-size: 2rem;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 2000);
    }

    // Efectos de celebración
    function celebratePlayer(position) {
        const confetti = ['🎉', '🎊', '✨', '🏆', '⭐'];
        const body = document.body;

        for (let i = 0; i < 20; i++) {
            const element = document.createElement('div');
            element.style.position = 'fixed';
            element.style.left = Math.random() * 100 + 'vw';
            element.style.top = '0px';
            element.style.fontSize = '20px';
            element.style.zIndex = '9999';
            element.style.pointerEvents = 'none';
            element.innerHTML = confetti[Math.floor(Math.random() * confetti.length)];
            body.appendChild(element);

            const fallAnimation = element.animate([
                { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
                { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 }
            ], {
                duration: 3000,
                easing: 'ease-in'
            });
            fallAnimation.onfinish = () => element.remove();
        }

        const messages = ['¡Increíble! 🏆', '¡Eres el mejor! 🌟', '¡Felicitaciones! 🎉'];
        const message = messages[position - 1] || messages[0];
        showTemporaryMessage(message);
    }

    function startGame() {
        showTemporaryMessage('¡Iniciando juego! 🎮');
        window.location.href = '/Menu2.0.html';
    }

    function refreshRanking() {
        showTemporaryMessage('¡Actualizando ranking! 🔄');
        loadRanking(currentSort); // Recarga con el orden actual
    }

    // Lógica para cargar el ranking desde el backend
    let currentSort = 'puntaje'; // Valor por defecto

    async function loadRanking(sortType = 'puntaje') {
        try {
            const res = await fetch(`/api/estadisticas/ranking?criterio=${sortType}`);
            const data = await res.json();

            if (!data.success || !Array.isArray(data.players)) {
                showTemporaryMessage("No se pudo cargar el ranking ❌");
                return;
            }

            const players = data.players;
            const podium = players.slice(0, 3);
            const rest = players.slice(3);

            // Pódium
            const [first, second, third] = podium;
            document.querySelector('.first-place .player-name').textContent = first?.nombre || '---';
            document.querySelector('.first-place .player-score').textContent = `${first?.puntaje_total || 0} pts`;

            document.querySelector('.second-place .player-name').textContent = second?.nombre || '---';
            document.querySelector('.second-place .player-score').textContent = `${second?.puntaje_total || 0} pts`;

            document.querySelector('.third-place .player-name').textContent = third?.nombre || '---';
            document.querySelector('.third-place .player-score').textContent = `${third?.puntaje_total || 0} pts`;

            // Lista general
            const rankingList = document.querySelector('.ranking-list');
            rankingList.innerHTML = '';
            rest.forEach(player => {
                rankingList.innerHTML += `
                    <div class="ranking-item">
                        <div class="rank-number">${player.posicion}</div>
                        <div class="player-info">
                            <div class="player-name-list">${player.nombre}</div>
                            <div class="player-stats">${player.partidas_jugadas} partidas • ${player.victorias} victorias • Mejor tiempo: ${player.mejor_tiempo}s</div>
                        </div>
                        <div class="player-total-score">${player.puntaje_total} pts</div>
                    </div>
                `;
            });

        } catch (err) {
            console.error("Error cargando el ranking:", err);
            showTemporaryMessage("Error al cargar ranking ⚠️");
        }
    }

    // Botones de ordenamiento
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.classList.contains('refresh-btn')) return;

            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const sortType = this.dataset.sort;
            currentSort = sortType;
            showTemporaryMessage(`Ordenando por ${sortType} 📊`);
            loadRanking(sortType);
        });
    });

    // Animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }
    `;
    document.head.appendChild(style);

    // Inicialización al cargar
    window.addEventListener('load', () => {
        createStars();
        loadRanking(currentSort);
    });

