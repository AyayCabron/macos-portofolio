// --- Lógica da Tela de Carregamento (Splash Screen) ---
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const loaderDot = document.querySelector('.loader-pulse-dot');

    // Força o tema escuro
    document.documentElement.setAttribute('data-theme', 'dark');

    if (loadingScreen && loaderDot) {
        loaderDot.addEventListener('animationend', (event) => {
            if (event.animationName === 'fadeInPulse') {
                loaderDot.classList.add('expand');
                loaderDot.addEventListener('animationend', () => {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.remove();
                        initApp();
                    }, 600);
                }, { once: true });
            }
        }, { once: true });
    } else {
        initApp();
    }
});

function initApp() {
    gsap.registerPlugin(Draggable);

    // Remove botão de alternar tema
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) themeToggleBtn.style.display = 'none';

    // --- Relógio ---
    const timeElement = document.getElementById('current-time');
    function updateTime() {
        if (timeElement) {
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            timeElement.textContent = now.toLocaleDateString('pt-BR', options);
        }
    }
    setInterval(updateTime, 1000);
    updateTime();

    // --- Janelas e Dock ---
    const windows = document.querySelectorAll('.window');
    const dockItems = document.querySelectorAll('.dock-item');
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    const closeButtons = document.querySelectorAll('.window-button.close-btn');

    // Inicializa janelas invisíveis
    windows.forEach(win => gsap.set(win, { scale: 0.8, opacity: 0, display: 'none' }));

    // Animação dos ícones do desktop
    gsap.from('.desktop-icon', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 });

    // Função unificada para abrir janelas
    const openWindow = (targetId) => {
        const targetWindow = document.getElementById(targetId);
        if (!targetWindow) return;

        // Fecha outras janelas abertas
        windows.forEach(win => {
            if (win.id !== targetId && win.style.display === 'block') {
                gsap.to(win, { scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => win.style.display = 'none' });
            }
        });

        // Abre a janela selecionada
        gsap.to(targetWindow, {
            display: 'block',
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            onComplete: () => {
                // Se for a janela de tech, anima as barras
                if (targetId === 'tech-window') {
                    const techBars = targetWindow.querySelectorAll('.tech-level-bar');
                    techBars.forEach(bar => {
                        const width = bar.style.width;
                        bar.style.width = '0%';
                        setTimeout(() => bar.style.width = width, 100);
                    });
                }
            }
        });
    };

    // Função para fechar janelas
    const closeWindow = (targetId) => {
        const targetWindow = document.getElementById(targetId);
        if (!targetWindow) return;

        gsap.to(targetWindow, { scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => targetWindow.style.display = 'none' });
    };

    // Eventos de abertura
    dockItems.forEach(item => item.addEventListener('click', () => openWindow(item.dataset.target)));
    desktopIcons.forEach(icon => icon.addEventListener('click', () => openWindow(icon.id.replace('-icon', '-window'))));

    // Eventos de fechamento
    closeButtons.forEach(btn => btn.addEventListener('click', () => closeWindow(btn.dataset.target)));

    // Torna janelas arrastáveis
    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        Draggable.create(win, { trigger: header, bounds: "main", edgeResistance: 0.65, type: "x,y", throwProps: true });
    });

    // Abre o Notes a partir do link de currículo
    document.querySelectorAll('.open-notes').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openWindow('notes-window');
        });
    });
}

// --- Snake Game (Versão Melhorada) ---
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');

// Sons
const eatSound = new Howl({ src: ['https://assets.codepen.io/21542/howler-demo-bgms.mp3'] });
const gameOverSound = new Howl({ src: ['https://assets.codepen.io/21542/howler-demo-sfx.mp3'] });

let snake = [];
let direction = null;
let food = {};
let score = 0;
let level = 1;
let gameInterval = null;
let gameStarted = false;

const cellSize = 20;
const rows = canvas.height / cellSize;
const cols = canvas.width / cellSize;

// Cores do tema
const gridColor = 'rgba(255, 255, 255, 0.05)';
const snakeHeadColor = '#4CAF50';
const snakeBodyColor = '#66BB6A';
const foodColor = '#FF5252';
const backgroundColor = 'rgba(15, 15, 15, 0.9)';

