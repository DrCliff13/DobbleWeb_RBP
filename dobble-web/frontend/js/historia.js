class DobbleStoryMode {
    constructor() {
        // Símbolos de respaldo en caso de que la IA no los genere correctamente.
        this.symbols = ['🌟', '🔥', '💎', '🌙', '⚡', '🌊', '🌸', '🍀', '🦋', '🐉', '🗝️', '👑', '⚔️', '🛡️', '🏺', '📜', '🔮', '🌺', '🦅', '🐺'];
        
        // Estado del juego
        this.currentChapter = 1;
        this.score = 0;
        this.matches = 0;
        this.chapterProgress = 0;
        this.maxProgress = 5; // Cantidad de coincidencias necesarias para completar un capítulo.
        this.hintUsed = false;
        this.previousStory = ""; // Almacena la historia anterior para dar contexto a la IA
        this.currentSymbols = this.symbols; // Símbolos actuales, se actualizarán con la IA.
        
        // Definición de capítulos con descripciones iniciales
        this.chapters = {
            1: {
                title: "Capítulo 1: El Bosque Encantado",
                description: "Has llegado al Bosque Encantado. Los símbolos mágicos están dispersos y debes encontrar las conexiones entre ellos para avanzar."
            },
            2: {
                title: "Capítulo 2: La Montaña de Cristal",
                description: "Has ascendido a la Montaña de Cristal, donde los símbolos brillan con una luz especial. La magia es más fuerte aquí."
            },
            3: {
                title: "Capítulo 3: El Templo Perdido",
                description: "Has descubierto el antiguo Templo Perdido. Aquí los símbolos guardan secretos milenarios que podrían cambiar el destino del reino."
            },
            4: {
                title: "Capítulo 4: El Reino de las Sombras",
                description: "Has cruzado al Reino de las Sombras, donde la oscuridad desafía tu habilidad para encontrar los símbolos ocultos."
            },
            5: {
                title: "Capítulo 5: La Confrontación Final",
                description: "Has llegado al corazón del mal. Aquí debes usar todo lo aprendido para encontrar los últimos símbolos y salvar el reino."
            }
        };

        this.init();
    }

    async init() {
        this.createFloatingParticles();
        this.updateChapterInfo();
        this.setupEventListeners();
        this.showWelcomeToast();
        // Detiene la voz cuando la página se recarga o se cierra
        window.addEventListener('beforeunload', () => {
            window.speechSynthesis.cancel();
        });

        // Genera el contenido inicial (historia y símbolos)
        await this.generateGameContent();
    }

    createFloatingParticles() {
        const particles = document.getElementById('particles');
        const particleSymbols = ['✨', '🌟', '💫', '⭐', '🔮', '💎'];
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
            particles.appendChild(particle);
        }
    }

    showWelcomeToast() {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.innerHTML = `
            <div class="toast show" role="alert">
                <div class="toast-header bg-primary text-white">
                    <i class="fas fa-magic me-2"></i>
                    <strong class="me-auto">¡Bienvenido Explorador!</strong>
                </div>
                <div class="toast-body bg-dark text-white">
                    Tu aventura ha comenzado. ¡Encuentra los símbolos mágicos!
                </div>
            </div>
        `;
        document.body.appendChild(toastContainer);
        
        setTimeout(() => {
            toastContainer.remove();
        }, 5000);
    }

    setupEventListeners() {
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('next-btn').addEventListener('click', () => this.nextRound());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartChapter());
        document.getElementById('continue-btn').addEventListener('click', () => this.nextChapter());
    }

    updateChapterInfo() {
        const chapter = this.chapters[this.currentChapter];
        document.getElementById('chapter-title').innerHTML = `
            <i class="fas fa-book-open me-2"></i>
            ${chapter.title}
        `;
        document.getElementById('chapter-description').textContent = chapter.description;
        
        const progressPercent = (this.chapterProgress / this.maxProgress) * 100;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;
        document.getElementById('progress-text').textContent = `${this.chapterProgress}/${this.maxProgress}`;
    }

    generateCards(symbols) {
        const card1 = document.getElementById('card1');
        const card2 = document.getElementById('card2');
        
        card1.innerHTML = '';
        card2.innerHTML = '';

        // Aseguramos que haya al menos 15 símbolos para la generación de cartas
        const gameSymbols = symbols.length >= 15 ? symbols.slice(0, 15) : this.symbols;

        const commonSymbol = gameSymbols[Math.floor(Math.random() * gameSymbols.length)];
        const shuffledSymbols = [...gameSymbols].filter(s => s !== commonSymbol).sort(() => Math.random() - 0.5);

        const card1Symbols = [commonSymbol, ...shuffledSymbols.slice(0, 7)];
        const card2Symbols = [commonSymbol, ...shuffledSymbols.slice(7, 14)];

        card1Symbols.sort(() => Math.random() - 0.5);
        card2Symbols.sort(() => Math.random() - 0.5);

        this.renderCard(card1, card1Symbols, commonSymbol);
        this.renderCard(card2, card2Symbols, commonSymbol);

        this.commonSymbol = commonSymbol;
        this.hintUsed = false;
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
    }

    renderCard(cardElement, symbols, commonSymbol) {
        symbols.forEach(symbol => {
            const symbolElement = document.createElement('div');
            symbolElement.className = 'symbol';
            symbolElement.textContent = symbol;
            symbolElement.addEventListener('click', () => this.checkSymbol(symbol, symbolElement));
            cardElement.appendChild(symbolElement);
        });
    }

    checkSymbol(symbol, element) {
        if (symbol === this.commonSymbol) {
            this.foundMatch(element);
        } else {
            this.wrongMatch(element);
        }
    }

    foundMatch(element) {
        element.classList.add('matched');
        document.querySelectorAll('.symbol').forEach(sym => {
            if (sym.textContent === this.commonSymbol) {
                sym.classList.add('matched');
            }
        });
        
        document.getElementById('card1').classList.add('found-match');
        document.getElementById('card2').classList.add('found-match');
        
        this.matches++;
        this.chapterProgress++;
        this.score += this.hintUsed ? 50 : 100;
        
        this.updateStats();
        this.updateChapterInfo();
        this.showSuccessMessage();
        this.createSuccessEffect();
        
        setTimeout(() => {
            if (this.chapterProgress >= this.maxProgress) {
                this.completeChapter();
            } else {
                document.getElementById('next-btn').disabled = false;
            }
        }, 1500);
    }

    wrongMatch(element) {
        element.style.background = '#ff4757';
        element.style.color = 'white';
        element.style.transform = 'scale(1.2) rotate(-5deg)';
        
        element.style.animation = 'shake 0.5s';
        
        setTimeout(() => {
            element.style.background = '';
            element.style.color = '';
            element.style.transform = '';
            element.style.animation = '';
        }, 500);

        this.showToast('¡Intento fallido!', 'Ese no es el símbolo correcto.', 'error');
    }

    createSuccessEffect() {
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.innerHTML = '🎉';
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.fontSize = '20px';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.animation = `fall ${Math.random() * 2 + 2}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }
    }

    showHint() {
        document.querySelectorAll('.symbol').forEach(sym => {
            if (sym.textContent === this.commonSymbol) {
                sym.style.background = 'rgba(255, 215, 0, 0.6)';
                sym.style.transform = 'scale(1.2)';
                sym.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
                sym.style.border = '2px solid #ffd700';
            }
        });
        
        this.hintUsed = true;
        document.getElementById('hint-btn').disabled = true;
        
        this.showToast('� Pista Activada', 'Los símbolos dorados son las coincidencias', 'warning');
        
        setTimeout(() => {
            document.querySelectorAll('.symbol').forEach(sym => {
                if (!sym.classList.contains('matched')) {
                    sym.style.background = '';
                    sym.style.transform = '';
                    sym.style.boxShadow = '';
                    sym.style.border = '';
                }
            });
        }, 3000);
    }

    showSuccessMessage() {
        const messages = [
            "¡Excelente! Has encontrado la conexión mágica. Los antiguos símbolos responden a tu sabiduría.",
            "¡Increíble! Los símbolos revelan sus secretos ante ti. Tu poder de observación es excepcional.",
            "¡Fantástico! Tu habilidad para descifrar los misterios ancestrales te acerca a la victoria.",
            "¡Maravilloso! Los guardianes de los símbolos te reconocen como un verdadero explorador.",
            "¡Extraordinario! Tu destino como salvador del reino se va cumpliendo paso a paso."
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.updateStoryText(randomMessage);
        
        const storyCard = document.querySelector('.story-card');
        storyCard.style.background = 'linear-gradient(135deg, rgba(0, 255, 0, 0.3) 0%, rgba(0, 200, 0, 0.2) 100%)';
        storyCard.style.borderLeft = '4px solid #00ff00';
        
        this.showToast('🎉 ¡Coincidencia Encontrada!', 'Has ganado ' + (this.hintUsed ? '50' : '100') + ' puntos', 'success');
        
        setTimeout(() => {
            storyCard.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)';
            storyCard.style.borderLeft = '4px solid #ffd700';
        }, 2000);
    }

    async generateGameContent() {
        const storyTextElement = document.getElementById('story-text');
        storyTextElement.textContent = "Generando nueva historia y símbolos... por favor espera."; // Mensaje de carga
        const chapter = this.chapters[this.currentChapter];

        const prompt = `Eres un narrador para un juego de aventura de fantasía. El héroe está en el "${chapter.title}" y la descripción del lugar es: "${chapter.description}". El objetivo es que el héroe encuentre símbolos mágicos. La historia debe ser concisa, en español, con un tono épico y motivador. El héroe ya ha encontrado ${this.chapterProgress} de los ${this.maxProgress} símbolos en este capítulo.
        
        Después de contar la historia, proporciona una lista de 15 emojis que se relacionen con la historia para ser utilizados como símbolos del juego.
        
        Devuelve tu respuesta como un objeto JSON con las siguientes claves:
        - "story": La historia generada.
        - "symbols": Una lista de 15 emojis.

        El texto debe empezar directamente con la historia, sin ningún preámbulo.`;
        
        const apiKey = "AIzaSyCvWpG0ERYrmU8FmtKNVlufxCxdH2iyBC4";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                const payload = {
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                "story": { "type": "STRING" },
                                "symbols": {
                                    "type": "ARRAY",
                                    "items": { "type": "STRING" }
                                }
                            }
                        }
                    }
                };

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (jsonText) {
                    try {
                        const parsedJson = JSON.parse(jsonText);
                        this.updateStoryText(parsedJson.story);
                        this.previousStory = parsedJson.story;
                        this.currentSymbols = parsedJson.symbols;
                        this.generateCards(this.currentSymbols);
                        return; // Salir del bucle si es exitoso
                    } catch (e) {
                        console.error('Error al parsear el JSON:', e);
                        storyTextElement.textContent = "Hubo un error al generar la historia. ¡Pero tu aventura continúa!";
                        this.generateCards(this.symbols); // Vuelve a los símbolos por defecto
                        return;
                    }
                } else {
                    storyTextElement.textContent = "Hubo un error al generar la historia. ¡Pero tu aventura continúa!";
                    this.generateCards(this.symbols);
                    return;
                }
            } catch (error) {
                console.error('Error al llamar a la API de Gemini:', error);
                retries++;
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000)); // Backoff exponencial
            }
        }
        
        storyTextElement.textContent = "Hubo un error al generar la historia después de varios intentos. ¡Pero tu aventura continúa!";
        this.generateCards(this.symbols); // Fallback a símbolos por defecto
    }
    
    updateStoryText(text) {
        document.getElementById('story-text').textContent = text;
    }

    showToast(title, message, type = 'info') {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        
        let bgClass = '';
        switch (type) {
            case 'success':
                bgClass = 'bg-success';
                break;
            case 'warning':
                bgClass = 'bg-warning';
                break;
            case 'error':
                bgClass = 'bg-danger';
                break;
            default:
                bgClass = 'bg-info';
                break;
        }
        
        toastContainer.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header ${bgClass} text-white">
                    <strong class="me-auto">${title}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body bg-dark text-white">
                    ${message}
                </div>
            </div>
        `;
        
        document.body.appendChild(toastContainer);
        
        setTimeout(() => {
            toastContainer.remove();
        }, 4000);
    }

    async nextRound() {
        document.getElementById('card1').classList.remove('found-match');
        document.getElementById('card2').classList.remove('found-match');
        document.getElementById('next-btn').disabled = true;
        
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
            card.style.transform = 'scale(0)';
            card.style.opacity = '0';
        });
        
        setTimeout(async () => {
            await this.generateGameContent();
            
            cards.forEach(card => {
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
                card.style.transition = 'all 0.5s ease';
            });
        }, 300);
    }

    completeChapter() {
        const modalElement = document.getElementById('completion-modal');
        const modal = new bootstrap.Modal(modalElement);
        const finalScore = document.getElementById('final-score');
        
        finalScore.textContent = this.score;
        
        if (this.currentChapter >= 5) {
            document.getElementById('modal-title').innerHTML = `
                <i class="fas fa-crown me-2"></i>
                ¡AVENTURA COMPLETADA!
            `;
            document.getElementById('modal-text').textContent = '¡Felicitaciones! Has salvado el reino y te has convertido en una leyenda. Tu nombre será recordado por siempre como el Gran Explorador de Símbolos.';
            document.getElementById('continue-btn').innerHTML = `
                <i class="fas fa-trophy me-2"></i>
                Finalizar Aventura
            `;
            document.getElementById('continue-btn').onclick = () => this.restartGame();
        } else {
            document.getElementById('modal-title').innerHTML = `
                <i class="fas fa-medal me-2"></i>
                ¡Capítulo Completado!
            `;
            document.getElementById('modal-text').textContent = `Has completado ${this.chapters[this.currentChapter].title}. Tu aventura continúa hacia nuevos desafíos más emocionantes.`;
        }
        
        modal.show();
        this.createSuccessEffect();
    }

    async nextChapter() {
        this.currentChapter++;
        this.chapterProgress = 0;
        this.matches = 0;
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('completion-modal'));
        if (modal) modal.hide();
        
        document.body.style.animation = 'fadeIn 1s ease-in-out';
        
        setTimeout(async () => {
            this.updateChapterInfo();
            this.updateStats();
            await this.generateGameContent();
            document.body.style.animation = '';
            
            this.showToast('🌟 Nuevo Capítulo', `¡Bienvenido a ${this.chapters[this.currentChapter].title}!`, 'info');
        }, 500);
    }

    restartChapter() {
        const confirmModalElement = document.createElement('div');
        confirmModalElement.className = 'modal fade';
        confirmModalElement.id = 'restart-confirm-modal';
        confirmModalElement.setAttribute('tabindex', '-1');
        confirmModalElement.setAttribute('aria-hidden', 'true');
        
        confirmModalElement.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                            Confirmar Reinicio
                        </h5>
                    </div>
                    <div class="modal-body">
                        ¿Estás seguro de que quieres reiniciar el capítulo? Perderás 50 puntos y tu progreso actual.
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="confirm-restart-btn">
                            <i class="fas fa-redo me-2"></i>Reiniciar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModalElement);
        const modal = new bootstrap.Modal(confirmModalElement);
        modal.show();
        
        document.getElementById('confirm-restart-btn').addEventListener('click', () => {
            this.chapterProgress = 0;
            this.score = Math.max(0, this.score - 50);
            this.matches = 0;
            
            this.updateChapterInfo();
            this.updateStats();
            this.generateCards(this.symbols);
            
            document.getElementById('next-btn').disabled = true;
            
            modal.hide();
            confirmModalElement.remove();
            
            this.showToast('🔄 Capítulo Reiniciado', 'Has perdido 50 puntos. ¡Inténtalo de nuevo!', 'warning');
        });
    }

    async restartGame() {
        this.currentChapter = 1;
        this.chapterProgress = 0;
        this.score = 0;
        this.matches = 0;
        this.previousStory = "";
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('completion-modal'));
        if (modal) modal.hide();
        
        this.updateChapterInfo();
        this.updateStats();
        await this.generateGameContent();
        
        this.showToast('🎮 Nueva Aventura', '¡Tu épica aventura comienza de nuevo!', 'info');
    }

    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('matches').textContent = this.matches;
        
        document.querySelectorAll('.stat-card').forEach(card => {
            card.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                card.style.animation = '';
            }, 300);
        });
    }
}

// Función global para el botón de leer texto, como está en tu HTML
function leerTexto() {
    const texto = document.getElementById("story-text").textContent;
    const speech = new SpeechSynthesisUtterance(texto);
    speech.lang = "es-ES";
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}

// Agregar estilos adicionales para animaciones
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes fall {
        0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(additionalStyles);

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.game = new DobbleStoryMode();
});
