// ========================================
// Demo 1: Basic Movement Animation
// ========================================
let moveAnimationId = null;
let movePosition = 0;
const box1 = document.getElementById('box1');
const fps1Display = document.getElementById('fps1');

let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

function animateMove(timestamp) {
    // Calculate FPS
    frameCount++;
    if (timestamp - lastFrameTime >= 1000) {
        fps = Math.round(frameCount * 1000 / (timestamp - lastFrameTime));
        fps1Display.textContent = fps;
        frameCount = 0;
        lastFrameTime = timestamp;
    }

    movePosition += 2;
    box1.style.transform = `translateX(${movePosition}px)`;

    if (movePosition < 400) {
        moveAnimationId = requestAnimationFrame(animateMove);
    }
}

document.getElementById('startMove').addEventListener('click', () => {
    if (!moveAnimationId) {
        moveAnimationId = requestAnimationFrame(animateMove);
    }
});

document.getElementById('stopMove').addEventListener('click', () => {
    if (moveAnimationId) {
        cancelAnimationFrame(moveAnimationId);
        moveAnimationId = null;
    }
});

document.getElementById('resetMove').addEventListener('click', () => {
    if (moveAnimationId) {
        cancelAnimationFrame(moveAnimationId);
        moveAnimationId = null;
    }
    movePosition = 0;
    box1.style.transform = 'translateX(0px)';
});

// ========================================
// Demo 2: Easing Functions
// ========================================
const box2 = document.getElementById('box2');
let easingAnimationId = null;

// Easing functions
const easingFunctions = {
    linear: t => t,
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeInOutElastic: t => {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0 : t === 1 ? 1 :
            t < 0.5
                ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },
    easeOutBounce: t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
};

function animateEasing(easingFunc, duration = 1500) {
    const startTime = performance.now();
    const startPos = 0;
    const endPos = 400;

    function step(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunc(progress);

        const currentPos = startPos + (endPos - startPos) * easedProgress;
        box2.style.transform = `translateX(${currentPos}px)`;

        if (progress < 1) {
            easingAnimationId = requestAnimationFrame(step);
        } else {
            // Reset position after animation
            setTimeout(() => {
                box2.style.transform = 'translateX(0px)';
            }, 500);
        }
    }

    if (easingAnimationId) {
        cancelAnimationFrame(easingAnimationId);
    }

    box2.style.transform = 'translateX(0px)';
    easingAnimationId = requestAnimationFrame(step);
}

document.getElementById('easeLinear').addEventListener('click', () => {
    animateEasing(easingFunctions.linear);
});

document.getElementById('easeInOut').addEventListener('click', () => {
    animateEasing(easingFunctions.easeInOutQuad);
});

document.getElementById('easeElastic').addEventListener('click', () => {
    animateEasing(easingFunctions.easeInOutElastic, 2000);
});

document.getElementById('easeBounce').addEventListener('click', () => {
    animateEasing(easingFunctions.easeOutBounce, 1500);
});

// ========================================
// Demo 3: Delta Time (Frame-Independent)
// ========================================
const box3 = document.getElementById('box3');
const deltaTimeDisplay = document.getElementById('deltaTime');
let deltaAnimationId = null;
let deltaPosition = 0;
let deltaLastTime = 0;
const speed = 100; // pixels per second
let isThrottled = false;

function animateDelta(timestamp) {
    if (deltaLastTime === 0) {
        deltaLastTime = timestamp;
    }

    const deltaTime = (timestamp - deltaLastTime) / 1000; // Convert to seconds
    deltaLastTime = timestamp;

    deltaTimeDisplay.textContent = (deltaTime * 1000).toFixed(2);

    deltaPosition += speed * deltaTime;

    if (deltaPosition > 400) {
        deltaPosition = 0;
    }

    box3.style.transform = `translateX(${deltaPosition}px)`;

    if (isThrottled) {
        // Simulate lower FPS by adding delay
        setTimeout(() => {
            deltaAnimationId = requestAnimationFrame(animateDelta);
        }, 50); // ~20 FPS
    } else {
        deltaAnimationId = requestAnimationFrame(animateDelta);
    }
}

document.getElementById('startDelta').addEventListener('click', () => {
    if (!deltaAnimationId) {
        deltaLastTime = 0;
        deltaPosition = 0;
        deltaAnimationId = requestAnimationFrame(animateDelta);
    }
});

document.getElementById('throttleFps').addEventListener('click', () => {
    isThrottled = true;
});

document.getElementById('normalFps').addEventListener('click', () => {
    isThrottled = false;
});

// ========================================
// Demo 4: Multiple Object Animation
// ========================================
const particles = [];
const particleElements = [
    document.getElementById('particle1'),
    document.getElementById('particle2'),
    document.getElementById('particle3'),
    document.getElementById('particle4'),
    document.getElementById('particle5')
];

let particleAnimationId = null;

function initParticles() {
    particles.length = 0;
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: Math.random() * 400,
            y: Math.random() * 250,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            element: particleElements[i]
        });
    }
}

function animateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > 450) {
            p.vx *= -1;
            p.x = Math.max(0, Math.min(450, p.x));
        }
        if (p.y < 0 || p.y > 150) {
            p.vy *= -1;
            p.y = Math.max(0, Math.min(150, p.y));
        }

        p.element.style.transform = `translate(${p.x}px, ${p.y}px)`;
    });

    particleAnimationId = requestAnimationFrame(animateParticles);
}

