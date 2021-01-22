import RenderScreen from './RenderScreen.js'
import RenderElemment from './RenderElemment.js'
import MainFunctions from './MainFunctions.js'

const renderScr = RenderScreen({ id: 'gameCanvas', bgcolor: '#000000' });
renderScr.canvas.width = 1500;
renderScr.canvas.height = 1100;
const canvas = { width: renderScr.canvas.width, height: renderScr.canvas.height, ctx: renderScr.ctx };

const renderElemm = RenderElemment(renderScr.ctx, canvas);
const mainFunc = MainFunctions();

const info = new renderElemm.Info();
var score = 0;
var secondsPassed;
var oldTimeStamp;
var fps;

document.addEventListener("keydown", changeDirection);
window.addEventListener('resize', function () {
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  // start();
});

const GAME_SPEED = 1000 / 30;
const CANVAS_BORDER_COLOUR = '#000000';
const CANVAS_BACKGROUND_COLOUR = '#000000';
const FOOD_COLOUR = 'red';
const FOOD_BORDER_COLOUR = 'darkred';

let snake = [];
let changingDirection = false;
let foodX;
let foodY;
let dx = 10;
let dy = 0;

const drawFood = function () {
  renderScr.ctx.fillStyle = FOOD_COLOUR;
  renderScr.ctx.strokestyle = FOOD_BORDER_COLOUR;
  renderScr.ctx.fillRect(foodX, foodY, 10, 10);
  renderScr.ctx.strokeRect(foodX, foodY, 10, 10);
}

const advanceSnake = function () {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
  if (didEatFood) {
    score += 10;

    createFood();
  } else {
    snake.pop();
  }
}

const didGameEnd = function () {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
  }

  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > gameCanvas.width - 10;
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > gameCanvas.height - 10;

  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
}

const createFood = function () {
  foodX = mainFunc.randomTen(0, gameCanvas.width - 10);
  foodY = mainFunc.randomTen(0, gameCanvas.height - 10);

  snake.forEach(function isFoodOnSnake(part) {
    const foodIsoNsnake = part.x == foodX && part.y == foodY;

    if (foodIsoNsnake)
      createFood();
  });
}

const drawSnake = function () {
  //snake.forEach(drawSnakePart)
  snake.forEach(renderElemm.DrawSquareGreen);
}

function changeDirection(event) {
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;

  if (changingDirection) return;
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

const main = function (timeStamp) {
  // Game Over
  if (didGameEnd())
    return;

  update(timeStamp);

  setTimeout(function () {
    // for (let i = 0; i < popTotal; i++)
    //   changingDirection[i] = false;
    changingDirection = false;

    requestAnimationFrame(main);
  }, GAME_SPEED);
}

const update = function (timeStamp) {
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  fps = Math.round(1 / secondsPassed);

  renderScr.canvasclear(CANVAS_BACKGROUND_COLOUR, CANVAS_BORDER_COLOUR, gameCanvas.width, gameCanvas.height);

  drawFood();
  advanceSnake();
  drawSnake();

  info.update(
    { x: 10, y: 10, s: 80, title: "INFO", titleColor: '#00ff00' },
    {
      text: ['FPS:','SCORE:'],
      textColor: ['#ffffff'],
      value: [String(fps).padStart(3, '0'), score],
      valueColor: ['#ffffff'],
      font: ["10px terminal"],
      hightlight: -1,
    }
  );
}

const reset = function () {
  snake = [
    { x: 150, y: 150 },
    { x: 140, y: 150 },
    { x: 130, y: 150 },
    { x: 120, y: 150 },
    { x: 110, y: 150 }
  ];

  createFood();
}

const start = function () {
  reset();
  main();
}

start();