// Inicializa o jogo
function initSnakeGame() {
    snake = [
        {x: 10, y: 10, type: 'head'},
        {x: 9, y: 10, type: 'body'},
        {x: 8, y: 10, type: 'body'}
    ];
    direction = null;
    placeFood();
    score = 0;
    level = 1;
    gameStarted = false;
    
    document.getElementById('snake-score').innerText = score;
    document.getElementById('snake-level').innerText = level;
    document.getElementById('snake-message').style.display = 'block';
    
    if (gameInterval) clearInterval(gameInterval);
    drawSnakeGame();
}

// Coloca a comida em posição aleatória
function placeFood() {
    let validPosition = false;
    while (!validPosition) {
        food = { 
            x: Math.floor(Math.random() * cols), 
            y: Math.floor(Math.random() * rows),
            type: Math.random() > 0.9 ? 'special' : 'normal'
        };
        
        // Verifica se a comida não está em cima da cobra
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

// Desenha o jogo
function drawSnakeGame() {
    // Limpa o canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenha grade
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
    
    // Desenha comida
    if (food.type === 'special') {
        // Comida especial (brilha)
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(food.x * cellSize + cellSize/2, food.y * cellSize + cellSize/2, cellSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FFC107';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(food.x * cellSize + cellSize/2, food.y * cellSize + cellSize/2, cellSize/2 + 2, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Comida normal
        ctx.fillStyle = foodColor;
        ctx.beginPath();
        ctx.arc(food.x * cellSize + cellSize/2, food.y * cellSize + cellSize/2, cellSize/2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Desenha cobra
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Cabeça
            ctx.fillStyle = snakeHeadColor;
        } else {
            // Corpo
            ctx.fillStyle = snakeBodyColor;
        }
        
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
        
        // Detalhes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        if (index === 0) {
            // Olhos
            const eyeSize = cellSize / 5;
            const offset = cellSize / 3;
            
            // Direção dos olhos
            let eyeX1, eyeY1, eyeX2, eyeY2;
            
            if (direction === "ArrowRight") {
                eyeX1 = eyeX2 = segment.x * cellSize + cellSize - offset;
                eyeY1 = segment.y * cellSize + offset;
                eyeY2 = segment.y * cellSize + cellSize - offset;
            } else if (direction === "ArrowLeft") {
                eyeX1 = eyeX2 = segment.x * cellSize + offset;
                eyeY1 = segment.y * cellSize + offset;
                eyeY2 = segment.y * cellSize + cellSize - offset;
            } else if (direction === "ArrowUp") {
                eyeY1 = eyeY2 = segment.y * cellSize + offset;
                eyeX1 = segment.x * cellSize + offset;
                eyeX2 = segment.x * cellSize + cellSize - offset;
            } else if (direction === "ArrowDown") {
                eyeY1 = eyeY2 = segment.y * cellSize + cellSize - offset;
                eyeX1 = segment.x * cellSize + offset;
                eyeX2 = segment.x * cellSize + cellSize - offset;
            } else {
                // Olhos centrados se não houver direção
                eyeX1 = segment.x * cellSize + offset;
                eyeX2 = segment.x * cellSize + cellSize - offset;
                eyeY1 = eyeY2 = segment.y * cellSize + cellSize / 2;
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
            ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Detalhes do corpo
            ctx.fillRect(segment.x * cellSize + 4, segment.y * cellSize + 4, cellSize - 8, cellSize - 8);
        }
    });
    
    if (!gameStarted || !direction) return;
    
    // Move cobra
    const head = {...snake[0]};
    if (direction === "ArrowUp") head.y--;
    if (direction === "ArrowDown") head.y++;
    if (direction === "ArrowLeft") head.x--;
    if (direction === "ArrowRight") head.x++;
    head.type = 'head';
    snake[0].type = 'body';
    
    // Verifica colisão
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || 
        snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Verifica se comeu a comida
    if (head.x === food.x && head.y === food.y) {
        // eatSound.play();
        score += (food.type === 'special') ? 5 : 1;
        
        if (score % 10 === 0) {
            level++;
            // Aumenta a velocidade a cada nível
            clearInterval(gameInterval);
            const speed = Math.max(50, 150 - (level * 5));
            gameInterval = setInterval(drawSnakeGame, speed);
        }
        
        document.getElementById('snake-score').innerText = score;
        document.getElementById('snake-level').innerText = level;
        placeFood();
    } else {
        snake.pop();
    }
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    // gameOverSound.play();
    
    // Efeito de game over
    let opacity = 0;
    const gameOverInterval = setInterval(() => {
        ctx.fillStyle = `rgba(244, 67, 54, ${opacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = '30px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        ctx.font = '16px Inter';
        ctx.fillText(`Score: ${score} | Level: ${level}`, canvas.width/2, canvas.height/2 + 40);
        
        opacity += 0.02;
        if (opacity >= 0.7) {
            clearInterval(gameOverInterval);
            
            // Botão de restart
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(canvas.width/2 - 50, canvas.height/2 + 70, 100, 40);
            ctx.fillStyle = 'white';
            ctx.font = '16px Inter';
            ctx.fillText('RESTART', canvas.width/2, canvas.height/2 + 95);
            
            // Adiciona evento de clique no botão
            canvas.onclick = (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (x >= canvas.width/2 - 50 && x <= canvas.width/2 + 50 && 
                    y >= canvas.height/2 + 70 && y <= canvas.height/2 + 110) {
                    initSnakeGame();
                    canvas.onclick = null;
                }
            };
        }
    }, 30);
}

// Inicia o jogo
function startSnakeGame() {
    if (!gameStarted) {
        document.getElementById('snake-message').style.display = 'none';
        gameStarted = true;
        if (!direction) direction = "ArrowRight";
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(drawSnakeGame, 150);
    }
}

// Controla a direção da cobra
document.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        const newDirection = e.key;
        if (newDirection === "ArrowUp" && direction !== "ArrowDown") direction = newDirection;
        if (newDirection === "ArrowDown" && direction !== "ArrowUp") direction = newDirection;
        if (newDirection === "ArrowLeft" && direction !== "ArrowRight") direction = newDirection;
        if (newDirection === "ArrowRight" && direction !== "ArrowLeft") direction = newDirection;
        
        if (!gameStarted) {
            startSnakeGame();
        }
    }
});

// Botões de controle
document.getElementById('snake-start').addEventListener('click', startSnakeGame);
document.getElementById('snake-restart').addEventListener('click', initSnakeGame);

// Inicializa o jogo quando a janela é aberta
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o jogo apenas se o canvas existir
    if (document.getElementById('snake-canvas')) {
        initSnakeGame();
    }
});

// --- Dock Interativo ---
function initDock() {
    const dockItems = document.querySelectorAll('.dock-item');
    
    dockItems.forEach(item => {
        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'dock-tooltip';
        const targetId = item.dataset.target;
        const targetWindow = document.getElementById(targetId);
        if (targetWindow) {
            const title = targetWindow.querySelector('.window-title span').textContent;
            tooltip.textContent = title;
        }
        item.appendChild(tooltip);
        
        // Menu de contexto (botão direito)
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            // Remove qualquer menu anterior
            const existingMenu = document.querySelector('.dock-context-menu');
            if (existingMenu) existingMenu.remove();
            
            // Cria novo menu
            const menu = document.createElement('div');
            menu.className = 'dock-context-menu glassmorphism';
            
            // Adiciona opções
            const options = [
                { text: 'Abrir', action: () => openWindow(item.dataset.target) },
                { text: 'Fechar', action: () => closeWindow(item.dataset.target) },
                { text: 'Minimizar', action: () => minimizeWindow(item.dataset.target) }
            ];
            
            options.forEach(option => {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.textContent = option.text;
                menuItem.addEventListener('click', option.action);
                menu.appendChild(menuItem);
            });
            
            document.body.appendChild(menu);
            
            // Posiciona o menu
            const rect = item.getBoundingClientRect();
            menu.style.left = `${rect.left}px`;
            menu.style.top = `${rect.top - menu.offsetHeight - 10}px`;
            
            // Remove o menu ao clicar em outro lugar
            const removeMenu = () => {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            };
            setTimeout(() => document.addEventListener('click', removeMenu), 100);
        });
    });
}

// Minimizar janela
function minimizeWindow(targetId) {
    const targetWindow = document.getElementById(targetId);
    if (targetWindow && targetWindow.style.display === 'block') {
        gsap.to(targetWindow, {
            y: 1000,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                targetWindow.style.display = 'none';
                targetWindow.style.y = '0';
            }
        });
    }
}

// --- Mission Control ---
function initMissionControl() {
    const missionControlBtn = document.createElement('div');
    missionControlBtn.id = 'mission-control-btn';
    missionControlBtn.innerHTML = '<i class="fa-solid fa-square"></i>';
    missionControlBtn.title = 'Mission Control';
    
    missionControlBtn.addEventListener('click', showMissionControl);
    document.body.appendChild(missionControlBtn);
}

function showMissionControl() {
    // Evita criar múltiplos overlays
    if (document.getElementById('mission-control-overlay')) return;

    // Cria overlay do Mission Control
    const overlay = document.createElement('div');
    overlay.id = 'mission-control-overlay';
    
    // Botão de fechar
    const closeBtn = document.createElement('button');
    closeBtn.id = 'mission-control-close';
    closeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.appendChild(closeBtn);

    // Adiciona miniaturas das janelas
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        if (win.style.display === 'block') {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'window-thumbnail';
            thumbnail.style.backgroundImage = `url(${getWindowThumbnail(win)})`;
            thumbnail.dataset.target = win.id;
            
            thumbnail.addEventListener('click', () => {
                openWindow(win.id);
                overlay.remove();
            });
            
            // Animação ao aparecer
            gsap.from(thumbnail, { scale: 0.8, opacity: 0, duration: 0.4, ease: "power2.out" });
            
            overlay.appendChild(thumbnail);
        }
    });

    // Fecha com Escape
    document.addEventListener('keydown', function escClose(e) {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escClose);
        }
    });

    document.body.appendChild(overlay);
}

function getWindowThumbnail(win) {
    // Em um caso real, você usaria html2canvas ou similar para criar thumbnails
    const colors = {
        'projects-window': '#3498db',
        'contact-window': '#e74c3c',
        'about-window': '#2ecc71',
        'notes-window': '#f39c12',
        'tech-window': '#9b59b6',
        'snake-window': '#1abc9c'
    };
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="${colors[win.id] || '#333'}"/><text x="100" y="75" font-family="Arial" font-size="14" fill="white" text-anchor="middle">${win.querySelector('.window-title span').textContent}</text></svg>`;
}

// --- Redimensionamento de Janelas ---
function makeWindowsResizable() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        // Adiciona alça de redimensionamento
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        win.appendChild(resizeHandle);
        
        // Configura redimensionamento
        Draggable.create(resizeHandle, {
            type: 'top,left',
            onDrag: function() {
                const width = Math.max(300, win.offsetWidth + this.deltaX);
                const height = Math.max(200, win.offsetHeight + this.deltaY);
                
                gsap.set(win, { width: width, height: 'auto' });
                win.style.height = `${height}px`;
            }
        });
    });
}

// --- Spotlight Search ---
function initSpotlightSearch() {
    const searchBtn = document.createElement('div');
    searchBtn.id = 'spotlight-search-btn';
    searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    searchBtn.title = 'Spotlight Search';
    
    searchBtn.addEventListener('click', showSpotlightSearch);
    document.body.appendChild(searchBtn);
}

function showSpotlightSearch() {
    const searchOverlay = document.createElement('div');
    searchOverlay.id = 'spotlight-search-overlay';
    
    // Botão de fechar
    const closeBtn = document.createElement('div');
    closeBtn.id = 'spotlight-search-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = 'white';
    closeBtn.addEventListener('click', () => searchOverlay.remove());
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Spotlight Search';
    searchInput.id = 'spotlight-search-input';
    
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'spotlight-results';
    
    searchOverlay.appendChild(closeBtn);
    searchOverlay.appendChild(searchInput);
    searchOverlay.appendChild(resultsContainer);
    
    searchInput.addEventListener('input', () => {
        performSearch(searchInput.value, resultsContainer, searchOverlay);
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchOverlay.remove();
        }
    });
    
    document.body.appendChild(searchOverlay);
    searchInput.focus();
}

