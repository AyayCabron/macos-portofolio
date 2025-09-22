document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const loaderDot = document.querySelector('.loader-pulse-dot');

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

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) themeToggleBtn.style.display = 'none';

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

    const windows = document.querySelectorAll('.window');
    const dockItems = document.querySelectorAll('.dock-item');
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    const closeButtons = document.querySelectorAll('.window-button.close-btn');


    windows.forEach(win => gsap.set(win, { scale: 0.8, opacity: 0, display: 'none' }));

    gsap.from('.desktop-icon', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 });

    const openWindow = (targetId) => {
        const targetWindow = document.getElementById(targetId);
        if (!targetWindow) return;

        windows.forEach(win => {
            if (win.id !== targetId && win.style.display === 'block') {
                gsap.to(win, { scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => win.style.display = 'none' });
            }
        });

        gsap.to(targetWindow, {
            display: 'block',
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            onComplete: () => {
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

    const closeWindow = (targetId) => {
        const targetWindow = document.getElementById(targetId);
        if (!targetWindow) return;

        gsap.to(targetWindow, { scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => targetWindow.style.display = 'none' });
    };

    dockItems.forEach(item => item.addEventListener('click', () => openWindow(item.dataset.target)));
    desktopIcons.forEach(icon => icon.addEventListener('click', () => openWindow(icon.id.replace('-icon', '-window'))));

    // Eventos de fechamento
    closeButtons.forEach(btn => btn.addEventListener('click', () => closeWindow(btn.dataset.target)));

    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        Draggable.create(win, { trigger: header, bounds: "main", edgeResistance: 0.65, type: "x,y", throwProps: true });
    });

    document.querySelectorAll('.open-notes').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openWindow('notes-window');
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const snakeCanvas = document.getElementById('snake-canvas');
    const snakeScore = document.getElementById('snake-score');
    const snakeLevel = document.getElementById('snake-level');
    const snakeStart = document.getElementById('snake-start');
    const snakeRestart = document.getElementById('snake-restart');
    const snakeMessage = document.getElementById('snake-message');
    const controlButtons = document.querySelectorAll('.control-btn');

    let snakeGame = {
        ctx: snakeCanvas.getContext('2d'),
        gridSize: 20,
        snake: [],
        direction: 'right',
        nextDirection: 'right',
        food: {},
        score: 0,
        level: 1,
        gameSpeed: 150,
        gameInterval: null,
        isRunning: false,
        cellCount: snakeCanvas.width / 20
    };

    function initSnakeGame() {
        snakeGame.ctx = snakeCanvas.getContext('2d');
        snakeGame.cellCount = snakeCanvas.width / snakeGame.gridSize;

        resetSnakeGame();

        window.addEventListener('keydown', function(e) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();

                if (!snakeGame.isRunning && e.key === 'ArrowUp') {
                    startSnakeGame();
                    return;
                }

                if (e.key === 'ArrowUp' && snakeGame.direction !== 'down') {
                    snakeGame.nextDirection = 'up';
                } else if (e.key === 'ArrowDown' && snakeGame.direction !== 'up') {
                    snakeGame.nextDirection = 'down';
                } else if (e.key === 'ArrowLeft' && snakeGame.direction !== 'right') {
                    snakeGame.nextDirection = 'left';
                } else if (e.key === 'ArrowRight' && snakeGame.direction !== 'left') {
                    snakeGame.nextDirection = 'right';
                }
            }
        });

        snakeStart.addEventListener('click', startSnakeGame);
        snakeRestart.addEventListener('click', resetSnakeGame);

        controlButtons.forEach(button => {
            button.addEventListener('click', function() {
                const direction = this.getAttribute('data-direction');

                if (!snakeGame.isRunning && direction === 'ArrowUp') {
                    startSnakeGame();
                    return;
                }

                if (direction === 'ArrowUp' && snakeGame.direction !== 'down') {
                    snakeGame.nextDirection = 'up';
                } else if (direction === 'ArrowDown' && snakeGame.direction !== 'up') {
                    snakeGame.nextDirection = 'down';
                } else if (direction === 'ArrowLeft' && snakeGame.direction !== 'right') {
                    snakeGame.nextDirection = 'left';
                } else if (direction === 'ArrowRight' && snakeGame.direction !== 'left') {
                    snakeGame.nextDirection = 'right';
                }
            });
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                snakeCanvas.width = 300;
                snakeCanvas.height = 300;
                snakeGame.gridSize = 15;
                snakeGame.cellCount = snakeCanvas.width / snakeGame.gridSize;
            } else {
                snakeCanvas.width = 400;
                snakeCanvas.height = 400;
                snakeGame.gridSize = 20;
                snakeGame.cellCount = snakeCanvas.width / snakeGame.gridSize;
            }

            if (snakeGame.isRunning) {
                drawGame();
            }
        });
    }

    function resetSnakeGame() {
        clearInterval(snakeGame.gameInterval);

        snakeGame.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];

        snakeGame.direction = 'right';
        snakeGame.nextDirection = 'right';
        snakeGame.score = 0;
        snakeGame.level = 1;
        snakeGame.gameSpeed = 150;
        snakeGame.isRunning = false;

        snakeScore.textContent = '0';
        snakeLevel.textContent = '1';
        snakeMessage.textContent = 'Clique em Start para iniciar';

        generateFood();
        drawGame();
    }

    function startSnakeGame() {
        if (snakeGame.isRunning) return;

        snakeGame.isRunning = true;
        snakeMessage.textContent = '';

        snakeGame.gameInterval = setInterval(gameLoop, snakeGame.gameSpeed);
    }

    function gameLoop() {
        moveSnake();

        if (checkCollision()) {
            gameOver();
            return;
        }

        if (checkFoodCollision()) {
            eatFood();
            generateFood();
        }

        drawGame();
    }

    function moveSnake() {
        snakeGame.direction = snakeGame.nextDirection;

        const head = { ...snakeGame.snake[0] };

        switch (snakeGame.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (head.x < 0) head.x = snakeGame.cellCount - 1;
        if (head.x >= snakeGame.cellCount) head.x = 0;
        if (head.y < 0) head.y = snakeGame.cellCount - 1;
        if (head.y >= snakeGame.cellCount) head.y = 0;

        snakeGame.snake.unshift(head);

        if (!snakeGame.justAte) {
            snakeGame.snake.pop();
        } else {
            snakeGame.justAte = false;
        }
    }

    function checkCollision() {
        const head = snakeGame.snake[0];

        for (let i = 1; i < snakeGame.snake.length; i++) {
            if (head.x === snakeGame.snake[i].x && head.y === snakeGame.snake[i].y) {
                return true;
            }
        }

        return false;
    }

    function checkFoodCollision() {
        const head = snakeGame.snake[0];
        return head.x === snakeGame.food.x && head.y === snakeGame.food.y;
    }

    function eatFood() {
        snakeGame.score += 10 * snakeGame.level;
        snakeScore.textContent = snakeGame.score;

        snakeGame.justAte = true;

        if (snakeGame.score % 100 === 0) {
            snakeGame.level++;
            snakeLevel.textContent = snakeGame.level;

            clearInterval(snakeGame.gameInterval);
            snakeGame.gameSpeed = Math.max(50, 150 - (snakeGame.level - 1) * 10);
            snakeGame.gameInterval = setInterval(gameLoop, snakeGame.gameSpeed);
        }
    }

    function generateFood() {
        let newFood;
        let isOnSnake;

        do {
            isOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * snakeGame.cellCount),
                y: Math.floor(Math.random() * snakeGame.cellCount)
            };

            for (let segment of snakeGame.snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    isOnSnake = true;
                    break;
                }
            }
        } while (isOnSnake);

        snakeGame.food = newFood;
    }

    function drawGame() {
        snakeGame.ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);

        // fundo quadriculado
        snakeGame.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let x = 0; x < snakeGame.cellCount; x++) {
            for (let y = 0; y < snakeGame.cellCount; y++) {
                if ((x + y) % 2 === 0) {
                    snakeGame.ctx.fillRect(
                        x * snakeGame.gridSize,
                        y * snakeGame.gridSize,
                        snakeGame.gridSize,
                        snakeGame.gridSize
                    );
                }
            }
        }

        // comida
        snakeGame.ctx.fillStyle = '#27ca3f';
        snakeGame.ctx.fillRect(
            snakeGame.food.x * snakeGame.gridSize,
            snakeGame.food.y * snakeGame.gridSize,
            snakeGame.gridSize,
            snakeGame.gridSize
        );

        // cobra
        for (let i = 0; i < snakeGame.snake.length; i++) {
            const segment = snakeGame.snake[i];

            if (i === 0) {
                snakeGame.ctx.fillStyle = '#0A84FF';
            } else {
                const intensity = 255 - Math.min(100, i * 3);
                snakeGame.ctx.fillStyle = `rgb(10, 132, ${intensity})`;
            }

            snakeGame.ctx.fillRect(
                segment.x * snakeGame.gridSize,
                segment.y * snakeGame.gridSize,
                snakeGame.gridSize - 1,
                snakeGame.gridSize - 1
            );
        }
    }

    function gameOver() {
        clearInterval(snakeGame.gameInterval);
        snakeGame.isRunning = false;

        snakeMessage.textContent = `Game Over! Score: ${snakeGame.score}`;

        snakeGame.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        snakeGame.ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

        snakeGame.ctx.fillStyle = 'white';
        snakeGame.ctx.font = '20px Inter';
        snakeGame.ctx.textAlign = 'center';
        snakeGame.ctx.fillText('GAME OVER', snakeCanvas.width / 2, snakeCanvas.height / 2 - 20);
        snakeGame.ctx.fillText(`Score: ${snakeGame.score}`, snakeCanvas.width / 2, snakeCanvas.height / 2 + 10);
        snakeGame.ctx.fillText('Click Start to play again', snakeCanvas.width / 2, snakeCanvas.height / 2 + 40);
    }

    initSnakeGame();
});

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

    initDock();
    initMissionControl();
    makeWindowsResizable();
    initSpotlightSearch();
    initEasterEggs();

    windows.forEach(win => {
        win.addEventListener('mousedown', () => bringWindowToFront(win));
    });

    setTimeout(() => {
        showNotification('Bem-vindo ao meu Portfolio!', 'Explore as funcionalidades usando o Dock e o Spotlight Search', 'fa-info-circle');
    }, 2000);
}
