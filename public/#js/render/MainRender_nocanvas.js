import RenderScreen from './RenderScreen.js'
import RenderElemment from './RenderElemment.js'
import MainFunctions from './MainFunctions.js'
import SynapticBrowser from '../rna/SynapticBrowser.js'
import AGWB from '../ag/AGWeightsBest.js'

const renderScr = RenderScreen({ id: 'gameCanvas', bgcolor: '#000000', x: 0, y: 0 });
renderScr.canvas.width = 950;
renderScr.canvas.height = 950;
const canvas = { width: renderScr.canvas.width, height: renderScr.canvas.height, ctx: renderScr.ctx };
const renderElemm = RenderElemment(renderScr.ctx, canvas);

const renderScr1 = RenderScreen({ id: 'drawNN', bgcolor: '#000000', x: 0, y: 0 });
renderScr1.canvas.width = 950;
renderScr1.canvas.height = 950;
const canvas1 = { width: renderScr1.canvas.width, height: renderScr1.canvas.height, ctx: renderScr1.ctx };
const renderElemm1 = RenderElemment(renderScr1.ctx, canvas);

const mainFunc = MainFunctions();
const w = window;

const info = new renderElemm.Info();
var secondsPassed;
var oldTimeStamp;
var fps;

document.addEventListener("keydown", changeDirection);

let snake = [];
let score = 0;
let gen = 1;
let genmax = 5000;
let pop = 0;
let best = 0;
let changingDirection = false;
let dx = 10;
let dy = 0;
let level = 0;
let food = [];
let sensorFood = [];
let sensorWall = [];
let sensorTail = [];
let inputs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let population = [];
let around = 0;

var GAME_SPEED = 144;
const CANVAS_BORDER_COLOUR = '#a0a0a0';
const CANVAS_BACKGROUND_COLOUR = '#000000';

// Redes Neurais Artificiais
const layers = { inputs: 24, hiddens: [8], outputs: 4 };
// const layers = { inputs: 24, hiddens: [14, 14], outputs: 4 };
// const layers = { inputs: 24, hiddens: [8], outputs: 4 };
const network = SynapticBrowser(layers, renderScr1.ctx);
var limitOutputs = [0, 0, 0, 0];

// Algoritmos Genéticos
const model = { popTotal: 10, mutation: 0.10, best: 2, ajust: 20, wmin: -1, wmax: 1 };
const ag = AGWB(model);

const drawSensorFood = function (params) {
  let sensor = { front: 0, back: 0, top: 0, bottom: 0, fronttop: 0, frontbottom: 0, backtop: 0, backbottom: 0 };

  renderScr.ctx.beginPath();
  renderScr.ctx.lineWidth = params.lineWidth;
  renderScr.ctx.setLineDash(params.lineDash);
  renderScr.ctx.strokeStyle = params.strokeStyle;

  // Teste e ajustes
  //
  // x: 300, y: 300 // front
  // x: 90, y: 300  // back
  // x: 220, y: 280 // top
  // x: 220, y: 320 // front
  // x: 220, y: 310 // frontbottom
  // x: 210, y: 290 // backtop
  // x: 210, y: 310 // backbottom

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 10, snake[0].y + 5);
  if (snake[0].y == food[level].y && snake[0].x < food[level].x) {
    if (params.draw) renderScr.ctx.lineTo(food[level].x, food[level].y + 5);
    sensor.front = Math.abs((snake[0].x) - (food[level].x));
  } else {
    if (params.draw) renderScr.ctx.lineTo(renderScr.canvas.width, snake[0].y + 5);
  }

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y + 5);
  if (snake[0].y == food[level].y && snake[0].x > food[level].x) {
    if (params.draw) renderScr.ctx.lineTo(food[level].x + 10, food[level].y + 5);
    sensor.back = Math.abs((snake[0].x) - (food[level].x));
  } else {
    if (params.draw) renderScr.ctx.lineTo(0, snake[0].y + 5);
  }

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y + 5);
  if (snake[0].x == food[level].x && snake[0].y > food[level].y) {
    if (params.draw) renderScr.ctx.lineTo(food[level].x + 5, food[level].y + 10);
    sensor.top = Math.abs((snake[0].y) - (food[level].y));
  } else {
    if (params.draw) renderScr.ctx.lineTo(snake[0].x + 5, 0);
  }

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y + 5);
  if (snake[0].x == food[level].x && snake[0].y < food[level].y) {
    if (params.draw) renderScr.ctx.lineTo(food[level].x + 5, food[level].y);
    sensor.bottom = Math.abs((snake[0].y) - (food[level].y));
  } else {
    if (params.draw) renderScr.ctx.lineTo(snake[0].x + 10, renderScr.canvas.height);
  }

  //---------------------------------------------------------------------------------------------

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y + 5);
  if ((snake[0].x - food[level].x) == (snake[0].y - food[level].y) && snake[0].y < food[level].y) {
    if (params.draw) renderScr.ctx.lineTo(snake[0].x + Math.abs(snake[0].x - food[level].x), snake[0].y + Math.abs(snake[0].y - food[level].y));
    sensor.frontbottom = Math.sqrt(Math.pow(Math.abs(snake[0].x - food[level].x), 2) + Math.pow(Math.abs(snake[0].y - food[level].y), 2));
  } else {
    if (params.draw) renderScr.ctx.lineTo(snake[0].x + 5 + renderScr.canvas.width, snake[0].y + 5 + renderScr.canvas.height);
  }

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y + 5);
  if (-(snake[0].x - food[level].x) == Math.abs(snake[0].y - food[level].y) && snake[0].y > food[level].y) {
    if (params.draw) renderScr.ctx.lineTo(food[level].x + 5, food[level].y + 5);
    sensor.fronttop = Math.sqrt(Math.pow(Math.abs(snake[0].x - food[level].x), 2) + Math.pow(Math.abs(snake[0].y - food[level].y), 2));
  } else {
    if (params.draw) renderScr.ctx.lineTo(snake[0].x + 5 + renderScr.canvas.width, snake[0].y - 5 - renderScr.canvas.height);
  }

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y + 5);
  if ((snake[0].x - food[level].x) == (snake[0].y - food[level].y) && snake[0].y > food[level].y) {
    if (params.draw) renderScr.ctx.lineTo(snake[0].x - Math.abs(snake[0].x - food[level].x) + 5, snake[0].y - Math.abs(snake[0].y - food[level].y) + 5);
    sensor.backtop = Math.sqrt(Math.pow(Math.abs(snake[0].x - food[level].x), 2) + Math.pow(Math.abs(snake[0].y - food[level].y), 2));
  } else {
    if (params.draw) renderScr.ctx.lineTo(snake[0].x - 5 - renderScr.canvas.width, snake[0].y - 5 - renderScr.canvas.height + 20);
  }

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y + 5);
  if (-(snake[0].x - food[level].x) == (snake[0].y - food[level].y) && snake[0].x > food[level].x) {
    if (params.draw) renderScr.ctx.lineTo(food[level].x + 5, food[level].y + 5);
    sensor.backbottom = Math.sqrt(Math.pow(Math.abs(snake[0].x - food[level].x), 2) + Math.pow(Math.abs(snake[0].y - food[level].y), 2));
  } else {
    if (params.draw) renderScr.ctx.lineTo(snake[0].x - 5 - renderScr.canvas.width, snake[0].y + 5 + renderScr.canvas.height);
  }

  renderScr.ctx.stroke();
  renderScr.ctx.closePath();

  return sensor
}

const drawSensorWall = function (params) {
  let sensor = { front: 0, back: 0, top: 0, bottom: 0, fronttop: 0, frontbottom: 0, backtop: 0, backbottom: 0 };

  renderScr.ctx.beginPath();
  renderScr.ctx.lineWidth = params.lineWidth;
  renderScr.ctx.setLineDash(params.lineDash);
  renderScr.ctx.strokeStyle = params.strokeStyle;

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 10, snake[0].y + 5);
  sensor.front = Math.abs(snake[0].x - renderScr.canvas.width);
  if (params.draw) renderScr.ctx.lineTo(renderScr.canvas.width, snake[0].y + 5);

  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y + 5);
  sensor.back = snake[0].x;
  if (params.draw) renderScr.ctx.lineTo(0, snake[0].y + 5);

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y);
  sensor.top = snake[0].y;
  if (params.draw) renderScr.ctx.lineTo(snake[0].x + 5, 0);

  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 5, snake[0].y + 10);
  sensor.bottom = Math.abs(snake[0].y - renderScr.canvas.height);
  if (params.draw) renderScr.ctx.lineTo(snake[0].x + 5, renderScr.canvas.height);

  //---------------------------------------------------------------------------------------------

  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y);
  sensor.frontbottom = Math.sqrt(Math.pow(Math.abs(snake[0].x - gameCanvas.width), 2) + Math.pow(Math.abs(snake[0].y - gameCanvas.height), 2));
  if (params.draw) renderScr.ctx.lineTo(snake[0].x + renderScr.canvas.width + 10, snake[0].y + renderScr.canvas.height);

  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y);
  sensor.backtop = Math.sqrt(Math.pow(snake[0].x, 2) + Math.pow(snake[0].y, 2));
  if (params.draw) renderScr.ctx.lineTo(snake[0].x - renderScr.canvas.width, snake[0].y - renderScr.canvas.height);

  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y + 10);
  sensor.backbottom = Math.sqrt(Math.pow(Math.abs(snake[0].x), 2) + Math.pow(Math.abs(snake[0].y - renderScr.canvas.height), 2));
  if (params.draw) renderScr.ctx.lineTo(snake[0].x - renderScr.canvas.width, snake[0].y + renderScr.canvas.height);

  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y + 10);
  sensor.fronttop = Math.sqrt(Math.pow(Math.abs(snake[0].x - renderScr.canvas.width), 2) + Math.pow(Math.abs(snake[0].y - renderScr.canvas.height), 2));
  if (params.draw) renderScr.ctx.lineTo(snake[0].x + renderScr.canvas.width, snake[0].y - renderScr.canvas.height);

  renderScr.ctx.stroke();
  renderScr.ctx.closePath();

  return sensor
}