// Atualize performSearch para receber overlay (necessário para fechar ao clicar)
function performSearch(query, resultsContainer, searchOverlay) {
    resultsContainer.innerHTML = '';
    
    if (query.length < 2) return;
    
    const searchData = [
        { title: 'Projetos', type: 'window', id: 'projects-window', category: 'Aplicações' },
        { title: 'Contato', type: 'window', id: 'contact-window', category: 'Aplicações' },
        { title: 'Sobre Mim', type: 'window', id: 'about-window', category: 'Aplicações' },
        { title: 'Currículo', type: 'window', id: 'notes-window', category: 'Documentos' },
        { title: 'Tecnologias', type: 'window', id: 'tech-window', category: 'Aplicações' },
        { title: 'Snake Game', type: 'window', id: 'snake-window', category: 'Jogos' },
        { title: 'AVLIS - PDV', type: 'link', url: 'https://avlis-pdv.onrender.com/', category: 'Projetos' },
        { title: 'LinkedIn', type: 'link', url: 'https://www.linkedin.com/in/viniciuseduardolima/', category: 'Contatos' },
        { title: 'GitHub', type: 'link', url: 'https://github.com/ayaycabron', category: 'Contatos' }
    ];
    
    const results = searchData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result">Nenhum resultado encontrado</div>';
        return;
    }
    
    const groupedResults = {};
    results.forEach(result => {
        if (!groupedResults[result.category]) groupedResults[result.category] = [];
        groupedResults[result.category].push(result);
    });
    
    for (const category in groupedResults) {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'search-category';
        categoryHeader.textContent = category;
        resultsContainer.appendChild(categoryHeader);
        
        groupedResults[category].forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result';
            resultElement.innerHTML = `
                <i class="fa-solid ${result.type === 'window' ? 'fa-window-maximize' : 'fa-link'}"></i>
                <span>${result.title}</span>
            `;
            
            resultElement.addEventListener('click', () => {
                if (result.type === 'window') openWindow(result.id);
                else if (result.type === 'link') window.open(result.url, '_blank');
                
                searchOverlay.remove();
            });
            
            resultsContainer.appendChild(resultElement);
        });
    }
}


