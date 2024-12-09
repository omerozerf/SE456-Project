const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const tileSize = 20;
let snake = [{ x: tileSize * 5, y: tileSize * 5 }];
let direction = { x: 0, y: 0 };
let bait = { x: 0, y: 0 };
let growing = false;

// Initialize bait
function placeBait() {
    bait.x = Math.floor(Math.random() * (canvasWidth / tileSize)) * tileSize;
    bait.y = Math.floor(Math.random() * (canvasHeight / tileSize)) * tileSize;

    // Prevent bait from appearing inside the snake
    if (snake.some(segment => segment.x === bait.x && segment.y === bait.y)) {
        placeBait();
    }
}

// Draw the canvas elements
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw the snake with gradient effect
    snake.forEach((segment, index) => {
        const colorStrength = 100 - (index / snake.length) * 100; // Closer to the head = brighter
        ctx.fillStyle = `hsl(120, 100%, ${colorStrength}%)`; // Green hue (120° in HSL)
        ctx.fillRect(segment.x, segment.y, tileSize, tileSize);

        // Draw eyes on the head (index 0)
        if (index === 0) {
            drawEyes(segment.x, segment.y);
        }
    });

    // Draw the bait
    ctx.fillStyle = 'red';
    ctx.fillRect(bait.x, bait.y, tileSize, tileSize);
}

// Function to draw eyes on the snake's head
function drawEyes(x, y) {
    const eyeRadius = 3;
    const eyeOffsetX = 6; // Horizontal distance of eyes from the center
    const eyeOffsetY = 5; // Vertical distance of eyes from the center

    ctx.fillStyle = 'white'; // Eye color
    ctx.beginPath();
    ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2); // Left eye
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + tileSize - eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2); // Right eye
    ctx.fill();

    ctx.fillStyle = 'black'; // Pupil color
    ctx.beginPath();
    ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2); // Left pupil
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + tileSize - eyeOffsetX, y + eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2); // Right pupil
    ctx.fill();
}

// Move the snake
function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Add the new head
    snake.unshift(head);

    // Check if growing
    if (growing) {
        growing = false;
    } else {
        // Remove the last piece of the snake
        snake.pop();
    }
}

// Check for collisions
function checkCollisions() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.y < 0 || head.x >= canvasWidth || head.y >= canvasHeight) {
        resetGame();
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            resetGame();
        }
    }

    // Bait collision
    if (head.x === bait.x && head.y === bait.y) {
        growing = true;
        placeBait();
    }
}

// Reset the game
function resetGame() {
    snake = [{ x: tileSize * 5, y: tileSize * 5 }];
    direction = { x: 0, y: 0 };
    placeBait();
}

// Keyboard control
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -tileSize };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: tileSize };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -tileSize, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: tileSize, y: 0 };
            break;
    }
});

// Main game loop
function gameLoop() {
    moveSnake();
    checkCollisions();
    draw();
}

// Initialize game
placeBait();
setInterval(gameLoop, 100);