const drawSensorTail = function (params) {
  let sensor = { front: 0, back: 0, top: 0, bottom: 0, fronttop: 0, frontbottom: 0, backtop: 0, backbottom: 0 };
  let x1 = 0;

  renderScr.ctx.beginPath();
  renderScr.ctx.lineWidth = params.lineWidth;
  renderScr.ctx.setLineDash(params.lineDash);
  renderScr.ctx.strokeStyle = params.strokeStyle;

  // CW1
  x1 = -1;
  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y + 10);
  for (let i = 0; i < snake.length; i++) {
    if (snake[0].x != snake[i].x) {
      if (i + x1 <= snake.length && snake[i + x1 - 1].y == snake[i].y && snake[i].y < snake[0].y && snake[i].x < snake[0].x) {
        if (params.draw) renderScr.ctx.lineTo(snake[i].x - i * 10 + 20, snake[i].y + 10);
        sensor.front = Math.sqrt(Math.pow(Math.abs(snake[0].x - snake[0].y + 10), 2) + Math.pow(Math.abs((snake[i].x - i * 10 + 20) - (snake[i].y + 10)), 2));
      }
      break;
    }
    x1++;
  }

  // CW2
  x1 = -1;
  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y);
  for (let i = 0; i < snake.length; i++) {
    if (snake[0].y != snake[i].y) {
      if (i + x1 <= snake.length && snake[i + x1 - 1].x == snake[i].x && snake[i].y < snake[0].y && snake[i].x > snake[0].x) {
        if (params.draw) renderScr.ctx.lineTo(snake[i].x, snake[i].y - i * 10 + 20);
        sensor.back = Math.sqrt(Math.pow(Math.abs((snake[0].x) - snake[0].y), 2) + Math.pow(Math.abs((snake[i].x) - snake[i].y - i * 10 + 20), 2));
      }
      break;
    }
    x1++;
  }

  // CW3
  x1 = -1;
  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 10, snake[0].y);
  for (let i = 0; i < snake.length; i++) {
    if (snake[0].x != snake[i].x) {
      if (i + x1 <= snake.length && snake[i + x1 - 1].y == snake[i].y && snake[i].y > snake[0].y && snake[i].x > snake[0].x) {
        if (params.draw) renderScr.ctx.lineTo(snake[i].x + i * 10 - 10, snake[i].y);
        sensor.top = Math.sqrt(Math.pow(Math.abs((snake[0].x + 10) - (snake[0].y)), 2) + Math.pow(Math.abs((snake[i].x + i * 10 - 10) - (snake[i].y)), 2));
      }
      break;
    }
    x1++;
  }

  // CW4
  x1 = -1;
  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 10, snake[0].y + 10);
  for (let i = 0; i < snake.length; i++) {
    if (snake[0].y != snake[i].y) {
      if (i + x1 <= snake.length && snake[i].y > snake[0].y && snake[i].x < snake[0].x) {
        if (params.draw) renderScr.ctx.lineTo(snake[i].x + 10, snake[i].y + i * 10 - 10);
        sensor.bottom = Math.sqrt(Math.pow(Math.abs((snake[0].x + 10) - (snake[0].y + 10)), 2) + Math.pow(Math.abs((snake[i].x + i * 10 - 10) - snake[i].y), 2));
      }
      break;
    }
    x1++;
  }

  // ---------------------------------------------------------------------------------------------------------------------------------

  // CCW 1
  x1 = -1;
  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y + 10);
  for (let i = 0; i < snake.length; i++) {
    if (snake[0].y != snake[i].y) {
      if (i + x1 <= snake.length && snake[i + x1 - 1].x == snake[i].x && snake[i].y > snake[0].y && snake[i].x > snake[0].x) {
        if (params.draw) renderScr.ctx.lineTo(snake[i].x, snake[i].y + i * 10 - 10);
        sensor.fronttop = Math.sqrt(Math.pow(Math.abs(snake[0].x - (snake[0].y + 10)), 2) + Math.pow(Math.abs(snake[i].x - (snake[i].y + i * 10 - 10)), 2));
      }
      break;
    }
    x1++;
  }

  // CCW2
  x1 = -1;
  if (params.draw) renderScr.ctx.moveTo(snake[0].x, snake[0].y);
  for (let i = 0; i < snake.length; i++) {
    if (snake[0].x != snake[i].x) {
      if (i + x1 <= snake.length && snake[i + x1 - 1].y == snake[i].y && snake[i].y > snake[0].y && snake[i].x < snake[0].x) {
        if (params.draw) renderScr.ctx.lineTo(snake[i].x - i * 10 + 20, snake[i].y);
        sensor.frontbottom = Math.sqrt(Math.pow(Math.abs(snake[0].x - snake[0].y), 2) + Math.pow(Math.abs((snake[i].x - i * 10 + 20) - (snake[i].y)), 2));
      }
      break;
    }
    x1++;
  }

  // CCW3
  x1 = -1;
  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 10, snake[0].y);
  for (let i = 0; i < snake.length; i++) {
    if (snake[0].y != snake[i].y) {
      if (i + x1 <= snake.length && snake[i + x1 - 1].x == snake[i].x && snake[i].y < snake[0].y && snake[i].x < snake[0].x) {
        if (params.draw) renderScr.ctx.lineTo(snake[i].x + 10, snake[i].y - i * 10 + 20);
        sensor.backtop = Math.sqrt(Math.pow(Math.abs((snake[0].x + 10) - (snake[0].y)), 2) + Math.pow(Math.abs((snake[i].x + 10) - (snake[i].y - i * 10 + 20)), 2));
      }
      break;
    }
    x1++;
  }

  // CCW4
  x1 = -1;
  if (params.draw) renderScr.ctx.moveTo(snake[0].x + 10, snake[0].y + 10);
  for (let i = 0; i < snake.length; i++) {
    if (snake[0].x != snake[i].x) {
      if (i + x1 <= snake.length && snake[i + x1 - 1].y == snake[i].y && snake[i].y < snake[0].y && snake[i].x > snake[0].x) {
        if (params.draw) renderScr.ctx.lineTo(snake[i].x + i * 10 - 10, snake[i].y + 10);
        sensor.backbottom = Math.sqrt(Math.pow(Math.abs((snake[0].x + 10) - (snake[0].y + 10)), 2) + Math.pow(Math.abs((snake[i].x + i * 10 - 10) - (snake[i].y + 10)), 2));
      }
      break;
    }
    x1++;
  }

  renderScr.ctx.stroke();
  renderScr.ctx.closePath();

  return sensor
}

const drawFood = function () {
  renderScr.ctx.beginPath();
  renderScr.ctx.lineWidth = 1;
  renderScr.ctx.fillStyle = "#ff0000";
  renderScr.ctx.strokeStyle = "#ff0000";
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
    createFood();
    around = 0;
  } else {
    score++;
    snake.pop();
  }

  if (pop < model.popTotal && score > 0)
    population[pop].value = score;
}

const didGameEnd = function () {
  for (let i = 1; i < snake.length; i++)
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y)
      return true

  const hitLeftWall = snake[0].x <= 0;
  const hitRightWall = snake[0].x > canvas.width - 20;
  const hitToptWall = snake[0].y <= 0;
  const hitBottomWall = snake[0].y > renderScr.canvas.height;
  const hitRound = around === 25;

  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall || hitRound
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

    // if (around < 0.25)
    around += 0.25;

    limitOutputs = [1, 0, 0, 0];
  }
  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -10;

    // if (around >= 0.25 && around < 0.50)
    around += 0.25;

    limitOutputs = [0, 1, 0, 0];
  }
  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 10;
    dy = 0;

    // if (around >= 0.50 && around < 0.75)
    around += 0.25;

    limitOutputs = [0, 0, 1, 0];
  }
  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 10;

    // if (around >= 0.75 && around < 1)
    around += 0.25;

    limitOutputs = [0, 0, 0, 1];
  }
}

const update = function (timeStamp) {
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  fps = Math.round(1 / secondsPassed);

  // renderScr.canvasclear(CANVAS_BACKGROUND_COLOUR, CANVAS_BORDER_COLOUR, 0, 0, renderScr.canvas.width, renderScr.canvas.height);
  // renderScr.canvasbackground(CANVAS_BACKGROUND_COLOUR, CANVAS_BORDER_COLOUR, 0, 0, renderScr.canvas.width, renderScr.canvas.height);

  // drawFood();
  advanceSnake();
  // drawSnake();

  sensorFood = drawSensorFood({ draw: false, lineWidth: 1, strokeStyle: "#202020", lineDash: [] });
  sensorWall = drawSensorWall({ draw: false, lineWidth: 1, strokeStyle: "#202020", lineDash: [] });
  sensorTail = drawSensorTail({ draw: false, lineWidth: 1, strokeStyle: "#202020", lineDash: [] });

  inputs = [
    sensorFood.front, sensorFood.back, sensorFood.top, sensorFood.bottom, sensorFood.frontbottom, sensorFood.backtop, sensorFood.backbottom, sensorFood.fronttop,
    sensorWall.front, sensorWall.back, sensorWall.top, sensorWall.bottom, sensorWall.frontbottom, sensorWall.backtop, sensorWall.backbottom, sensorWall.fronttop,
    sensorTail.front, sensorTail.back, sensorTail.top, sensorTail.bottom, sensorTail.frontbottom, sensorTail.backtop, sensorTail.backbottom, sensorTail.fronttop,
  ];

  /*
  info.update(
    { x: 10, y: 10, s: 50, sy: 30, title: "INFO", titleColor: '#005500', font: "Bold 12px arial", lineWidth: 1, lineColor: "#FFFFFF", lineDash: [] },
    {
      text: ['Fps', 'Score', 'Gen', 'Pop', 'Best',
        // 'Snake', "Snake Pos", "Food pos", "Level", "Around"
      ],
      textFont: ["Bold 12px arial", "Bold 12px arial", "Bold 12px arial", "Bold 12px arial", "Bold 12px arial", "Bold 12px arial", "Bold 12px arial", "Bold 12px arial", "Bold 12px arial"],
      textColor: ['#3F3F3F', '#3F3F3F', '#3F3F3F', '#3F3F3F', '#3F3F3F', '#A0A0A0', '#A0A0A0', '#A0A0A0', '#A0A0A0', '#A0A0A0'],

      value: [String(fps).padStart(2, '0'), score, gen, (pop + 1) + " / " + model.popTotal, best,
        // snake.length, snake[0].x + ", " + snake[0].y, food[level].x + ", " + food[level].y, (level + 1), around.toFixed(0)
      ],
      valueFont: ["Normal 12px arial", "Normal 12px arial", "Normal 12px arial", "Normal 12px arial", "Normal 12px arial", "Normal 12px arial", "Normal 12px arial", "Normal 12px arial", "Normal 12px arial"],
      valueColor: ['#3F3F3F', '#3F3F3F', '#3F3F3F', '#3F3F3F', '#3F3F3F', '#A0A0A0', '#A0A0A0', '#A0A0A0', '#A0A0A0', '#A0A0A0'],
    }
  );
  */

  /*
  const LEFT_KEY = 37;
  const UP_KEY = 38;
  const RIGHT_KEY = 39;
  const DOWN_KEY = 40;
  */
  /*
    if (score > 25 && score < 50) {
      changeDirection({ keyCode: 40 });
    }else if (score > 50 && score < 75) {
      changeDirection({ keyCode: 37 });
    }else if (score > 75  && score < 100) {
      changeDirection({ keyCode: 38 });
    }else if (score > 100) {
      changeDirection({ keyCode: 39 });
      score = 0;
    }
  */
  // RNA: Cérebro
  rna();
}