// --- Sistema de Notificações ---
function showNotification(title, message, icon = 'fa-bell') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fa-solid ${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close">
            <i class="fa-solid fa-times"></i>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    gsap.fromTo(notification, 
        { x: 300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    
    // Fecha após 5 segundos
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // Botão de fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        closeNotification(notification);
    });
}

function closeNotification(notification) {
    gsap.to(notification, {
        x: 300,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => notification.remove()
    });
}

// --- Easter Eggs ---
function initEasterEggs() {
    // Terminal secreto com atalho Ctrl+Alt+T
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 't') {
            e.preventDefault();
            openTerminal();
        }
        
        // Konami Code
        konamiCodeHandler(e);
    });
    
    // Clique no relógio para mostrar data completa
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.style.cursor = 'pointer';
        timeElement.title = 'Clique para mostrar data completa';
        timeElement.addEventListener('click', () => {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            };
            showNotification('Data e Hora', now.toLocaleDateString('pt-BR', options), 'fa-clock');
        });
    }
}

// Terminal
function openTerminal() {
    const terminalWindow = document.getElementById('terminal-window');
    if (!terminalWindow) {
        createTerminalWindow();
    } else {
        openWindow('terminal-window');
    }
}

function createTerminalWindow() {
    const terminal = document.createElement('div');
    terminal.id = 'terminal-window';
    terminal.className = 'window glassmorphism';
    terminal.innerHTML = `
        <div class="window-header">
            <div class="window-buttons">
                <span class="window-button close-btn" data-target="terminal-window"></span>
                <span class="window-button minimize-btn"></span>
                <span class="window-button maximize-btn"></span>
            </div>
            <div class="window-title">
                <i class="fa-solid fa-terminal"></i>
                <span>Terminal</span>
            </div>
        </div>
        <div class="window-content terminal-content">
            <div class="terminal-output">
                <div>Terminal do Portfolio v1.0</div>
                <div>Digite "help" para ver os comandos disponíveis</div>
            </div>
            <div class="terminal-input">
                <span class="terminal-prompt">$</span>
                <input type="text" class="terminal-command" autofocus>
            </div>
        </div>
    `;
    
    document.body.appendChild(terminal);
    
    // Configura comportamento do terminal
    const commandInput = terminal.querySelector('.terminal-command');
    const outputContainer = terminal.querySelector('.terminal-output');
    
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = commandInput.value.trim();
            commandInput.value = '';
            
            // Adiciona comando ao histórico
            outputContainer.innerHTML += `<div><span class="terminal-prompt">$</span> ${command}</div>`;
            
            // Processa comando
            processTerminalCommand(command, outputContainer);
            
            // Scroll para baixo
            outputContainer.scrollTop = outputContainer.scrollHeight;
        }
    });
    
    // Inicializa a janela
    gsap.set(terminal, { scale: 0.8, opacity: 0, display: 'none' });
    Draggable.create(terminal, {
        trigger: terminal.querySelector('.window-header'),
        bounds: "main",
        edgeResistance: 0.65,
        type: "x,y",
        throwProps: true
    });
    
    // Adiciona ao dock
    addAppToDock('terminal-window', 'fa-terminal', 'Terminal');
}