document.getElementById('startParticles').addEventListener('click', () => {
    if (!particleAnimationId) {
        initParticles();
        particleAnimationId = requestAnimationFrame(animateParticles);
    }
});

document.getElementById('stopParticles').addEventListener('click', () => {
    if (particleAnimationId) {
        cancelAnimationFrame(particleAnimationId);
        particleAnimationId = null;
    }
});

document.getElementById('resetParticles').addEventListener('click', () => {
    if (particleAnimationId) {
        cancelAnimationFrame(particleAnimationId);
        particleAnimationId = null;
    }
    particleElements.forEach(el => {
        el.style.transform = 'translate(0px, 0px)';
    });
});

// ========================================
// Demo 5: Scroll-Linked Animation
// ========================================
const scrollContainer = document.getElementById('scrollContainer');
const scrollBox = document.getElementById('scrollBox');
const scrollPosDisplay = document.getElementById('scrollPos');
let targetScroll = 0;
let currentScroll = 0;
let scrollAnimationId = null;

scrollContainer.addEventListener('scroll', () => {
    targetScroll = scrollContainer.scrollTop;
    scrollPosDisplay.textContent = Math.round(targetScroll);

    if (!scrollAnimationId) {
        scrollAnimationId = requestAnimationFrame(animateScroll);
    }
});

function animateScroll() {
    // Smooth scrolling with linear interpolation (lerp)
    currentScroll += (targetScroll - currentScroll) * 0.1;

    // Apply parallax effect
    const rotation = currentScroll * 0.2;
    const scale = 1 + (currentScroll / 1000);

    scrollBox.style.transform = `
        translateY(${currentScroll * 0.3}px)
        rotate(${rotation}deg)
        scale(${Math.min(scale, 1.5)})
    `;

    // Continue animation if there's still movement
    if (Math.abs(targetScroll - currentScroll) > 0.1) {
        scrollAnimationId = requestAnimationFrame(animateScroll);
    } else {
        scrollAnimationId = null;
    }
}

// ========================================
// Demo 6: Game Loop Pattern
// ========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameFpsDisplay = document.getElementById('gameFps');
const gameScoreDisplay = document.getElementById('gameScore');

const game = {
    player: { x: 250, y: 200, width: 30, height: 30, speed: 200 },
    enemies: [],
    score: 0,
    isPaused: false,
    isRunning: false
};

const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

let gameAnimationId = null;
let gameLastTime = 0;
let gameFpsFrames = 0;
let gameFpsLastTime = 0;

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
});

function spawnEnemy() {
    game.enemies.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        speed: 50 + Math.random() * 100
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateGame(deltaTime) {
    if (game.isPaused) return;

    // Update player position
    if (keys.left) game.player.x -= game.player.speed * deltaTime;
    if (keys.right) game.player.x += game.player.speed * deltaTime;
    if (keys.up) game.player.y -= game.player.speed * deltaTime;
    if (keys.down) game.player.y += game.player.speed * deltaTime;

    // Keep player in bounds
    game.player.x = Math.max(0, Math.min(canvas.width - game.player.width, game.player.x));
    game.player.y = Math.max(0, Math.min(canvas.height - game.player.height, game.player.y));

    // Spawn enemies randomly
    if (Math.random() < 0.02) {
        spawnEnemy();
    }

    // Update enemies
    game.enemies = game.enemies.filter(enemy => {
        enemy.y += enemy.speed * deltaTime;

        // Check collision with player
        if (checkCollision(game.player, enemy)) {
            game.score += 10;
            gameScoreDisplay.textContent = game.score;
            return false; // Remove enemy
        }

        // Remove if off screen
        return enemy.y < canvas.height;
    });
}

function renderGame() {
    // Clear canvas
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = '#667eea';
    ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);

    // Draw enemies
    ctx.fillStyle = '#fc8181';
    game.enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw score
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${game.score}`, 10, 30);
}

function gameLoop(timestamp) {
    if (!game.isRunning) return;

    // Calculate delta time
    const deltaTime = gameLastTime ? (timestamp - gameLastTime) / 1000 : 0;
    gameLastTime = timestamp;

    // Calculate FPS
    gameFpsFrames++;
    if (timestamp - gameFpsLastTime >= 1000) {
        const currentFps = Math.round(gameFpsFrames * 1000 / (timestamp - gameFpsLastTime));
        gameFpsDisplay.textContent = currentFps;
        gameFpsFrames = 0;
        gameFpsLastTime = timestamp;
    }

    // Update and render
    updateGame(deltaTime);
    renderGame();

    gameAnimationId = requestAnimationFrame(gameLoop);
}

document.getElementById('startGame').addEventListener('click', () => {
    if (!game.isRunning) {
        game.isRunning = true;
        game.isPaused = false;
        gameLastTime = 0;
        gameFpsLastTime = performance.now();
        gameAnimationId = requestAnimationFrame(gameLoop);
    } else {
        game.isPaused = false;
    }
});

document.getElementById('pauseGame').addEventListener('click', () => {
    game.isPaused = !game.isPaused;
});

document.getElementById('resetGame').addEventListener('click', () => {
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
        gameAnimationId = null;
    }
    game.isRunning = false;
    game.isPaused = false;
    game.player.x = 250;
    game.player.y = 200;
    game.enemies = [];
    game.score = 0;
    gameScoreDisplay.textContent = '0';
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Initialize game canvas
ctx.fillStyle = '#1a202c';
ctx.fillRect(0, 0, canvas.width, canvas.height);
