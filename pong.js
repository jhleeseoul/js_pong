const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = "start";
let playerScore = 0;
let aiScore = 0;
let aiSpeed = 2;
let ballSpeed = 5;

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 15;

let playerY = 250;
let aiY = 250;
let ballX = 400;
let ballY = 300;
let ballVelX = -ballSpeed;
let ballVelY = 3;

let difficulty = "easy";   // 현재 난이도 저장
let endMessage = "";       // 승/패 메시지 저장

let keys = {};

document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function startGame(diff) {
    difficulty = diff;
    document.getElementById('start-screen').style.display = 'none';
    canvas.style.display = 'block';
    document.getElementById('game-controls').style.display = 'block';
    gameState = "playing";

    if (diff === "easy") ballSpeed = 3; aiSpeed = 2;
    if (diff === "moderate") ballSpeed = 5; aiSpeed = 4;
    if (diff === "hard") ballSpeed = 7; aiSpeed = 7;

    resetGame();
    requestAnimationFrame(gameLoop);
}

function goHome() {
    location.reload(); // 새로고침으로 간단히 처리
}

function restartGame() {
    resetGame();
}

function resetGame() {
    playerScore = 0;
    aiScore = 0;
    resetBall();
}

function resetBall(delayed = true) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVelX = 0;
    ballVelY = 0;

    if (delayed) {
        setTimeout(() => {
            ballVelX = Math.random() > 0.5 ? -ballSpeed : ballSpeed;
            ballVelY = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1);
        }, 1000);
    } else {
        ballVelX = Math.random() > 0.5 ? -ballSpeed : ballSpeed;
        ballVelY = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1);
    }
}


function draw() {
    // background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // center dashed line
    ctx.strokeStyle = 'white';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // scores
    ctx.font = '40px monospace';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(`${playerScore} : ${aiScore}`, canvas.width / 2, 50);

    // paddles and ball
    ctx.fillRect(10, playerY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - 20, aiY, paddleWidth, paddleHeight);
    ctx.fillRect(ballX, ballY, ballSize, ballSize);

    // game over message
    if (gameState === "gameover") {
        ctx.fillStyle = 'white';
        ctx.font = '50px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(endMessage, canvas.width / 2, canvas.height / 2);
    }

}

function update() {
    // W/S 입력
    if (keys['w']) playerY -= 6;
    if (keys['s']) playerY += 6;
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

    // AI 선형 보간 움직임
    let aiCenter = aiY + paddleHeight / 2;
    let diff = ballY - aiCenter;
    aiY += diff * (aiSpeed / 50); // easy: 0.04, moderate: 0.08, hard: 0.14 정도 느낌
    aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));

    // Move ball
    ballX += ballVelX;
    ballY += ballVelY;

    // Collision with top/bottom
    if (ballY < 0 || ballY + ballSize > canvas.height) ballVelY *= -1;

    // Collision with player
    if (
        ballX < 20 &&
        ballY + ballSize > playerY &&
        ballY < playerY + paddleHeight
    ) {
        ballX = 20;

        let relativeIntersectY = (playerY + paddleHeight / 2) - (ballY + ballSize / 2);
        let normalized = relativeIntersectY / (paddleHeight / 2); // -1 ~ 1
        ballVelY = normalized * 5; // 최대 Y속도 제한
        ballVelX *= -1;
    }


    // Collision with AI
    if (
        ballX + ballSize > canvas.width - 20 &&
        ballY + ballSize > aiY &&
        ballY < aiY + paddleHeight
    ) {
        ballX = canvas.width - 20 - ballSize;

        let relativeIntersectY = (aiY + paddleHeight / 2) - (ballY + ballSize / 2);
        let normalized = relativeIntersectY / (paddleHeight / 2);
        ballVelY = normalized * 5;
        ballVelX *= -1;
    }


    // Scoring
    if (ballX < 0) {
        aiScore++;
        if (aiScore >= 15) endGame("You Lose!");
        else resetBall(true);
    }

    if (ballX > canvas.width) {
        playerScore++;
        if (playerScore >= 15) endGame("You Win!");
        else resetBall(true);
    }
}

function endGame(resultText) {
    gameState = "gameover";
    endMessage = resultText;
}


function gameLoop() {
    if (gameState === "playing") {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } else {
        draw(); // 게임오버 상태에서도 마지막 화면 그리기
    }
}