function processTerminalCommand(command, outputContainer) {
    const commands = {
        'help': () => {
            return `Comandos disponíveis:
- help: Mostra esta ajuda
- clear: Limpa o terminal
- about: Informações sobre o desenvolvedor
- projects: Lista dos projetos
- social: Links para redes sociais
- theme [light|dark]: Altera o tema
- date: Mostra data e hora atual
- echo [texto]: Repete o texto digitado`;
        },
        'clear': () => {
            outputContainer.innerHTML = '';
            return '';
        },
        'about': () => {
            return `Vinícius Silva - Desenvolvedor Full Stack
Desenvolvedor apaixonado por criar soluções digitais
que sejam bonitas, funcionais e intuitivas.`;
        },
        'projects': () => {
            return `Projetos:
- AVLIS-PDV: Sistema de ponto de venda em Electron e Python
- FinanceApp: App de finanças com IA (em desenvolvimento)`;
        },
        'social': () => {
            return `Redes Sociais:
- LinkedIn: https://www.linkedin.com/in/viniciuseduardolima/
- GitHub: https://github.com/ayaycabron`;
        },
        'theme': (args) => {
            if (args[0] === 'light' || args[0] === 'dark') {
                document.documentElement.setAttribute('data-theme', args[0]);
                return `Tema alterado para ${args[0]}`;
            }
            return 'Uso: theme [light|dark]';
        },
        'date': () => {
            return new Date().toLocaleString('pt-BR');
        },
        'echo': (args) => {
            return args.join(' ');
        }
    };
    
    const [cmd, ...args] = command.split(' ');
    const output = commands[cmd] ? commands[cmd](args) : `Comando não encontrado: ${cmd}. Digite "help" para ajuda.`;
    
    if (output) {
        outputContainer.innerHTML += `<div>${output}</div>`;
    }
}

