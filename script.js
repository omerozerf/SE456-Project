class SnakeGame {
    constructor(canvasId, scoreBoardId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scoreBoard = document.getElementById(scoreBoardId);

        this.tileSize = 20;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        this.snake = [{ x: this.tileSize * 5, y: this.tileSize * 5 }];
        this.direction = { x: 0, y: 0 };
        this.bait = { x: 0, y: 0 };
        this.score = 0;
        this.growing = false;
        this.isGameOver = false; // Oyun durumu

        this.placeBait();
        this.bindEvents();
        this.gameLoop = setInterval(() => this.update(), 100);
    }

    // Yem yerleştirme
    placeBait() {
        this.bait.x = Math.floor(Math.random() * (this.canvasWidth / this.tileSize)) * this.tileSize;
        this.bait.y = Math.floor(Math.random() * (this.canvasHeight / this.tileSize)) * this.tileSize;

        // Yem yılanın üstünde mi kontrol
        if (this.snake.some(segment => segment.x === this.bait.x && segment.y === this.bait.y)) {
            this.placeBait();
        }
    }

    // Skor güncelleme
    updateScore() {
        this.score++;
        this.scoreBoard.textContent = `Score: ${this.score}`;
    }

    // Klavye kontrolü bağlama
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) {
                // Oyun bittiyse herhangi bir tuşla yeniden başlat
                this.resetGame();
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction.y === 0) this.direction = { x: 0, y: -this.tileSize };
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction.y === 0) this.direction = { x: 0, y: this.tileSize };
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction.x === 0) this.direction = { x: -this.tileSize, y: 0 };
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction.x === 0) this.direction = { x: this.tileSize, y: 0 };
                    break;
            }
        });
    }

    // Yılanın başını, gözlerini ve dilini çizme
    drawHead(x, y) {
        const eyeRadius = 3;
        const eyeOffsetX = 6;
        const eyeOffsetY = 5;
        const tongueLength = 10;

        // Baş
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

        // Dil
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        if (this.direction.x === this.tileSize) {
            this.ctx.moveTo(x + this.tileSize, y + this.tileSize / 2);
            this.ctx.lineTo(x + this.tileSize + tongueLength, y + this.tileSize / 2);
        } else if (this.direction.x === -this.tileSize) {
            this.ctx.moveTo(x, y + this.tileSize / 2);
            this.ctx.lineTo(x - tongueLength, y + this.tileSize / 2);
        } else if (this.direction.y === this.tileSize) {
            this.ctx.moveTo(x + this.tileSize / 2, y + this.tileSize);
            this.ctx.lineTo(x + this.tileSize / 2, y + this.tileSize + tongueLength);
        } else if (this.direction.y === -this.tileSize) {
            this.ctx.moveTo(x + this.tileSize / 2, y);
            this.ctx.lineTo(x + this.tileSize / 2, y - tongueLength);
        }
        this.ctx.stroke();

        // Gözler
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + this.tileSize - eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + this.tileSize - eyeOffsetX, y + eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Yılan çizimi
    draw() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.drawHead(segment.x, segment.y);
            } else {
                const colorStrength = 100 - (index / this.snake.length) * 100;
                this.ctx.fillStyle = `hsl(120, 100%, ${colorStrength}%)`;
                this.ctx.fillRect(segment.x, segment.y, this.tileSize, this.tileSize);
            }
        });

        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.bait.x, this.bait.y, this.tileSize, this.tileSize);
    }

    // Yılan hareketi
    moveSnake() {
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
        this.snake.unshift(head);

        if (!this.growing) {
            this.snake.pop();
        } else {
            this.growing = false;
        }
    }

    // Çarpışma kontrolü
    checkCollisions() {
        const head = this.snake[0];

        // Duvar çarpması
        if (head.x < 0 || head.y < 0 || head.x >= this.canvasWidth || head.y >= this.canvasHeight) {
            this.endGame();
        }

        // Kendi kendine çarpma
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                this.endGame();
            }
        }

        // Yem yeme
        if (head.x === this.bait.x && head.y === this.bait.y) {
            this.growing = true;
            this.updateScore();
            this.placeBait();
        }
    }

    // Oyun bitişi
    endGame() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);

        // Game over mesajı
        this.ctx.fillStyle = 'white'; // Yazı rengi
        this.ctx.font = '24px Arial'; // Yazı stili ve boyutu
        this.ctx.textAlign = 'center'; // Ortalanmış metin
        this.ctx.fillText(
            'Game Over! Press any key to restart.',
            this.canvasWidth / 2,
            this.canvasHeight / 2
        );
    }

    // Oyunu sıfırla
    resetGame() {
        this.snake = [{ x: this.tileSize * 5, y: this.tileSize * 5 }];
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.scoreBoard.textContent = 'Score: 0';
        this.isGameOver = false;
        this.placeBait();
        this.gameLoop = setInterval(() => this.update(), 100);
    }

    // Güncelleme döngüsü
    update() {
        if (this.isGameOver) return;
        this.moveSnake();
        this.checkCollisions();
        this.draw();
    }
}

// Oyun Başlatma
const game = new SnakeGame('gameCanvas', 'scoreBoard');