import RenderScreen from './render/RenderScreen.js';
import RenderElemment from './render/RenderElemment.js';

const renderScr = RenderScreen({ id: 'gameCanvas', bgcolor: '#000000', x: 0, y: 0 });
renderScr.canvas.width = 400;
renderScr.canvas.height = 400;
const canvas = { width: renderScr.canvas.width, height: renderScr.canvas.height, ctx: renderScr.ctx };
const renderElemm = RenderElemment(renderScr.ctx, canvas);

var secondsPassed;
var oldTimeStamp;
var fps;

document.addEventListener("keydown", changeDirection);

let score = 0;
let snake = [];
let changingDirection = false;
let dx = 10;
let dy = 0;
let level = 0;
let food = [];

var GAME_SPEED = 15;

const info = function (text) {
  renderScr.ctx.beginPath();
  renderScr.ctx.textAlign = "left";
  renderScr.ctx.textBaseline = "top";
  renderScr.ctx.fillStyle = text.color;
  renderScr.ctx.font = "Normal 12px arial";
  renderScr.ctx.fillText(text.title, text.x, text.y);
  renderScr.ctx.closePath();
}

const drawFood = function () {
  renderScr.ctx.beginPath();
  renderScr.ctx.lineWidth = 1;
  renderScr.ctx.fillStyle = "#ff0000";
  renderScr.ctx.strokeStyle = "#000000";
  renderScr.ctx.fillRect(food[level].x, food[level].y, 10, 10);
  renderScr.ctx.strokeRect(food[level].x, food[level].y, 10, 10);
  renderScr.ctx.closePath();
}

const drawSnake = function () {
  snake.forEach(renderElemm.DrawSquareGreen);
}

const createFood = function () {
  snake.forEach(function isFoodOnSnake(part) {
    const foodIsoNsnake = part.x == food[level].x && part.y == food[level].y;

    if (foodIsoNsnake) {
      level++;
    }
  });
}

const advanceSnake = function () {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  const didEatFood = snake[0].x === food[level].x && snake[0].y === food[level].y;

  if (didEatFood) {
    score += 1000;
    console.log(`Comeu! Score: ${score} Level: ${level}`);
    level++;
    createFood();
  } else {
    score++;
    snake.pop();
  }
}

const didGameEnd = function () {
  for (let i = 1; i < snake.length; i++)
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y)
      return true

  const hitLeftWall = snake[0].x <= 0;
  const hitRightWall = snake[0].x > canvas.width - 20;
  const hitToptWall = snake[0].y <= 0;
  const hitBottomWall = snake[0].y > renderScr.canvas.height;

  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
}

function changeDirection(event) {
  const LEFT_KEY = 37;
  const UP_KEY = 38;
  const RIGHT_KEY = 39;
  const DOWN_KEY = 40;

  if (changingDirection)
    return;

  changingDirection = true;

  const keyPressed = event.keyCode;
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;

  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -10;
    dy = 0;
  }

  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -10;
  }

  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 10;
    dy = 0;
  }

  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 10;
  }
}

const update = function (timeStamp) {
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  fps = Math.round(1 / secondsPassed);

  renderScr.canvasclear('#000000', '#a0a0a0', 0, 0, renderScr.canvas.width, renderScr.canvas.height);
  renderScr.canvasbackground('#000000', '#a0a0a0', 0, 0, renderScr.canvas.width, renderScr.canvas.height);

  info({
    title: `Fps: ${fps}`,
    x: 10,
    y: 10,
    color: "#ffffff"
  });

  info({
    title: `Score: ${score}`,
    x: 10,
    y: 25,
    color: "#ffffff"
  });

  drawFood();
  advanceSnake();
  drawSnake();
}

const main = function (timeStamp) {
  if (didGameEnd()) {
    console.log(`Bateu na borda! Score: ${score}`);
    reset();
  }

  update(timeStamp);

  setTimeout(function () {
    changingDirection = false;
    requestAnimationFrame(main);
  }, (1000 / GAME_SPEED));
}