// Konami Code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

function konamiCodeHandler(e) {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join() === konamiSequence.join()) {
        // Ativa easter egg
        document.body.classList.add('konami-mode');
        showNotification('Easter Egg!', 'Konami Code ativado!', 'fa-gamepad');
        
        // Reseta após 10 segundos
        setTimeout(() => {
            document.body.classList.remove('konami-mode');
        }, 10000);
        
        konamiCode = [];
    }
}

// Adiciona app ao dock
function addAppToDock(windowId, icon, title) {
    const dock = document.querySelector('.dock-items');
    const newDockItem = document.createElement('li');
    newDockItem.innerHTML = `<button class="dock-item" data-target="${windowId}"><i class="fa-solid ${icon}"></i></button>`;
    dock.appendChild(newDockItem);
    
    // Re-inicializa o dock
    initDock();
}

// --- Z-index Management ---
function bringWindowToFront(windowElement) {
    const windows = document.querySelectorAll('.window');
    let maxZIndex = 10;
    
    windows.forEach(win => {
        const zIndex = parseInt(win.style.zIndex || 0);
        if (zIndex > maxZIndex) maxZIndex = zIndex;
    });
    
    windowElement.style.zIndex = maxZIndex + 1;
}

// Modifica a função openWindow para gerenciar z-index
const originalOpenWindow = openWindow;
openWindow = function(targetId) {
    const targetWindow = document.getElementById(targetId);
    if (targetWindow) {
        bringWindowToFront(targetWindow);
        originalOpenWindow(targetId);
    }
};

