// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

// Player paddle
const playerPaddle = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle
const computerPaddle = {
    x: canvas.width - paddleWidth - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    speed: 5
};

// Score
let playerScore = 0;
let computerScore = 0;
const maxScore = 5;

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Move paddle towards mouse position
    const paddleCenter = playerPaddle.y + playerPaddle.height / 2;
    if (mouseY < paddleCenter) {
        playerPaddle.dy = -playerPaddle.speed;
    } else if (mouseY > paddleCenter) {
        playerPaddle.dy = playerPaddle.speed;
    } else {
        playerPaddle.dy = 0;
    }
});

// Drawing functions
function drawRect(x, y, width, height, color = 'white') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color = 'white') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00ff00');
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff0000');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffff00');
}

// Update functions
function updatePlayerPaddle() {
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        playerPaddle.y += playerPaddle.speed;
    }

    // Apply mouse movement
    // (already handled in mousemove event, just apply it here)
    playerPaddle.y += playerPaddle.dy;

    // Boundary collision for player paddle
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }

    playerPaddle.dy = 0;
}

function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    
    // AI: follow the ball with slight delay for difficulty balance
    if (computerCenter < ball.y - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }

    // Boundary collision for computer paddle
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Prevent ball from going out of bounds
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
        }
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
        }
    }

    // Paddle collision - Player
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;

        // Add spin based on paddle position
        const collidePoint = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy = (collidePoint / (playerPaddle.height / 2)) * ball.speed;
    }

    // Paddle collision - Computer
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;

        // Add spin based on paddle position
        const collidePoint = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy = (collidePoint / (computerPaddle.height / 2)) * ball.speed;
    }

    // Score points
    if (ball.x < 0) {
        computerScore++;
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        resetBall();
    }

    // Check for game over
    if (playerScore >= maxScore || computerScore >= maxScore) {
        endGame();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;

    // Update score display
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function endGame() {
    const winner = playerScore >= maxScore ? 'Player' : 'Computer';
    alert(`Game Over! ${winner} wins!\n\nPlayer: ${playerScore}\nComputer: ${computerScore}\n\nRefresh the page to play again.`);
    cancelAnimationFrame(gameLoopId);
}

// Game loop
let gameLoopId;

function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    drawGame();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
