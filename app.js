const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const launchScreen = document.getElementById("launchScreen");
const gameUi = document.getElementById("gameUi");
const titleElement = document.getElementById("title");
const scoreElement = document.getElementById("score");
const controlsElement = document.getElementById("controlsText");
const backButton = document.getElementById("backButton");
const gameButtons = document.querySelectorAll("[data-game]");

const colors = {
    background: "#202124",
    foreground: "#9a9fa5",
    panel: "#17181a",
    snakeEye: "#ffffff",
    snakeFood: "#f28b82",
    flappySky: "#202124",
    flappyPipe: "#9a9fa5",
    flappyBird: "#535353",
    flappyBeak: "#9a9fa5",
    flappyGround: "#535353",
    overlay: "rgba(31, 32, 35, 0.7)"
};

const state = {
    activeGame: null,
    frameId: null,
    lastFrameTime: 0,
    snake: null,
    flappy: null
};

function setMenuScreen() {
    stopLoop();
    state.activeGame = null;
    state.snake = null;
    state.flappy = null;
    launchScreen.classList.add("active");
    canvas.classList.remove("active");
    gameUi.classList.remove("active");
    controlsElement.textContent = "";
    clearCanvas();
}

function startGame(gameName) {
    launchScreen.classList.remove("active");
    canvas.classList.add("active");
    gameUi.classList.add("active");
    state.activeGame = gameName;
    state.lastFrameTime = 0;

    if (gameName === "snake") {
        state.snake = createSnakeState();
        titleElement.textContent = "SNAKE";
        controlsElement.textContent = "ARROWS TO MOVE  |  SPACE TO RESTART  |  ESC FOR MENU";
        updateScore(0);
    } else {
        state.flappy = createFlappyState();
        titleElement.textContent = "FLAPPY BIRD";
        controlsElement.textContent = "SPACE OR UP TO FLAP  |  ESC FOR MENU";
        updateScore(0);
    }

    clearCanvas();
    drawCurrentGame();
    ensureLoop();
}

function updateScore(score) {
    scoreElement.textContent = `SCORE ${score.toString().padStart(5, "0")}`;
}

function stopLoop() {
    if (state.frameId !== null) {
        cancelAnimationFrame(state.frameId);
        state.frameId = null;
    }
    state.lastFrameTime = 0;
}

function ensureLoop() {
    if (state.frameId === null && state.activeGame) {
        state.frameId = requestAnimationFrame(gameLoop);
    }
}

function gameLoop(timestamp) {
    state.frameId = null;
    const delta = state.lastFrameTime === 0 ? 16.67 : timestamp - state.lastFrameTime;
    state.lastFrameTime = timestamp;

    if (state.activeGame === "snake") {
        updateSnake(delta);
        drawSnake();
        if (state.snake.running) {
            ensureLoop();
        }
        return;
    }

    if (state.activeGame === "flappy") {
        updateFlappy(delta);
        drawFlappy();
        if (state.flappy.running) {
            ensureLoop();
        }
    }
}

function drawCurrentGame() {
    if (state.activeGame === "snake") {
        drawSnake();
    } else if (state.activeGame === "flappy") {
        drawFlappy();
    }
}

function clearCanvas() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function createSnakeState() {
    const gridSize = 20;
    const columns = canvas.width / gridSize;
    const rows = canvas.height / gridSize;
    const snake = {
        gridSize,
        columns,
        rows,
        stepMs: 100,
        accumulator: 0,
        running: true,
        direction: { x: 0, y: 0 },
        nextDirection: null,
        body: [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 12 }
        ],
        food: { x: 5, y: 5 },
        score: 0
    };

    placeSnakeFood(snake);
    return snake;
}

function placeSnakeFood(snake) {
    do {
        snake.food = {
            x: Math.floor(Math.random() * snake.columns),
            y: Math.floor(Math.random() * snake.rows)
        };
    } while (snake.body.some((part) => part.x === snake.food.x && part.y === snake.food.y));
}

function updateSnake(delta) {
    const snake = state.snake;
    if (!snake || !snake.running) {
        return;
    }

    snake.accumulator += delta;
    while (snake.accumulator >= snake.stepMs && snake.running) {
        snake.accumulator -= snake.stepMs;
        stepSnake(snake);
    }
}