// --- Inicialização Completa ---
function initApp() {
    gsap.registerPlugin(Draggable);

    // Remove botão de alternar tema
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) themeToggleBtn.style.display = 'none';

    // --- Relógio ---
    const timeElement = document.getElementById('current-time');
    function updateTime() {
        if (timeElement) {
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            timeElement.textContent = now.toLocaleDateString('pt-BR', options);
        }
    }
    setInterval(updateTime, 1000);
    updateTime();

    // --- Janelas e Dock ---
    const windows = document.querySelectorAll('.window');
    const dockItems = document.querySelectorAll('.dock-item');
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    const closeButtons = document.querySelectorAll('.window-button.close-btn');

    // Inicializa janelas invisíveis
    windows.forEach(win => gsap.set(win, { scale: 0.8, opacity: 0, display: 'none' }));

    // Animação dos ícones do desktop
    gsap.from('.desktop-icon', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 });

    // Função unificada para abrir janelas
    const openWindow = (targetId) => {
        const targetWindow = document.getElementById(targetId);
        if (!targetWindow) return;

        // Fecha outras janelas abertas
        windows.forEach(win => {
            if (win.id !== targetId && win.style.display === 'block') {
                gsap.to(win, { scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => win.style.display = 'none' });
            }
        });

        // Abre a janela selecionada
        gsap.to(targetWindow, {
            display: 'block',
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            onComplete: () => {
                // Se for a janela de tech, anima as barras
                if (targetId === 'tech-window') {
                    const techBars = targetWindow.querySelectorAll('.tech-level-bar');
                    techBars.forEach(bar => {
                        const width = bar.style.width;
                        bar.style.width = '0%';
                        setTimeout(() => bar.style.width = width, 100);
                    });
                }
                // Se for a janela do snake, inicializa o jogo
                else if (targetId === 'snake-window') {
                    initSnakeGame();
                }
            }
        });
    };

    // Função para fechar janelas
    const closeWindow = (targetId) => {
        const targetWindow = document.getElementById(targetId);
        if (!targetWindow) return;

        gsap.to(targetWindow, { scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => targetWindow.style.display = 'none' });
    };

    // Eventos de abertura
    dockItems.forEach(item => item.addEventListener('click', () => openWindow(item.dataset.target)));
    desktopIcons.forEach(icon => icon.addEventListener('click', () => openWindow(icon.id.replace('-icon', '-window'))));

    // Eventos de fechamento
    closeButtons.forEach(btn => btn.addEventListener('click', () => closeWindow(btn.dataset.target)));

    // Torna janelas arrastáveis
    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        Draggable.create(win, { trigger: header, bounds: "main", edgeResistance: 0.65, type: "x,y", throwProps: true });
    });

    // Abre o Notes a partir do link de currículo
    document.querySelectorAll('.open-notes').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openWindow('notes-window');
        });
    });

    // --- INICIALIZAÇÃO DAS NOVAS FUNCIONALIDADES ---
    initDock();
    initMissionControl();
    makeWindowsResizable();
    initSpotlightSearch();
    initEasterEggs();

    // Adiciona evento de clique para trazer janela para frente
    windows.forEach(win => {
        win.addEventListener('mousedown', () => bringWindowToFront(win));
    });

    // Notificação de boas-vindas
    setTimeout(() => {
        showNotification('Bem-vindo ao meu Portfolio!', 'Explore as funcionalidades usando o Dock e o Spotlight Search', 'fa-info-circle');
    }, 2000);
}