const reset = function () {
  dx = 10;
  dy = 0;
  level = 0;
  score = 0;

  // TODO: Level
  food = [{ x: 260, y: 30 }, { x: 370, y: 350 }, { x: 290, y: 110 }, { x: 60, y: 160 }, { x: 220, y: 210 }, { x: 210, y: 360 }, { x: 230, y: 290 }, { x: 380, y: 170 }, { x: 260, y: 130 }, { x: 340, y: 360 }, { x: 280, y: 230 }, { x: 160, y: 160 }, { x: 290, y: 320 }, { x: 230, y: 110 }, { x: 130, y: 250 }, { x: 370, y: 250 }, { x: 300, y: 150 }, { x: 40, y: 190 }, { x: 20, y: 210 }, { x: 130, y: 130 }, { x: 340, y: 290 }, { x: 60, y: 300 }, { x: 100, y: 220 }, { x: 180, y: 90 }, { x: 20, y: 380 }, { x: 380, y: 160 }, { x: 130, y: 350 }, { x: 30, y: 180 }, { x: 350, y: 350 }, { x: 300, y: 330 }, { x: 360, y: 170 }, { x: 40, y: 310 }, { x: 130, y: 60 }, { x: 90, y: 290 }, { x: 80, y: 100 }, { x: 80, y: 60 }, { x: 280, y: 370 }, { x: 70, y: 30 }, { x: 130, y: 100 }, { x: 200, y: 130 }, { x: 150, y: 320 }, { x: 380, y: 100 }, { x: 320, y: 270 }, { x: 360, y: 250 }, { x: 230, y: 220 }, { x: 260, y: 190 }, { x: 210, y: 310 }, { x: 260, y: 180 }, { x: 170, y: 300 }, { x: 240, y: 180 }, { x: 100, y: 380 }, { x: 380, y: 130 }, { x: 230, y: 380 }, { x: 290, y: 30 }, { x: 370, y: 260 }, { x: 270, y: 270 }, { x: 70, y: 80 }, { x: 340, y: 50 }, { x: 160, y: 210 }, { x: 340, y: 170 }, { x: 340, y: 50 }, { x: 340, y: 250 }, { x: 370, y: 330 }, { x: 70, y: 290 }, { x: 190, y: 310 }, { x: 230, y: 290 }, { x: 250, y: 250 }, { x: 230, y: 270 }, { x: 370, y: 230 }, { x: 100, y: 40 }, { x: 240, y: 380 }, { x: 350, y: 50 }, { x: 280, y: 280 }, { x: 330, y: 250 }, { x: 130, y: 170 }, { x: 200, y: 80 }, { x: 260, y: 280 }, { x: 180, y: 380 }, { x: 330, y: 60 }, { x: 350, y: 230 }, { x: 330, y: 90 }, { x: 60, y: 340 }, { x: 130, y: 380 }, { x: 290, y: 50 }, { x: 330, y: 180 }, { x: 280, y: 20 }, { x: 270, y: 80 }, { x: 140, y: 110 }, { x: 190, y: 90 }, { x: 150, y: 310 }, { x: 330, y: 280 }, { x: 110, y: 110 }, { x: 180, y: 210 }, { x: 270, y: 240 }, { x: 340, y: 240 }, { x: 190, y: 130 }, { x: 380, y: 330 }, { x: 360, y: 210 }, { x: 100, y: 210 }, { x: 80, y: 230 }, { x: 170, y: 60 }, { x: 360, y: 130 }, { x: 270, y: 380 }, { x: 240, y: 40 }, { x: 340, y: 360 }, { x: 80, y: 250 }, { x: 270, y: 280 }, { x: 280, y: 220 }, { x: 240, y: 310 }, { x: 50, y: 280 }, { x: 350, y: 270 }, { x: 370, y: 180 }, { x: 190, y: 100 }, { x: 170, y: 30 }, { x: 280, y: 110 }, { x: 70, y: 70 }, { x: 50, y: 170 }, { x: 120, y: 260 }, { x: 70, y: 390 }, { x: 270, y: 240 }, { x: 380, y: 140 }, { x: 60, y: 220 }, { x: 190, y: 350 }, { x: 90, y: 50 }, { x: 250, y: 200 }, { x: 30, y: 210 }, { x: 130, y: 200 }, { x: 370, y: 250 }, { x: 390, y: 240 }, { x: 170, y: 200 }, { x: 260, y: 210 }, { x: 320, y: 370 }, { x: 380, y: 340 }, { x: 370, y: 330 }, { x: 360, y: 220 }, { x: 210, y: 160 }, { x: 370, y: 310 }, { x: 220, y: 370 }, { x: 160, y: 180 }, { x: 240, y: 40 }, { x: 210, y: 50 }, { x: 250, y: 310 }, { x: 120, y: 280 }, { x: 300, y: 310 }, { x: 220, y: 150 }, { x: 280, y: 160 }, { x: 60, y: 280 }, { x: 170, y: 260 }, { x: 190, y: 170 }, { x: 250, y: 200 }, { x: 40, y: 300 }, { x: 140, y: 350 }, { x: 160, y: 380 }, { x: 190, y: 230 }, { x: 210, y: 330 }, { x: 40, y: 360 }, { x: 230, y: 210 }, { x: 90, y: 340 }, { x: 90, y: 350 }, { x: 350, y: 150 }, { x: 350, y: 90 }, { x: 210, y: 40 }, { x: 240, y: 240 }, { x: 220, y: 330 }, { x: 210, y: 270 }, { x: 230, y: 340 }, { x: 180, y: 110 }, { x: 190, y: 210 }, { x: 360, y: 230 }, { x: 260, y: 170 }, { x: 70, y: 80 }, { x: 260, y: 60 }, { x: 90, y: 180 }, { x: 170, y: 180 }, { x: 170, y: 70 }, { x: 250, y: 250 }, { x: 280, y: 330 }, { x: 310, y: 280 }, { x: 60, y: 360 }, { x: 160, y: 130 }, { x: 170, y: 30 }, { x: 160, y: 160 }, { x: 40, y: 50 }, { x: 230, y: 170 }, { x: 200, y: 110 }, { x: 340, y: 330 }, { x: 330, y: 90 }, { x: 20, y: 260 }, { x: 350, y: 200 }, { x: 380, y: 270 }, { x: 100, y: 270 }, { x: 70, y: 30 }, { x: 310, y: 230 }, { x: 30, y: 200 }, { x: 60, y: 140 }, { x: 200, y: 200 }, { x: 170, y: 220 }, { x: 120, y: 370 }, { x: 290, y: 140 }, { x: 300, y: 250 }, { x: 90, y: 290 }, { x: 190, y: 290 }, { x: 150, y: 120 }, { x: 40, y: 280 }, { x: 240, y: 330 }, { x: 270, y: 330 }, { x: 350, y: 290 }, { x: 240, y: 130 }, { x: 200, y: 40 }, { x: 260, y: 240 }, { x: 260, y: 40 }, { x: 130, y: 320 }, { x: 200, y: 110 }, { x: 290, y: 30 }, { x: 200, y: 380 }, { x: 220, y: 220 }, { x: 220, y: 250 }, { x: 370, y: 360 }, { x: 360, y: 390 }, { x: 220, y: 260 }, { x: 190, y: 220 }, { x: 220, y: 100 }, { x: 290, y: 270 }, { x: 380, y: 300 }, { x: 340, y: 250 }, { x: 360, y: 300 }, { x: 240, y: 70 }, { x: 160, y: 200 }, { x: 190, y: 360 }, { x: 100, y: 80 }, { x: 230, y: 90 }, { x: 70, y: 80 }, { x: 20, y: 260 }, { x: 190, y: 120 }, { x: 70, y: 170 }, { x: 220, y: 60 }, { x: 260, y: 360 }, { x: 290, y: 180 }, { x: 160, y: 240 }, { x: 160, y: 30 }, { x: 20, y: 40 }, { x: 90, y: 380 }, { x: 80, y: 170 }, { x: 370, y: 110 }, { x: 370, y: 250 }, { x: 330, y: 240 }, { x: 190, y: 180 }, { x: 110, y: 280 }, { x: 70, y: 200 }, { x: 90, y: 200 }, { x: 280, y: 30 }, { x: 140, y: 290 }, { x: 80, y: 70 }, { x: 290, y: 20 }, { x: 110, y: 160 }];
  snake = [{ x: 200, y: 200 }];

  changeDirection({ keycode: 0 });
  createFood();
}

const start = function () {
  reset();
  main();
}

start();