const main = function (timeStamp) {
  if (didGameEnd()) {
    console.log("SET", pop, population[pop]);

    around = 0;

    if (pop + 1 < model.popTotal)
      network.setWeights(population[pop + 1].weights);

    if (pop + 1 == model.popTotal) {
      if (gen == genmax)
        return;
      else
        gen++;

      // AG: Seleção Natural
      population = ag.start(population);
      console.log("");

      pop = 0;
      score = 0;

      network.setWeights(population[0].weights);
    }

    reset();
  }

  update();

  setTimeout(function () {
    changingDirection = false;
    main();
  }, 1);
}

const reset = function () {
  dx = 10;
  dy = 0;
  level = 0;
  // snake = [{ x: 190, y: 300 }, { x: 180, y: 300 }, { x: 170, y: 300 }, { x: 160, y: 300 }, { x: 150, y: 300 }, { x: 140, y: 300 }, { x: 130, y: 300 }, { x: 120, y: 300 }, { x: 110, y: 300 }, { x: 100, y: 300 }];
  snake = [{ x: 10, y: 10 }];
  limitOutputs = [0, 0, 0, 0];

  if (pop < model.popTotal && score > 0) {
    if (score > best && around < 25)
      best = score;

    score = 0;
    around = 0;
    pop++;
  }

  changeDirection({ keycode: 0 });
  createFood();
}

const rna = function () {
  let outputs = network.Output(inputs);
  let key = {};

  if (outputs[0] >= 0.70 && outputs[0] < 0.80) {
    key.keyCode = 37;
    changeDirection(key);
    key.keyCode = 0;
  } else if (outputs[1] >= 0.70 && outputs[1] < 0.80) {
    key.keyCode = 38;
    changeDirection(key);
    key.keyCode = 0;
  } else if (outputs[2] >= 0.70 && outputs[2] < 0.80) {
    key.keyCode = 39;
    changeDirection(key);
    key.keyCode = 0;
  } else if (outputs[3] >= 0.70 && outputs[3] < 0.80) {
    key.keyCode = 40;
    changeDirection(key);
    key.keyCode = 0;
  } else {
    changeDirection(key);
    key.keyCode = 0;
  }

  // TODO RNA: Gráfico da Rede Neural
  // network.ShowDiagram({
  //   limitOutput: limitOutputs,
  //   inputs: inputs,
  //   outputs: outputs,
  //   bgWidth: renderScr1.canvas.width,
  //   bgHeight: renderScr1.canvas.height,
  //   bgFillStyle: CANVAS_BACKGROUND_COLOUR,
  //   bgStrokeStyle: CANVAS_BORDER_COLOUR,
  // });
}