function stepSnake(snake) {
    if (snake.nextDirection) {
        snake.direction = snake.nextDirection;
        snake.nextDirection = null;
    }

    if (snake.direction.x === 0 && snake.direction.y === 0) {
        return;
    }

    const head = snake.body[0];
    const nextHead = {
        x: head.x + snake.direction.x,
        y: head.y + snake.direction.y
    };
    const willEatFood = nextHead.x === snake.food.x && nextHead.y === snake.food.y;
    const collisionBody = willEatFood ? snake.body : snake.body.slice(0, -1);

    const hitWall = nextHead.x < 0 || nextHead.x >= snake.columns || nextHead.y < 0 || nextHead.y >= snake.rows;
    const hitBody = collisionBody.some((part) => part.x === nextHead.x && part.y === nextHead.y);
    if (hitWall || hitBody) {
        snake.running = false;
        return;
    }

    snake.body.unshift(nextHead);

    if (willEatFood) {
        snake.score += 10;
        updateScore(snake.score);
        placeSnakeFood(snake);
    } else {
        snake.body.pop();
    }
}

function drawSnake() {
    const snake = state.snake;
    clearCanvas();

    ctx.strokeStyle = "#2b2c2e";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += snake.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += snake.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.fillStyle = colors.snakeFood;
    ctx.beginPath();
    ctx.arc(
        snake.food.x * snake.gridSize + snake.gridSize / 2,
        snake.food.y * snake.gridSize + snake.gridSize / 2,
        snake.gridSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    snake.body.forEach((part, index) => {
        ctx.fillStyle = colors.foreground;
        ctx.fillRect(part.x * snake.gridSize + 1, part.y * snake.gridSize + 1, snake.gridSize - 2, snake.gridSize - 2);

        if (index === 0) {
            ctx.fillStyle = colors.snakeEye;
            ctx.fillRect(part.x * snake.gridSize + 12, part.y * snake.gridSize + 4, 4, 4);
        }
    });

    if (!snake.running) {
        drawOverlay("GAME OVER", "PRESS SPACE TO RESTART");
    }
}

function queueSnakeDirection(direction) {
    const snake = state.snake;
    if (!snake || !snake.running) {
        return;
    }

    const currentDirection = snake.nextDirection || snake.direction;
    const reversing = currentDirection.x + direction.x === 0 && currentDirection.y + direction.y === 0;
    if (reversing) {
        return;
    }

    snake.nextDirection = direction;
    ensureLoop();
}

function createFlappyState() {
    return {
        running: true,
        started: false,
        score: 0,
        bird: {
            x: 110,
            y: canvas.height / 2 - 20,
            radius: 14,
            velocity: 0
        },
        gravity: 0.32,
        flapVelocity: -5.6,
        pipeSpeed: 2.4,
        pipeGap: 138,
        pipeWidth: 56,
        pipeInterval: 1500,
        pipeTimer: 0,
        pipes: []
    };
}

function updateFlappy(delta) {
    const flappy = state.flappy;
    if (!flappy || !flappy.running) {
        return;
    }

    if (!flappy.started) {
        return;
    }

    const frameFactor = delta / 16.67;
    flappy.bird.velocity += flappy.gravity * frameFactor;
    flappy.bird.y += flappy.bird.velocity * frameFactor;
    flappy.pipeTimer += delta;

    if (flappy.pipeTimer >= flappy.pipeInterval) {
        flappy.pipeTimer = 0;
        addFlappyPipe(flappy);
    }

    flappy.pipes.forEach((pipe) => {
        pipe.x -= flappy.pipeSpeed * frameFactor;

        if (!pipe.passed && pipe.x + flappy.pipeWidth < flappy.bird.x) {
            pipe.passed = true;
            flappy.score += 1;
            updateScore(flappy.score);
        }
    });

    flappy.pipes = flappy.pipes.filter((pipe) => pipe.x + flappy.pipeWidth > -20);

    const hitBounds =
        flappy.bird.y - flappy.bird.radius <= 0 ||
        flappy.bird.y + flappy.bird.radius >= canvas.height - 40;

    if (hitBounds || flappy.pipes.some((pipe) => birdHitsPipe(flappy.bird, pipe, flappy.pipeWidth, flappy.pipeGap))) {
        flappy.running = false;
    }
}

function addFlappyPipe(flappy) {
    const minTop = 70;
    const maxTop = canvas.height - 40 - flappy.pipeGap - 70;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
    flappy.pipes.push({
        x: canvas.width,
        topHeight,
        passed: false
    });
}

function birdHitsPipe(bird, pipe, pipeWidth, pipeGap) {
    const birdLeft = bird.x - bird.radius;
    const birdRight = bird.x + bird.radius;
    const birdTop = bird.y - bird.radius;
    const birdBottom = bird.y + bird.radius;

    const withinPipeX = birdRight > pipe.x && birdLeft < pipe.x + pipeWidth;
    if (!withinPipeX) {
        return false;
    }

    const gapTop = pipe.topHeight;
    const gapBottom = pipe.topHeight + pipeGap;
    return birdTop < gapTop || birdBottom > gapBottom;
}

function drawFlappy() {
    const flappy = state.flappy;

    ctx.fillStyle = colors.flappySky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#2b2c2e";
    for (let i = 0; i < canvas.height - 40; i += 32) {
        ctx.fillRect(0, i, canvas.width, 1);
    }

    ctx.fillStyle = colors.flappyPipe;
    flappy.pipes.forEach((pipe) => {
        const bottomY = pipe.topHeight + flappy.pipeGap;
        const bottomHeight = canvas.height - 40 - bottomY;
        ctx.fillRect(pipe.x, 0, flappy.pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 4, pipe.topHeight - 16, flappy.pipeWidth + 8, 16);
        ctx.fillRect(pipe.x, bottomY, flappy.pipeWidth, bottomHeight);
        ctx.fillRect(pipe.x - 4, bottomY, flappy.pipeWidth + 8, 16);
    });

    ctx.fillStyle = colors.flappyGround;
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    drawBird(flappy.bird);

    if (!flappy.started && flappy.running) {
        drawOverlay("FLAP TO START", "PRESS SPACE");
    } else if (!flappy.running) {
        drawOverlay("GAME OVER", "PRESS SPACE TO RESTART");
    }
}

function drawBird(bird) {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(Math.max(-0.5, Math.min(0.9, bird.velocity * 0.08)));

    ctx.fillStyle = colors.flappyBird;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.radius * 1.1, bird.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.flappyPipe;
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.ellipse(0, 0, bird.radius * 1.2, bird.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = colors.flappyBeak;
    ctx.beginPath();
    ctx.moveTo(bird.radius + 1, -3);
    ctx.lineTo(bird.radius + 12, 0);
    ctx.lineTo(bird.radius + 1, 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.snakeEye;
    ctx.beginPath();
    ctx.arc(4, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function flapBird() {
    const flappy = state.flappy;
    if (!flappy || !flappy.running) {
        return;
    }

    flappy.started = true;
    flappy.bird.velocity = flappy.flapVelocity;
    ensureLoop();
}

function drawOverlay(title, subtitle) {
    ctx.fillStyle = colors.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors.foreground;
    ctx.textAlign = "center";
    ctx.font = "18px 'Press Start 2P', 'Courier New', monospace";
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 18);
    ctx.font = "10px 'Press Start 2P', 'Courier New', monospace";
    ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 18);
}

function handleKeyDown(event) {
    if (event.key === "Escape" && state.activeGame) {
        setMenuScreen();
        return;
    }

    if (state.activeGame === "snake") {
        handleSnakeInput(event);
        return;
    }

    if (state.activeGame === "flappy") {
        handleFlappyInput(event);
        return;
    }

    if (event.key === "1") {
        startGame("snake");
    }

    if (event.key === "2") {
        startGame("flappy");
    }
}

function handleSnakeInput(event) {
    if (event.code === "Space") {
        event.preventDefault();
        if (!state.snake.running) {
            startGame("snake");
        }
        return;
    }

    const directionMap = {
        ArrowLeft: { x: -1, y: 0 },
        ArrowUp: { x: 0, y: -1 },
        ArrowRight: { x: 1, y: 0 },
        ArrowDown: { x: 0, y: 1 }
    };

    const direction = directionMap[event.key];
    if (direction) {
        event.preventDefault();
        queueSnakeDirection(direction);
    }
}

function handleFlappyInput(event) {
    const flapKeys = ["Space", "ArrowUp"];
    if (!flapKeys.includes(event.code)) {
        return;
    }

    event.preventDefault();
    if (!state.flappy.running) {
        startGame("flappy");
        return;
    }

    flapBird();
}

gameButtons.forEach((button) => {
    button.addEventListener("click", () => startGame(button.dataset.game));
});

backButton.addEventListener("click", setMenuScreen);
document.addEventListener("keydown", handleKeyDown);

setMenuScreen();