const start = function () {
  // TODO AG: População Inicial. Geração de pesos aleatórios.
  network.setBiasDefault(1);
  network.setActivateFunction(3); // HLIM=0, IDENTITY=1, LOGISTIC=2, ReLU=3, TANH=4

  // console.log("PRIMEIRA POPULAÇÃO");
  for (let i = 0; i < model.popTotal; i++) {
    network.setWeightsRnd(model.wmin, model.wmax);
    let weights = network.getWeights();
    population.push({ id: i, weights: weights, value: 0 });
  }

  // 224
  population[0].weights = [0.0676733189718335, 0.0660926129049004, -0.1725423521658103, -0.4174935727099434, 0.1919896440400235, 0.8050253549894966, -0.8012094865492045, -0.8723905935246323, -0.5089515479673432, 0.1202407389546862, 0.6035635899822536, -0.6934550882720951, 0.1055740782946466, -0.721056645855751, 0.5803450016502483, -0.5021416969418175, 0.6444485505601287, -0.5349290383331713, 0.9535374959152922, -0.4508009144588199, -0.1246339698839578, -0.46969978098702914, -0.9899550361236216, 0.8014425549206101, 0.9122415210264267, -0.2649216753852861, -0.2464784594809726, 0.8708687308239478, 0.3714488281394175, 0.3004386479370926, 0.9440469451084970, -0.0369319211519832, -0.5973845951067274, -0.5202508374804573, -0.1561951900652554, -0.2149671023056583, -0.4077051466027433, -0.1324262114972838, 0.9950202847614738, 0.0899927930564153, 0.0992414966597956, 0.2600477968736503, -0.6456925194270724, -0.7046626481849239, -0.9090546363601710, 0.9612325347011601, -0.7337784381640429, -0.5832662190809792, -0.9098392532701598, 0.6619250199576618, 0.6282789851209305, -0.8346598022373017, 0.3285928526921618, -0.7915957024156750, 0.1974774008306106, 0.4476535855883470, 0.2775204320798257, 0.6219106272767214, -0.0548451414439253, -0.9259469980230937, -0.5433471234730494, -0.07854934736682, 0.3465394947095026, 0.19356371766029, -0.4070895580638667, 0.5036658060944097, -0.6334626054716641, -0.2515211713943608, 0.5659057988286902, -0.7176000439674812, -0.3460415377083472, 0.1205391310607129, 0.2543072830419151, 0.1928012515473227, 0.1823408131673165, 0.1398212295217891, 0.7248612021475354, -0.4903773589396989, -0.6732644899543851, -0.1577023569977456, 0.9141286846349277, 0.7309494326224129, -0.418508420063449, -0.4828492201085517, -0.436228778451623, -0.5496846221562235, 0.643886601843743, 0.6296730702618003, 0.3145412460869870, 0.623836345161445, 0.1526939001775629, -0.1196494480791479, 0.9376532947950444, 0.5846521177426989, -0.7122786725913306, -0.464152138210574, 0.1074284110393338, -0.8611206911898646, -0.3718972358250543, -0.4887141694908888, 0.8120922428711927, 0.3039681872723432, -0.0219845235856995, -0.1310029611682535, -0.2553206361088662, 0.6827669725390142, -0.5600691996099698, 0.9742481245474175, 0.6231051613522731, -0.9507425175865198, 0.1897883479695972, -0.1181670805767867, -0.1487717680303406, 0.3537059157822822, 0.6812717726065713, -0.487730571317333, 0.1196385745370234, 0.0196776412387552, -0.5466346302072504, 0.3534046048086870, 0.9585224410253428, 0.5794420777077254, 0.0260355804767829, 0.763257401515812, -0.4365679775812921, 0.2740922064489903, 0.9243602774866622, -0.5863792863622046, 0.6149856658767248, -0.7002830690240587, -0.4146442879312526, -0.3239932413496880, -0.6863368540822528, 0.7578058433870161, 0.0842689346792906, -0.4416222313660194, -0.1557893964664077, 0.2964189798260248, 0.2283077304507688, 0.1986989781639776, 0.4601644175685542, -0.0282181321088597, -0.0653788318615964, 0.7244205934020886, -0.2549968087928307, 0.9168946151746042, -0.2357084489684547, 0.4258119283924211, 0.8162225214862668, 0.2965593185783018, -0.4104540694809731, 0.1647533647907005, 0.1068293285965400, -0.1959556672446778, 0.8050115769977189, -0.8167121110023112, 0.4568558637466191, 0.5934488792444035, -0.4379656154642482, 0.7496620745157845, 0.970284052498779, -0.7014160319578306, 0.908989938292954, -0.3253317358807251, -0.8034012608434487, 0.7484967917162333, -0.7256087342352999, -0.6948416774064516, 0.1085248708469746, 0.2756622728407887, -0.0250545159513735, -0.889089920312585, -0.8519889690217357, -0.7927624673069622, 0.5774378887513993, -0.4286757223880753, -0.1567716024271664, -0.2731869654129833, -0.4016430047337085, -0.0903992100816904, 0.910798747575805, -0.384551634496558, -0.5019401959443770, -0.0612486231455689, 0.8089575764002137, 0.189562850340474, 0.7063280248029717, 0.0220330576605856, -0.4938563801781926, 0.3289066756650110, -0.4566824078890606, -0.8471481085424433, -0.6036256896585548, -0.0826241274059227, 0.5806163999893159, 0.0028585673732655, -0.9690290789436693, -0.9942010555026641, 0.2539455441017773, 0.4121191265280162, -0.8447391776220070, -0.6586732916345284, -0.5994243637007122, 0.9851786129759774, 0.7095860963475484, 0.4430563797598377, -0.7138353846669605, 0.8182037950662489, -0.6015379051981822, -0.1376790767983396, 0.4194368963293784, -0.6440180228466601, -0.6982711054379043, -0.7043731803761335, 0.3808736655704794, -0.484916904145881, 0.4713920130628773, 0.6564966183134815, 0.0200648046255716, -0.2878347333738205, 0.0520227183660329, 0.9594174097374761, -0.5306819857047755, 0.9099895033776320];  // 3171
  population[1].weights = [0.0676733189718335, 0.0660926129049004, -0.1725423521658103, -0.4174935727099434, 0.1919896440400235, 0.8050253549894966, -0.8178348127885386, -0.7228082055066873, -0.5089515479673432, 0.1202407389546862, 0.6035635899822536, -0.6934550882720951, 0.1055740782946466, -0.721056645855751, 0.5803450016502483, -0.5021416969418175, 0.6444485505601287, -0.5349290383331713, 0.9535374959152922, -0.4508009144588199, -0.1246339698839578, -0.46969978098702914, -0.9899550361236216, 0.8014425549206101, 0.9122415210264267, -0.2649216753852861, -0.8588058120947406, 0.8708687308239478, 0.3714488281394175, 0.3004386479370926, 0.9440469451084970, -0.0369319211519832, -0.5973845951067274, 0.4249193902412562, -0.1561951900652554, 0.5342562409013012, -0.4077051466027433, 0.3095957684603170, -0.8821140122599340, 0.0899927930564153, 0.0992414966597956, 0.2600477968736503, -0.6456925194270724, -0.7046626481849239, -0.9090546363601710, 0.9612325347011601, 0.4953449000737691, -0.5832662190809792, 0.6039181989663600, 0.6619250199576618, 0.6282789851209305, -0.8346598022373017, 0.3285928526921618, -0.7915957024156750, 0.1974774008306106, 0.4476535855883470, 0.2775204320798257, -0.7559810873187809, -0.0548451414439253, -0.1454864521468680, -0.5752111525273214, -0.07854934736682, 0.3465394947095026, 0.19356371766029, -0.4070895580638667, 0.5036658060944097, -0.6334626054716641, -0.2515211713943608, 0.5659057988286902, -0.7176000439674812, -0.3460415377083472, 0.2175523926893415, -0.1924399592364572, 0.1928012515473227, 0.1823408131673165, 0.3131539421948375, 0.7248612021475354, -0.4903773589396989, -0.6732644899543851, -0.1577023569977456, 0.9141286846349277, 0.7309494326224129, -0.418508420063449, -0.4828492201085517, -0.436228778451623, -0.5496846221562235, 0.643886601843743, 0.6296730702618003, -0.1763202835437108, 0.623836345161445, 0.1339532112415682, -0.1196494480791479, 0.9376532947950444, 0.5846521177426989, -0.7377000009702095, -0.464152138210574, 0.1074284110393338, -0.8611206911898646, -0.3718972358250543, -0.4887141694908888, 0.8120922428711927, 0.3039681872723432, -0.0219845235856995, -0.1310029611682535, -0.2553206361088662, 0.6827669725390142, -0.5600691996099698, 0.9742481245474175, 0.6231051613522731, -0.9507425175865198, 0.1897883479695972, -0.1181670805767867, -0.1487717680303406, 0.3537059157822822, 0.6812717726065713, -0.487730571317333, -0.4389077656458489, 0.0196776412387552, -0.5466346302072504, 0.3534046048086870, 0.9585224410253428, 0.5794420777077254, 0.0260355804767829, 0.763257401515812, -0.4365679775812921, 0.2740922064489903, 0.9243602774866622, -0.5863792863622046, 0.6149856658767248, -0.7002830690240587, -0.4146442879312526, 0.0295253050129674, -0.6863368540822528, -0.3366492934683567, 0.0842689346792906, -0.4416222313660194, -0.1557893964664077, 0.2964189798260248, -0.2980329482642108, 0.852719107117514, 0.4270808570355413, -0.0282181321088597, -0.0653788318615964, 0.7244205934020886, -0.2549968087928307, 0.9168946151746042, 0.48521583638280585, 0.4258119283924211, 0.8162225214862668, 0.2965593185783018, -0.4104540694809731, 0.1647533647907005, -0.4758263476125442, -0.1959556672446778, 0.8050115769977189, -0.6565179380726742, 0.4568558637466191, 0.5934488792444035, -0.4379656154642482, 0.7496620745157845, 0.970284052498779, -0.7014160319578306, 0.908989938292954, 0.6481651220881872, -0.8034012608434487, 0.7484967917162333, -0.6791934305092244, -0.6948416774064516, 0.1085248708469746, 0.0499534479694304, 0.3394159427212071, -0.889089920312585, -0.8519889690217357, -0.7927624673069622, 0.5774378887513993, -0.4286757223880753, -0.1567716024271664, -0.2731869654129833, -0.4016430047337085, -0.0903992100816904, 0.910798747575805, -0.384551634496558, -0.5019401959443770, 0.8326622487586324, 0.8089575764002137, 0.189562850340474, 0.7063280248029717, 0.0220330576605856, -0.6950750784073652, 0.9238734302048255, -0.8614551713882048, -0.8471481085424433, -0.6036256896585548, -0.0826241274059227, 0.5806163999893159, 0.0028585673732655, -0.9690290789436693, -0.9942010555026641, 0.2539455441017773, 0.4121191265280162, -0.3449726490025427, -0.6586732916345284, -0.5994243637007122, 0.9851786129759774, 0.0855692398253689, 0.4430563797598377, -0.7138353846669605, 0.8182037950662489, -0.6015379051981822, -0.1376790767983396, 0.4194368963293784, -0.6440180228466601, -0.6982711054379043, -0.7043731803761335, 0.3808736655704794, -0.484916904145881, 0.4713920130628773, 0.6564966183134815, 0.0200648046255716, -0.2878347333738205, 0.0520227183660329, 0.9594174097374761, -0.5306819857047755, 0.9099895033776320];    // 3052
  population[2].weights = [0.0676733189718335, 0.0660926129049004, -0.1725423521658103, -0.0931557734222732, 0.1919896440400235, -0.6378757909788395, 0.1747431030487605, -0.7228082055066873, -0.5089515479673432, 0.1202407389546862, 0.8907732262990287, -0.6934550882720951, 0.1055740782946466, -0.721056645855751, 0.5803450016502483, -0.5021416969418175, -0.7540336425839218, -0.3750566956604047, 0.9535374959152922, -0.4508009144588199, -0.1246339698839578, -0.46969978098702914, -0.9899550361236216, 0.5784512807811102, 0.9122415210264267, -0.2649216753852861, -0.8588058120947406, 0.8708687308239478, 0.3714488281394175, 0.3004386479370926, -0.0967445976652836, -0.0369319211519832, -0.5973845951067274, 0.4249193902412562, -0.1186457660359475, 0.5350944946053273, -0.7706847008491047, -0.0708419112394694, -0.8821140122599340, 0.5264634439786011, 0.0992414966597956, -0.1664922316670054, 0.6329346179889379, 0.5095729931751598, -0.9090546363601710, 0.6120728160471249, 0.4953449000737691, -0.5832662190809792, -0.4712732882728234, 0.6619250199576618, 0.6282789851209305, -0.8346598022373017, 0.3285928526921618, -0.5314307274214602, 0.1974774008306106, 0.4476535855883470, 0.2775204320798257, -0.7559810873187809, -0.0548451414439253, -0.1454864521468680, -0.5752111525273214, -0.07854934736682, 0.3465394947095026, 0.19356371766029, 0.9385797753234915, 0.5036658060944097, -0.6334626054716641, -0.2515211713943608, 0.5659057988286902, -0.7176000439674812, -0.3460415377083472, 0.2175523926893415, -0.1924399592364572, 0.1928012515473227, 0.1823408131673165, 0.3131539421948375, 0.7248612021475354, -0.4903773589396989, -0.6732644899543851, -0.1577023569977456, 0.9141286846349277, 0.7309494326224129, -0.418508420063449, -0.4828492201085517, -0.436228778451623, -0.5496846221562235, 0.643886601843743, 0.6296730702618003, 0.7099461694739841, 0.623836345161445, 0.1339532112415682, -0.1196494480791479, 0.9376532947950444, 0.5846521177426989, -0.7377000009702095, -0.464152138210574, 0.1074284110393338, -0.8611206911898646, -0.3718972358250543, -0.4887141694908888, 0.8120922428711927, 0.7559416642509103, -0.0219845235856995, -0.1310029611682535, -0.2553206361088662, 0.6827669725390142, -0.5410163881754526, 0.9742481245474175, 0.6231051613522731, -0.9507425175865198, 0.1897883479695972, -0.1181670805767867, -0.9429234154468484, 0.3537059157822822, 0.6812717726065713, -0.487730571317333, -0.4389077656458489, 0.2858933326302546, -0.5466346302072504, 0.3534046048086870, 0.9585224410253428, 0.5794420777077254, 0.0260355804767829, 0.763257401515812, -0.4365679775812921, 0.5093223930677993, 0.9243602774866622, -0.5863792863622046, 0.6149856658767248, 0.2525637666111207, -0.4146442879312526, 0.0295253050129674, -0.6863368540822528, -0.3366492934683567, 0.0842689346792906, -0.4416222313660194, 0.1319603272471492, 0.2964189798260248, -0.2980329482642108, 0.852719107117514, 0.4270808570355413, -0.0282181321088597, -0.0653788318615964, 0.7244205934020886, -0.2549968087928307, 0.9168946151746042, 0.48521583638280585, 0.4258119283924211, 0.8162225214862668, -0.3795024370430173, -0.4104540694809731, 0.1647533647907005, -0.4758263476125442, -0.1959556672446778, 0.8050115769977189, -0.6565179380726742, 0.4568558637466191, -0.8239486314979816, -0.4379656154642482, 0.7496620745157845, 0.970284052498779, -0.9208636377902839, 0.908989938292954, 0.6481651220881872, -0.8034012608434487, 0.7484967917162333, 0.8583779284874939, -0.6484719230881235, 0.1085248708469746, 0.0499534479694304, -0.6481999694164924, -0.889089920312585, -0.8519889690217357, -0.7927624673069622, 0.5774378887513993, 0.6964718442311435, -0.1567716024271664, 0.2332595560210309, 0.4332127168202922, -0.0903992100816904, 0.910798747575805, -0.384551634496558, -0.4562761109666247, 0.3640947010074380, 0.8089575764002137, 0.189562850340474, 0.7063280248029717, -0.5799076128640501, 0.0484300638547137, 0.9238734302048255, -0.8614551713882048, -0.8471481085424433, 0.5609567190741034, -0.0826241274059227, 0.7315809599663838, 0.0028585673732655, -0.9690290789436693, -0.9942010555026641, 0.2539455441017773, 0.4121191265280162, -0.3449726490025427, -0.6586732916345284, -0.5994243637007122, 0.9851786129759774, 0.3103279231830665, 0.4430563797598377, -0.7138353846669605, 0.8182037950662489, -0.6015379051981822, -0.1376790767983396, 0.4194368963293784, -0.6440180228466601, -0.6982711054379043, -0.7043731803761335, 0.19041378513142648, -0.484916904145881, 0.4713920130628773, -0.6940909708875105, 0.0200648046255716, -0.2878347333738205, 0.0520227183660329, 0.9594174097374761, -0.5306819857047755, 0.9099895033776320];     // 2467
  population[3].weights = [0.0676733189718335, 0.0660926129049004, -0.1725423521658103, -0.0931557734222732, 0.1919896440400235, -0.6378757909788395, 0.1747431030487605, -0.7228082055066873, -0.5089515479673432, 0.1202407389546862, 0.8907732262990287, -0.6934550882720951, 0.1055740782946466, -0.721056645855751, 0.5803450016502483, -0.5021416969418175, -0.7540336425839218, -0.3750566956604047, 0.9535374959152922, -0.4508009144588199, -0.1246339698839578, -0.46969978098702914, -0.9899550361236216, 0.5784512807811102, 0.9122415210264267, -0.2649216753852861, -0.8588058120947406, 0.8708687308239478, 0.3714488281394175, 0.3004386479370926, -0.0967445976652836, -0.0369319211519832, -0.5973845951067274, 0.4249193902412562, -0.1186457660359475, 0.5350944946053273, -0.7706847008491047, -0.0708419112394694, -0.8821140122599340, 0.5264634439786011, 0.0992414966597956, -0.4768384038705809, 0.4261404552528067, 0.5095729931751598, -0.9090546363601710, -0.2813707201978732, 0.4953449000737691, -0.8965383915807106, -0.4712732882728234, 0.6619250199576618, 0.6282789851209305, -0.8346598022373017, 0.4828905896248732, -0.5314307274214602, 0.1974774008306106, 0.4476535855883470, 0.2775204320798257, -0.2654122460353756, -0.5758229825103212, -0.1454864521468680, -0.5752111525273214, -0.07854934736682, 0.3465394947095026, 0.19356371766029, 0.9385797753234915, 0.5036658060944097, -0.6334626054716641, -0.2515211713943608, 0.5659057988286902, -0.5740783858306964, -0.3460415377083472, 0.2175523926893415, -0.1924399592364572, 0.1928012515473227, 0.1823408131673165, 0.3131539421948375, 0.7248612021475354, -0.4903773589396989, -0.6732644899543851, -0.1577023569977456, 0.9141286846349277, 0.7309494326224129, -0.418508420063449, -0.4828492201085517, -0.436228778451623, -0.5496846221562235, 0.643886601843743, 0.6296730702618003, 0.7099461694739841, 0.623836345161445, 0.1339532112415682, -0.1196494480791479, 0.9376532947950444, 0.5846521177426989, -0.7377000009702095, -0.464152138210574, 0.1074284110393338, -0.8611206911898646, -0.3718972358250543, -0.4887141694908888, 0.8120922428711927, 0.7559416642509103, -0.0219845235856995, -0.1310029611682535, -0.2553206361088662, 0.6827669725390142, -0.5410163881754526, 0.9742481245474175, 0.6231051613522731, -0.9507425175865198, 0.1897883479695972, -0.1181670805767867, -0.9429234154468484, 0.3537059157822822, 0.6812717726065713, -0.487730571317333, -0.4389077656458489, 0.2858933326302546, -0.5466346302072504, 0.3534046048086870, 0.9585224410253428, 0.5794420777077254, 0.0260355804767829, 0.763257401515812, -0.4365679775812921, 0.5093223930677993, 0.9243602774866622, -0.5863792863622046, 0.6149856658767248, 0.2525637666111207, -0.4146442879312526, 0.0295253050129674, -0.6863368540822528, -0.3366492934683567, 0.0842689346792906, -0.4416222313660194, 0.1319603272471492, 0.2964189798260248, -0.2980329482642108, 0.852719107117514, 0.4270808570355413, -0.0282181321088597, -0.0653788318615964, 0.7244205934020886, -0.2549968087928307, 0.9168946151746042, 0.48521583638280585, 0.4258119283924211, 0.8162225214862668, -0.3795024370430173, -0.4104540694809731, 0.1647533647907005, -0.4758263476125442, -0.1959556672446778, 0.8050115769977189, -0.6565179380726742, 0.4568558637466191, -0.8239486314979816, -0.4379656154642482, 0.7496620745157845, 0.970284052498779, -0.9208636377902839, 0.908989938292954, 0.6481651220881872, -0.8034012608434487, 0.7484967917162333, 0.8583779284874939, -0.6484719230881235, 0.1085248708469746, 0.0499534479694304, -0.6481999694164924, -0.889089920312585, -0.8519889690217357, -0.7927624673069622, 0.5774378887513993, 0.6964718442311435, -0.1567716024271664, 0.2332595560210309, 0.4332127168202922, -0.0903992100816904, 0.910798747575805, -0.384551634496558, -0.4562761109666247, 0.3640947010074380, 0.8089575764002137, 0.189562850340474, 0.7063280248029717, -0.5799076128640501, 0.0484300638547137, 0.9238734302048255, -0.8614551713882048, -0.8471481085424433, 0.5609567190741034, -0.0826241274059227, 0.7315809599663838, 0.0028585673732655, -0.9690290789436693, -0.9942010555026641, 0.2539455441017773, 0.4121191265280162, -0.3449726490025427, -0.6586732916345284, -0.5994243637007122, 0.9851786129759774, 0.3103279231830665, 0.4430563797598377, -0.7138353846669605, 0.8182037950662489, -0.6015379051981822, -0.1376790767983396, 0.4194368963293784, -0.6440180228466601, -0.6982711054379043, -0.7043731803761335, 0.19041378513142648, -0.484916904145881, 0.4713920130628773, -0.6940909708875105, 0.0200648046255716, -0.2878347333738205, 0.0520227183660329, 0.9594174097374761, -0.5306819857047755, 0.9099895033776320];    // 2461
  population[4].weights = [0.0676733189718335, 0.0660926129049004, -0.1725423521658103, -0.0931557734222732, 0.3825845819812232, -0.6378757909788395, 0.5132178481383387, -0.7228082055066873, -0.5089515479673432, 0.1202407389546862, 0.8907732262990287, -0.6934550882720951, 0.1055740782946466, -0.721056645855751, 0.5803450016502483, -0.5021416969418175, -0.7540336425839218, -0.3750566956604047, 0.9535374959152922, -0.4508009144588199, -0.1246339698839578, -0.46969978098702914, -0.9899550361236216, 0.5784512807811102, 0.9122415210264267, -0.2649216753852861, -0.8588058120947406, 0.8708687308239478, 0.3714488281394175, 0.3004386479370926, -0.0967445976652836, -0.0369319211519832, -0.5973845951067274, 0.4249193902412562, -0.1186457660359475, 0.5350944946053273, -0.1735483147619332, 0.0332402964030694, -0.3507521782538259, 0.6870517635422719, 0.0992414966597956, -0.4768384038705809, 0.4261404552528067, 0.5095729931751598, -0.7342719545625749, -0.2813707201978732, 0.4953449000737691, -0.8965383915807106, 0.6999156292701443, -0.2707645365592852, 0.691573812462912, -0.8346598022373017, 0.4828905896248732, -0.5314307274214602, 0.1974774008306106, 0.253633358236026, 0.2775204320798257, 0.2317008621220902, -0.5758229825103212, 0.6425142021766153, -0.5752111525273214, -0.07854934736682, 0.3465394947095026, 0.1935637176602900, 0.9385797753234915, 0.5036658060944097, -0.6334626054716641, -0.2515211713943608, 0.5659057988286902, -0.5740783858306964, -0.3460415377083472, 0.2175523926893415, -0.1924399592364572, 0.1928012515473227, 0.1823408131673165, 0.3131539421948375, 0.7248612021475354, -0.4903773589396989, -0.6732644899543851, -0.1577023569977456, 0.9141286846349277, 0.7309494326224129, -0.418508420063449, -0.4828492201085517, -0.436228778451623, -0.5496846221562235, 0.643886601843743, 0.6296730702618003, 0.1237752891464949, 0.623836345161445, 0.1339532112415682, -0.1196494480791479, 0.9376532947950444, 0.5846521177426989, -0.7377000009702095, -0.464152138210574, 0.1074284110393338, -0.8611206911898646, -0.3718972358250543, -0.4887141694908888, 0.8120922428711927, 0.7559416642509103, -0.0219845235856995, -0.1310029611682535, -0.2553206361088662, 0.6827669725390142, -0.5410163881754526, 0.9742481245474175, 0.4974504964851056, -0.9507425175865198, 0.1897883479695972, -0.1181670805767867, -0.9429234154468484, 0.8797414767176113, 0.6812717726065713, -0.487730571317333, -0.4389077656458489, 0.2858933326302546, -0.7380071869776161, -0.2904527842912166, 0.9585224410253428, -0.2802765459463652, 0.0260355804767829, 0.763257401515812, -0.0890822129070035, 0.5093223930677993, 0.9243602774866622, -0.5863792863622046, 0.6149856658767248, 0.8101795973707824, -0.4146442879312526, 0.0295253050129674, -0.6863368540822528, -0.3366492934683567, 0.2749444352429751, -0.4416222313660194, 0.1010634163080573, 0.2964189798260248, -0.2980329482642108, 0.852719107117514, 0.4270808570355413, -0.0282181321088597, -0.0653788318615964, 0.7244205934020886, -0.7862386647670254, 0.9168946151746042, 0.48521583638280585, 0.5312405513045801, 0.8162225214862668, 0.7340394101405696, -0.4104540694809731, 0.1647533647907005, -0.4758263476125442, -0.1959556672446778, 0.8050115769977189, -0.6565179380726742, 0.4568558637466191, -0.8239486314979816, -0.4379656154642482, 0.7496620745157845, 0.970284052498779, -0.9208636377902839, 0.908989938292954, 0.6481651220881872, -0.5230792494341441, 0.7484967917162333, 0.8871845212760578, 0.0569335600561574, -0.6327247300822041, 0.0499534479694304, -0.6481999694164924, -0.889089920312585, -0.8519889690217357, -0.7927624673069622, 0.5774378887513993, 0.6964718442311435, 0.416390037293513, 0.2332595560210309, 0.4332127168202922, -0.0903992100816904, 0.910798747575805, -0.384551634496558, -0.4562761109666247, -0.1863296544514967, 0.8089575764002137, 0.189562850340474, 0.7063280248029717, -0.5799076128640501, 0.0484300638547137, 0.9238734302048255, -0.8614551713882048, -0.8471481085424433, -0.6126509021507069, -0.0826241274059227, 0.7315809599663838, 0.0028585673732655, -0.9690290789436693, -0.9942010555026641, 0.2539455441017773, 0.4121191265280162, -0.3449726490025427, 0.9047088680702231, -0.5994243637007122, 0.9851786129759774, 0.3103279231830665, 0.5864689515727646, -0.7138353846669605, 0.8182037950662489, -0.6015379051981822, -0.1376790767983396, 0.4194368963293784, -0.6440180228466601, -0.2192680161160743, -0.7043731803761335, 0.19041378513142648, -0.484916904145881, 0.4713920130628773, -0.6940909708875105, 0.0200648046255716, -0.2878347333738205, 0.5182255840254895, 0.9594174097374761, -0.5306819857047755, -0.858009679057461];       // 2440


  // population[0].weights = [-0.4296061872198167, 0.0660926129049004, -0.3221363778579351, 0.5942521231611742, 0.8611151011301508, -0.3755447261897733, 0.5132178481383387, -0.7651911024020728, -0.9437484918570633, 0.1202407389546862, 0.9611706494422267, 0.9349383989617581, -0.2602913897968282, -0.7210566458557510, 0.4091498022089524, -0.2926285668932649, 0.8715596598041322, 0.6919769104554616, 0.9535374959152922, 0.4364759786118677, -0.1246339698839578, -0.46969978098702914, -0.9899550361236216, 0.5784512807811102, 0.6770736976781153, 0.9403854185271565, -0.0047660172533339, 0.8708687308239478, 0.1756977843172463, 0.2909871586809278, 0.8517691076969878, 0.0843847111142106, -0.2133321766307219, -0.2362728956354214, -0.7692941100643043, -0.5356588062310461, -0.4475540310777459, -0.2127547093135651, -0.3507521782538259, -0.4685913377923097, -0.5539421796100692, 0.3309065227777315, 0.4691550688022272, 0.4470068656294615, 0.4429229928764427, -0.2813707201978732, -0.4717029758429958, -0.8965383915807106, -0.0060376421446859, -0.2707645365592852, 0.6915738124629121, 0.0629029092569020, 0.1664898868218350, -0.5314307274214602, 0.1974774008306106, 0.9419361915166382, 0.0609932873364301, 0.1226859890084091, 0.9144791714125149, 0.6425142021766153, 0.3502937933949450, -0.0785493473668200, -0.0101976610374463, -0.3615325994909835, 0.6074362828749984, -0.0869922068517934, 0.4531826251293398, -0.6989447886418718, 0.5659057988286902, -0.5740783858306964, -0.5769198700339739, -0.8588998260008252, -0.4583542139713419, 0.1928012515473227, -0.6312796444294864, 0.3131539421948375, 0.7248612021475354, -0.4903773589396989, -0.2055774338276115, -0.5932862420727179, -0.1071099704532696, 0.1269412286059461, 0.0684105879126973, -0.4828492201085517, -0.5572930819381194, 0.0456401718726340, 0.643886601843743, -0.3333904565429417, 0.5811246169850017, -0.48344433476624493, -0.9378321787323882, -0.1196494480791479, 0.9376532947950444, 0.3161744022553821, -0.7377000009702095, 0.1939807477089452, 0.1074284110393338, -0.9978117750348923, -0.4735988279225332, -0.4887141694908888, 0.7383006195606168, 0.7559416642509103, -0.8270702666016518, -0.5557003793020332, -0.2553206361088662, 0.1556886415902579, 0.5407387604363483, -0.1605977088691506, 0.4974504964851056, -0.8362394689147150, 0.1897883479695972, -0.0610255441561662, 0.12370784671765866, -0.29039702651652055, 0.7337495138609769, -0.4877305713173330, -0.5544113742264605, 0.0949507707956876, -0.0636413326532907, 0.4028477639681589, 0.9585224410253428, 0.5607318398510355, 0.3580552407333428, 0.1979902876882358, 0.2398590814469959, 0.5093223930677993, 0.9243602774866622, -0.5863792863622046, 0.4598503410843575, 0.8101795973707824, -0.4146442879312526, 0.8937529764692882, 0.5977439154157245, -0.0689278104524171, 0.2749444352429751, -0.8547928028450196, 0.1010634163080573, -0.2646684647733895, -0.2180640359331374, 0.8527191071175140, 0.3275206014183643, -0.8453362510032134, -0.3845910151352969, 0.7244205934020886, -0.1023116906929742, 0.9442583123503283, 0.48521583638280585, 0.16524665189777954, -0.6676765857722238, -0.6201895605409522, -0.4104540694809731, 0.1714667681706037, -0.4944820948961706, -0.1959556672446778, -0.3454555350593536, 0.3423929195566449, 0.4568558637466191, -0.8239486314979816, 0.1791348962708170, 0.8680532991477450, 0.7894423948652585, 0.2065421984105349, 0.2223160209852071, 0.1392107557206517, -0.9331057701120828, 0.9678596337705252, 0.8871845212760578, -0.3222580335178971, -0.4339560873412989, -0.7922852761317967, -0.27848127334392236, -0.3038507401391159, -0.7244068314661964, -0.4618952316080502, -0.9816116558830283, -0.8548439139857265, -0.9078926205320168, 0.5087456771440042, 0.0710397862319136, -0.0903992100816904, -0.2553152984996743, -0.6041937579352670, 0.3442401351098692, -0.2512784952301006, 0.8089575764002137, 0.1895628503404740, 0.9526016660441212, -0.1566203011286436, 0.3408212423293646, 0.6998951356050567, -0.28744003393880346, -0.8471481085424433, -0.6126509021507069, 0.1379082921879684, 0.7315809599663838, 0.0028585673732655, -0.9690290789436693, -0.2301234291129504, -0.4785871269986943, -0.9741338025629367, -0.3449726490025427, 0.5265190551471539, 0.2557079786758854, 0.7870731789581447, 0.8279381068724896, -0.4965039616431359, 0.8319759747185227, 0.9876555272144802, 0.7149873260529156, -0.5342172467104267, -0.2226333264826938, -0.4276775136834212, -0.2192680161160743, -0.7043731803761335, 0.19041378513142648, -0.4830312293671088, 0.9377355843451589, -0.6435393886689988, -0.8200815331594367, -0.2878347333738205, 0.5182255840254895, 0.9594174097374761, -0.9229160444506408, -0.4501085443149027]; // 8366
  // population[1].weights = [-0.1582780941870054, 0.0660926129049004, -0.0395974609830874, 0.5942521231611742, 0.8611151011301508, -0.6378757909788395, 0.5132178481383387, -0.7651911024020728, -0.9437484918570633, 0.1202407389546862, 0.9611706494422267, 0.5610231342575256, -0.2602913897968282, -0.721056645855751, 0.4876540864342389, -0.2926285668932649, 0.6731448767110018, -0.3750566956604047, 0.9535374959152922, -0.4508009144588199, -0.1246339698839578, -0.46969978098702914, -0.9899550361236216, 0.5784512807811102, 0.6770736976781153, 0.9403854185271565, -0.0047660172533339, 0.8708687308239478, 0.3714488281394175, 0.8741551744941245, -0.0967445976652836, 0.0843847111142106, -0.8048015039607543, 0.4249193902412562, -0.1186457660359475, 0.5350944946053273, -0.4475540310777459, -0.2127547093135651, -0.3507521782538259, -0.4685913377923097, -0.5539421796100692, 0.3309065227777315, 0.4691550688022272, 0.4470068656294615, 0.1274026276893006, -0.2813707201978732, -0.2839929454069208, -0.8965383915807106, -0.0060376421446859, -0.2707645365592852, 0.691573812462912, 0.062902909256902, -0.7297309682487136, -0.5314307274214602, 0.1974774008306106, 0.1182351376595383, -0.0174351323563569, 0.2317008621220902, 0.9144791714125149, 0.6425142021766153, -0.5752111525273214, -0.07854934736682, 0.7768814433178908, -0.3615325994909835, 0.6813410787649214, 0.5036658060944097, -0.4658601725056277, -0.2515211713943608, 0.5659057988286902, -0.5740783858306964, -0.5769198700339739, -0.8588998260008252, -0.4583542139713419, 0.1928012515473227, 0.1823408131673165, 0.3131539421948375, 0.7248612021475354, -0.4903773589396989, -0.6732644899543851, -0.1577023569977456, -0.1071099704532696, 0.7309494326224129, 0.0684105879126973, -0.4828492201085517, -0.5572930819381194, 0.045640171872634, 0.643886601843743, -0.3333904565429417, 0.5811246169850017, 0.6238363451614450, 0.7365483571833424, -0.1196494480791479, 0.9376532947950444, 0.3161744022553821, -0.7377000009702095, -0.4641521382105740, 0.1074284110393338, 0.8709801073553836, -0.4735988279225332, -0.4887141694908888, 0.7383006195606168, 0.7559416642509103, -0.1221661791387447, -0.5557003793020332, -0.2553206361088662, -0.7448326413815538, -0.2731366687801202, 0.9742481245474175, 0.4974504964851056, -0.836239468914715, 0.1897883479695972, -0.1181670805767867, -0.9429234154468484, -0.29039702651652055, 0.7337495138609769, -0.487730571317333, -0.5544113742264605, 0.0949507707956876, -0.2046266439496769, 0.4028477639681589, 0.9585224410253428, 0.9271199455387662, 0.3580552407333428, 0.1979902876882358, 0.2398590814469959, 0.5093223930677993, 0.9243602774866622, -0.5863792863622046, -0.1320611489666184, 0.8101795973707824, -0.4146442879312526, 0.0295253050129674, 0.7683959911387537, -0.0689278104524171, 0.2749444352429751, 0.1264250938820317, 0.1010634163080573, 0.2964189798260248, -0.2180640359331374, 0.852719107117514, 0.4270808570355413, -0.8453362510032134, -0.0653788318615964, 0.7244205934020886, -0.7533802126636449, 0.9168946151746042, 0.48521583638280585, 0.16524665189777954, -0.3854341637584295, -0.8053615091245692, -0.4104540694809731, -0.1800265870827111, -0.4944820948961706, -0.1959556672446778, -0.3454555350593536, 0.3423929195566449, 0.4568558637466191, -0.8239486314979816, 0.1982914798408348, -0.8752927795162311, 0.4759774603713480, -0.4547477310691104, 0.0053012852708378, 0.1392107557206517, -0.2055808577303573, -0.9506176796339396, 0.8871845212760578, 0.7162017598057555, -0.4339560873412989, 0.0499534479694304, 0.0490354827330535, -0.5860557863701721, -0.8519889690217357, -0.4618952316080502, -0.9816116558830283, 0.6964718442311435, 0.4217743715174684, -0.1747632235349545, -0.9673602643429575, -0.0903992100816904, -0.2553152984996743, -0.604193757935267, 0.3442401351098692, -0.0172410957540610, 0.8089575764002137, 0.189562850340474, 0.8618131691069864, -0.1566203011286436, 0.2537650804944032, 0.9238734302048255, -0.28744003393880346, -0.8471481085424433, -0.6126509021507069, 0.0666912523276846, 0.7315809599663838, 0.0028585673732655, -0.9690290789436693, -0.2301234291129504, 0.2539455441017773, -0.7216877212657731, -0.3449726490025427, 0.5265190551471539, -0.0418594725549073, 0.9851786129759774, 0.3103279231830665, 0.3159177970739684, 0.8319759747185227, 0.9876555272144802, 0.2773967291103654, -0.1376790767983396, -0.0497196528763997, -0.6440180228466601, -0.2192680161160743, -0.7043731803761335, 0.19041378513142648, -0.4849169041458810, 0.5777856461144215, -0.6435393886689988, 0.0360964558543055, -0.2878347333738205, 0.5182255840254895, 0.9594174097374761, -0.5306819857047755, -0.8580096790574609] // 3305

  // 280
  // population.push({ id: 0, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });
  // population.push({ id: 1, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });
  // population.push({ id: 2, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });
  // population.push({ id: 3, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });
  // population.push({ id: 4, weights: [0.28792148964033304, -0.3906827138360778, 0.5765998670065868, 0.620446990573571, 0.38157217805406907, -0.6968075396047095, 0.1857371347657426, -0.4108996443145845, -0.8813014444296803, 0.7414964686589838, 0.748127235194521, -0.996345041915482, -0.7491622549480557, 0.176234524836004, 0.19208077901534049, 0.8888502119700776, -0.3201076403881973, 0.23602371752060236, -0.45690118083223785, -0.6081109255491777, -0.7092153256908533, -0.7553253096973709, 0.015474494149699147, 0.7293496764670317, -0.7983536073592306, 0.5851276055393035, 0.40494856331420603, -0.9134782681823519, 0.8123906545598767, 0.9746794851287772, 0.7527258353347119, 0.6046866942098745, 0.9051165272458555, -0.9371852365191691, 0.1366036931751311, -0.5650273125100758, -0.28481698282719403, 0.06508228597012655, -0.5622549244729078, 0.17580345912018114, -0.7286733275313981, 0.00002961254650069023, 0.7699225546918815, 0.04470918253759271, 0.4422237572114125, 0.18704334909434683, -0.6091196263313172, -0.9369667340925396, 0.34374942062551783, 0.42204954281412954, -0.9566375981424371, 0.6837974526558108, 0.043266854728804205, 0.4666716844827272, 0.62484978305721, 0.33544728037355176, -0.5565792640307414, 0.19889975650642144, -0.031574284415883724, -0.9770851429257559, 0.3923842414591463, 0.9383381091041159, 0.6636389780939149, -0.34274352268577823, 0.9876931894036614, -0.9343226830095501, 0.6953018149196577, 0.6302199365923027, -0.31504121425648224, -0.4435840246757343, -0.5525476543041465, -0.027950284934791014, -0.11217470042767719, 0.7856280592061644, -0.28273467822821585, -0.8962608109900345, -0.9998883608588911, -0.149854470704057, 0.5257875170757238, 0.7226732849241246, -0.3452514894186587, 0.07140088680057133, -0.9937918538693333, 0.3977037026178212, -0.5063608763618692, 0.5937374292105493, 0.2171507916496731, -0.6153298904792925, -0.3737011003627715, -0.48889180972173696, -0.0602258657600343, 0.8468880255521425, 0.039401308775373955, 0.5924047555239205, -0.46090077250161476, 0.4429245501645518, -0.6682382004523628, 0.24689723305696543, -0.9423483139398172, -0.6616612191225162, -0.9173249837676805, 0.889721349091877, 0.37632233962476347, -0.10619873960599202, -0.38373552576057346, -0.5885589046963386, -0.9489482671370575, 0.6259481629742569, 0.7221717936027732, 0.9261646223156976, 0.5240247044113095, -0.8802787709985487, -0.6244595085084872, -0.8347830377480188, 0.238863642936483, -0.4386806968257808, 0.7736936158119385, -0.8977809755416088, 0.986686960176741, 0.3064976524525531, -0.4896039737938316, -0.17345248196300211, -0.9864971254627739, 0.49003215768361263, 0.3495443051166438, 0.04732145745278915, -0.820544901962307, -0.6459906719150252, -0.5315535065079069, -0.23259414303011594, -0.847607543408678, -0.7877899607909677, -0.5540098680717955, -0.39068092428446066, -0.47919649793191343, -0.19847097079358145, -0.9597830464300761, 0.709164553760306, -0.036661948372203046, 0.20861106665999163, 0.20269710096181592, -0.10402058745248155, 0.5025298996337915, 0.6893905203332031, -0.23487437376487552, 0.6563891003261522, -0.8731797581392069, 0.925439643017056, 0.188677905511224, -0.32082933863623175, -0.5239863524623716, 0.42099353660244, 0.4992011104788019, -0.2589801951563926, 0.6466756351086667, -0.6646071309747623, -0.4089482542493341, -0.8242791972897061, 0.41900394155647813, 0.038495815543920564, -0.21851507826364003, -0.7966680574011851, -0.1899947880918602, -0.8233925297839186, 0.9970845119864489, -0.3365188261090841, -0.07735374818155938, -0.2605646883004149, -0.45095504915076656, -0.1935166121980001, 0.9231392958490567, 0.7196207764189562, 0.3474861442213788, 0.09924649896411264, -0.3585640314669787, -0.6105401669948449, -0.6350175613013636, -0.004087120220188201, -0.14071458932964953, 0.02101792415392012, -0.5733611939293524, 0.497615825024988, -0.4178739155808189, 0.395014591272564, 0.7265761243643767, -0.8548959520509274, 0.6301424794158272, 0.9978190041244881, -0.17797701977517777, -0.3498731202286631, 0.3594323583480903, -0.8021769780733643, 0.378091580433523, 0.2366977254688023, -0.7880439264403489, -0.2772789355981189, -0.4666714631921409, -0.08942069458198754, 0.9981719991692617, 0.6938827816362401, -0.7521345087474893, -0.3611193684133087, 0.18768402047490218, 0.309349162825876, 0.058689428381794695, 0.6518872081657578, 0.45549414935389887, 0.7823475721503468, -0.28343223981926613, 0.35778857985796586, -0.0981260491367637, 0.4174099972633587, -0.5530591018902697, -0.8225756632837968, 0.07591382247870015, 0.2708814718577859, -0.5202257424148411, -0.19410062498726743, -0.05213018961724991, 0.17810762740665353, -0.5896129951868398, -0.6845182085733001, 0.03616084929262664, -0.5329738640919675, -0.11400656582901236, 0.039684727540565845, -0.18232402500244227, 0.06810412280237665, -0.5939903669992863, 0.12615684737841892, -0.5647340822782061, 0.5261958584053792, -0.4641712452472184, 0.361647406150468, -0.7801477993194852, -0.5215116596622016, 0.24225133480287342, -0.427875299915335, -0.4471543869195713, 0.136801390422848, -0.733763943115286, 0.9437757240204618, 0.2949982873225965, -0.3233058344817321, 0.22525297062392058, 0.04432447244820015, -0.09455146397235081, -0.06458294210431692, 0.47301691103280863, 0.7645650309761942, 0.33024238709132225, -0.6044637027919371, 0.984426832657642, -0.2752219285876345, 0.9004591270581019, -0.48265625746080865, -0.5883201306720189, 0.9270850421280357, 0.12721355476147655, -0.6789192408498592, 0.9501467354696174, -0.7387609612508825, -0.4542628254677634, -0.5598625270770565, -0.15137098629558343, -0.9425801452591962, -0.5549661338427008, 0.780739989364525, 0.7699547898616288, 0.6038787063436661, 0.6568431815448639, -0.7580511498939466, 0.7566020881766184, -0.4944749487729605, -0.9616831200742659, 0.88924758648644, -0.19979987726487103, -0.9226387456561342, -0.5869585617158264, 0.17782036585680716], value: 0 });
  // population.push({ id: 5, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });
  // population.push({ id: 6, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });
  // population.push({ id: 7, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });
  // population.push({ id: 8, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });
  // population.push({ id: 9, weights: [-0.7676971784484548, -0.7540083527507058, -0.08860577046221962, -0.8184415130770564, 0.41952749169644843, -0.10028628850753885, -0.33130107535799214, -0.9553241403414243, -0.5319513270762624, 0.4766856463207132, 0.5229871907374672, -0.05748223576886913, 0.502425545922808, -0.6706586901106903, 0.31261259542731645, -0.8350354216758307, -0.6599548844643546, -0.314168116709431, 0.07731818190402073, -0.46825728357152885, 0.14540585820720553, 0.9957044515753171, -0.6974274410565231, 0.7638767287693091, -0.03822547532385423, -0.41788558627308925, 0.11305230844919079, -0.8341799212968919, -0.41164283448988437, 0.8323303954647976, -0.5687569166032458, -0.5887925838135963, 0.8196430015178593, 0.31166016652575346, -0.43353056204704643, -0.06116852974175746, 0.060149601760031146, -0.7760544091466612, 0.2997756575042181, -0.1676583732504855, 0.8035867605892686, -0.1099417230691686, 0.27749424120029076, 0.22850377796007226, 0.49329149874120803, -0.8447269929879888, 0.9945414845957106, -0.22659002390830585, -0.10103871746753734, -0.07670474350157441, 0.0804735566028918, 0.3660786922324677, 0.865919301523665, -0.4418141772062967, 0.4952202055425152, -0.3968756896117127, 0.03192841100847321, 0.3506818765539488, -0.5014750741152008, 0.6391862062596085, -0.3632348183363816, -0.042632823016472976, 0.9912998284288608, 0.6400457224979017, -0.08008185523758016, 0.10562757574192672, 0.889461526542743, -0.49675649757179263, -0.2602849163921026, -0.8311540974827558, 0.5558446758351931, 0.8683033563344806, -0.7119202493972345, 0.31448111285799474, -0.8102069899168276, 0.41785026105776346, -0.9340361009565918, -0.4666016164277922, -0.2210411582957632, -0.6266519946684022, 0.07593101800398383, 0.2792203480381734, -0.1667687290968991, -0.833505663708257, -0.5248488753822715, 0.8843872180946488, 0.7813666256913288, -0.8300662031974007, -0.4224425031037278, -0.048612559293399915, 0.5715510780100139, -0.23850349933703763, 0.045247120414817044, 0.1903969020804861, 0.12000598272449858, -0.41117182713053424, 0.07537467559224442, -0.7740707713527577, 0.2828050120602068, 0.5189372251811535, -0.14778875252867474, 0.708716263815115, -0.7906597429772795, -0.3224328544220807, -0.8814792005769783, 0.643355261332295, 0.8359475642900724, 0.372447631283233, -0.3877582448117898, 0.1553476919205421, -0.24058252894827437, -0.8162691841608147, -0.799951604459018, -0.5353477818312484, 0.11179510939761705, 0.8220897578160309, 0.744087867711742, -0.519020069781122, 0.9185035445241576, -0.49083673099310854, 0.8382063805757949, 0.17536288134585964, 0.28646012542079946, 0.3445681620001677, -0.9282946571553485, -0.023350752693914067, 0.6299902541097273, -0.5146921689171617, -0.1448088849010074, 0.17699260060882693, -0.039042591286314376, -0.07971868624498146, -0.07830346078387551, 0.09667051996193043, -0.7639680136212119, -0.3997438263741011, 0.23301167710452164, -0.6407468347095535, -0.9385643676429671, 0.5484113507677129, -0.7958765366943261, -0.33582269300931333, 0.2361814538904028, 0.6761126794819345, -0.666793016632039, 0.24934491866832964, 0.47099376565101014, 0.8627047071277714, 0.2587482810271986, -0.3683659735435212, 0.6728437317944636, -0.1426663589826811, 0.10334091502861353, -0.13067899666650717, 0.913362047252384, -0.3534114868971119, -0.5996047058940581, 0.8341130123273128, -0.6597190033273943, -0.2554322201468242, -0.6198703605496103, 0.5160128305775951, -0.30403002007617097, -0.31684522665116743, 0.7123231490021205, 0.24527003171439832, -0.2038559600467269, -0.7680499784256236, -0.16697118899887897, 0.6736060689753915, -0.5360196754486131, 0.06155190871351435, 0.5530854410336201, -0.937376192599003, -0.14193185874767877, 0.9527122044361263, -0.34876807301737944, -0.3096286171184226, -0.6289643901560229, -0.6656984408243498, 0.729444705801364, -0.08128320979838666, 0.3977859263977872, 0.5914104103615148, -0.7909742858297699, -0.8756921602354475, 0.15461576626129947, 0.5542302977497711, -0.10881396461173631, 0.405472046716548, 0.1805024956636916, -0.4710303775159135, -0.7394275758780426, -0.7970782564141436, -0.9520906819861752, 0.9481534720604636, -0.3261783930819693, -0.6598719312611339, 0.7215179520865971, -0.13330373797909623, 0.9814480087556441, 0.9377921626661827, 0.15205921872682682, -0.6085425974877579, -0.3448488836064776, -0.9566928406289121, -0.10608765088738492, -0.3688168160950749, 0.25904929967399326, 0.9834265820775205, -0.3739561914319247, -0.13277297954565714, -0.2632912682052959, -0.2551645207133908, -0.016549709270997415, -0.5698041714210933, -0.03066224708712495, 0.6001323534398582, 0.2487564525416901, -0.28575777223885446, -0.8694198540845028, -0.1662358926751315, 0.4223794453961802, 0.30584108415469746, 0.28295271565196867, 0.938486810025378, 0.7424329548365969, -0.03886595724091668, 0.3178186534219338, -0.5875907173558153, 0.8192051544188388, -0.24087983628552356, -0.17096355191838075, 0.38727014758137956, -0.5448813719596814, -0.38964515370348574, 0.37828129906472263, 0.9711523074851276, -0.295675972468167, 0.08306149838749821, 0.9344330746200926, 0.5677986181442018, 0.4971519714038437, -0.6763621881700592, 0.482914964778395, -0.13342094950855587, -0.6626389100459305, 0.6250790560156894, -0.8995065764148569, -0.3332484871859305, -0.11865564315254362, 0.00839272562337845, 0.6102371809570237, 0.7865747619694021, 0.21618501944563429, 0.6721552992697859, 0.47334097438063605, 0.2173387867467822, 0.5173423043451106, 0.5853375373626446, -0.1672450580967899, -0.3943736720881348, -0.21254914640400102, 0.13452046408921436, 0.9225251711102822, -0.4165386729424867, 0.6654041796581787, 0.1673402888047435, -0.9177831907048484, -0.0030732448559449566, 0.7247141989575221, 0.5673724224611454, 0.9951793954197155, -0.7737252311375107, -0.6838369854488371, 0.4959765783956782, 0.08176043392184429, -0.06672018534065627, 0.739668640946979, -0.02796844607263882], value: 0 });

  // TODO Criar levels das frutas
  // for (let i = 0; i < 255; i++)
  // food.push({ x: Math.round(Math.random() * (renderScr.canvas.width - 30) / 10) * 10 + 20, y: Math.round(Math.random() * (renderScr.canvas.height - 30) / 10) * 10 + 20 });
  food = [{ x: 190, y: 340 }, { x: 490, y: 40 }, { x: 120, y: 60 }, { x: 800, y: 270 }, { x: 810, y: 580 }, { x: 740, y: 320 }, { x: 370, y: 120 }, { x: 190, y: 840 }, { x: 430, y: 190 }, { x: 870, y: 430 }, { x: 890, y: 610 }, { x: 530, y: 350 }, { x: 400, y: 290 }, { x: 170, y: 260 }, { x: 330, y: 140 }, { x: 550, y: 300 }, { x: 230, y: 570 }, { x: 620, y: 740 }, { x: 740, y: 730 }, { x: 610, y: 140 }, { x: 120, y: 350 }, { x: 330, y: 350 }, { x: 20, y: 320 }, { x: 30, y: 480 }, { x: 830, y: 330 }, { x: 830, y: 50 }, { x: 70, y: 830 }, { x: 330, y: 620 }, { x: 870, y: 610 }, { x: 230, y: 500 }, { x: 630, y: 560 }, { x: 860, y: 390 }, { x: 840, y: 40 }, { x: 230, y: 910 }, { x: 570, y: 500 }, { x: 750, y: 660 }, { x: 540, y: 190 }, { x: 40, y: 360 }, { x: 420, y: 790 }, { x: 400, y: 330 }, { x: 470, y: 750 }, { x: 310, y: 580 }, { x: 720, y: 720 }, { x: 710, y: 890 }, { x: 940, y: 730 }, { x: 460, y: 70 }, { x: 130, y: 640 }, { x: 860, y: 520 }, { x: 610, y: 620 }, { x: 200, y: 690 }, { x: 830, y: 660 }, { x: 600, y: 300 }, { x: 870, y: 390 }, { x: 680, y: 30 }, { x: 870, y: 890 }, { x: 100, y: 820 }, { x: 50, y: 40 }, { x: 70, y: 50 }, { x: 800, y: 820 }, { x: 160, y: 260 }, { x: 40, y: 770 }, { x: 860, y: 870 }, { x: 340, y: 300 }, { x: 480, y: 670 }, { x: 220, y: 240 }, { x: 640, y: 600 }, { x: 570, y: 730 }, { x: 860, y: 820 }, { x: 790, y: 700 }, { x: 710, y: 860 }, { x: 540, y: 170 }, { x: 50, y: 490 }, { x: 900, y: 890 }, { x: 110, y: 620 }, { x: 630, y: 190 }, { x: 540, y: 770 }, { x: 900, y: 710 }, { x: 750, y: 310 }, { x: 200, y: 850 }, { x: 110, y: 590 }, { x: 500, y: 380 }, { x: 840, y: 400 }, { x: 520, y: 60 }, { x: 240, y: 340 }, { x: 60, y: 150 }, { x: 230, y: 780 }, { x: 460, y: 930 }, { x: 260, y: 740 }, { x: 80, y: 780 }, { x: 720, y: 690 }, { x: 120, y: 300 }, { x: 710, y: 890 }, { x: 250, y: 910 }, { x: 290, y: 520 }, { x: 170, y: 590 }, { x: 480, y: 310 }, { x: 310, y: 210 }, { x: 340, y: 400 }, { x: 280, y: 330 }, { x: 80, y: 860 }, { x: 590, y: 70 }, { x: 520, y: 840 }, { x: 260, y: 870 }, { x: 510, y: 650 }, { x: 860, y: 380 }, { x: 110, y: 260 }, { x: 760, y: 440 }, { x: 930, y: 110 }, { x: 250, y: 590 }, { x: 80, y: 170 }, { x: 780, y: 590 }, { x: 280, y: 750 }, { x: 700, y: 160 }, { x: 160, y: 860 }, { x: 440, y: 40 }, { x: 240, y: 50 }, { x: 90, y: 850 }, { x: 180, y: 600 }, { x: 650, y: 600 }, { x: 900, y: 720 }, { x: 840, y: 200 }, { x: 910, y: 500 }, { x: 710, y: 470 }, { x: 590, y: 880 }, { x: 890, y: 370 }, { x: 590, y: 300 }, { x: 700, y: 570 }, { x: 660, y: 540 }, { x: 800, y: 860 }, { x: 350, y: 170 }, { x: 460, y: 490 }, { x: 920, y: 480 }, { x: 560, y: 470 }, { x: 660, y: 80 }, { x: 500, y: 680 }, { x: 480, y: 330 }, { x: 300, y: 660 }, { x: 70, y: 170 }, { x: 260, y: 400 }, { x: 80, y: 30 }, { x: 60, y: 310 }, { x: 80, y: 440 }, { x: 350, y: 90 }, { x: 20, y: 860 }, { x: 250, y: 140 }, { x: 150, y: 360 }, { x: 520, y: 60 }, { x: 800, y: 930 }, { x: 730, y: 510 }, { x: 710, y: 300 }, { x: 750, y: 810 }, { x: 350, y: 410 }, { x: 110, y: 580 }, { x: 70, y: 40 }, { x: 780, y: 480 }, { x: 370, y: 760 }, { x: 780, y: 640 }, { x: 40, y: 170 }, { x: 840, y: 490 }, { x: 140, y: 30 }, { x: 220, y: 150 }, { x: 270, y: 650 }, { x: 230, y: 240 }, { x: 190, y: 440 }, { x: 580, y: 300 }, { x: 870, y: 380 }, { x: 610, y: 830 }, { x: 170, y: 180 }, { x: 740, y: 250 }, { x: 750, y: 580 }, { x: 770, y: 480 }, { x: 660, y: 360 }, { x: 510, y: 690 }, { x: 390, y: 390 }, { x: 890, y: 610 }, { x: 560, y: 150 }, { x: 570, y: 570 }, { x: 330, y: 790 }, { x: 840, y: 900 }, { x: 520, y: 320 }, { x: 320, y: 370 }, { x: 700, y: 470 }, { x: 570, y: 880 }, { x: 640, y: 290 }, { x: 940, y: 690 }, { x: 180, y: 900 }, { x: 890, y: 660 }, { x: 220, y: 720 }, { x: 140, y: 890 }, { x: 740, y: 100 }, { x: 110, y: 450 }, { x: 580, y: 550 }, { x: 850, y: 840 }, { x: 780, y: 700 }, { x: 810, y: 930 }, { x: 560, y: 750 }, { x: 890, y: 240 }, { x: 710, y: 150 }, { x: 510, y: 390 }, { x: 310, y: 540 }, { x: 820, y: 860 }, { x: 260, y: 700 }, { x: 210, y: 670 }, { x: 670, y: 160 }, { x: 850, y: 160 }, { x: 830, y: 310 }, { x: 860, y: 80 }, { x: 580, y: 160 }, { x: 230, y: 880 }, { x: 400, y: 550 }, { x: 370, y: 910 }, { x: 800, y: 470 }, { x: 510, y: 650 }, { x: 370, y: 860 }, { x: 190, y: 290 }, { x: 100, y: 570 }, { x: 320, y: 940 }, { x: 270, y: 540 }, { x: 170, y: 360 }, { x: 190, y: 280 }, { x: 430, y: 870 }, { x: 210, y: 760 }, { x: 680, y: 600 }, { x: 640, y: 820 }, { x: 490, y: 600 }, { x: 720, y: 70 }, { x: 450, y: 450 }, { x: 740, y: 290 }, { x: 640, y: 600 }, { x: 360, y: 690 }, { x: 440, y: 600 }, { x: 420, y: 310 }, { x: 440, y: 340 }, { x: 890, y: 700 }, { x: 130, y: 640 }, { x: 910, y: 550 }, { x: 430, y: 140 }, { x: 120, y: 140 }, { x: 570, y: 890 }, { x: 540, y: 500 }, { x: 280, y: 620 }, { x: 130, y: 740 }, { x: 700, y: 640 }, { x: 310, y: 730 }, { x: 400, y: 910 }, { x: 290, y: 280 }, { x: 910, y: 270 }, { x: 640, y: 220 }, { x: 490, y: 520 }, { x: 890, y: 860 }, { x: 630, y: 760 }, { x: 840, y: 50 }, { x: 80, y: 870 }, { x: 520, y: 860 }, { x: 210, y: 590 }]

  // Peso inicial
  network.setWeights(population[0].weights);

  // pop++;
  reset();
  main();
}

start();
