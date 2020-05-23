// no onload event listener needed since script is at bottom of page

const CHAR_WIDTH = 32;
const CHAR_HEIGHT = 32;

const SCREEN_ROWS = 25;
const SCREEN_COLUMNS = 40;

const SQUARE_SIZE = 4;
const SQUARE_DIAGONAL = 4 * 2 ** 0.5;

const SCROLL_NUM = 2;

const MAX_TIME_DIFF = 1000 / 15;

const FPS = 30;

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
  "canvas"
));

const context = canvas.getContext("2d");

//context.textBaseline = "top";
//context.textAlign = "start";
context.strokeStyle = "white";
context.lineWidth = SQUARE_DIAGONAL;

let row = 0;
let col = 0;
let steps = 0;
let offset = 0;

let currRealTime = 0;
let prevRealTime = 0;
let wastedRealTime = 0;

let prevSimTime = 0;
let currSimTime = 0;

context.font = "32px serif";

let speed = () => 200 * Math.max(0, Math.cos(currRealTime / 240));
//let prob = () => Math.random() > 0.5;
//let prob = () => Math.sin(row + col * Math.cos(steps / 1e5)) > 0;
let prob = () => Math.tan((steps / 500) * (steps / 1000)) > 0;

const drawChar = (side, x, y) => {
  const corners = side
    ? {
        x1: SQUARE_SIZE / 2,
        y1: SQUARE_SIZE / 2,
        x2: CHAR_WIDTH - SQUARE_SIZE / 2,
        y2: CHAR_HEIGHT - SQUARE_SIZE / 2,
      }
    : {
        x1: CHAR_WIDTH - SQUARE_SIZE / 2,
        y1: SQUARE_SIZE / 2,
        x2: SQUARE_SIZE / 2,
        y2: CHAR_HEIGHT - SQUARE_SIZE / 2,
      };
  // draw diagonal lines
  context.beginPath();
  context.moveTo(corners.x1 + x, corners.y1 + y);
  context.lineTo(corners.x2 + x, corners.y2 + y);
  context.stroke();

  // draw caps
  const drawCap = (middleX, middleY) => {
    context.fillRect(
      middleX - SQUARE_SIZE / 2 + x,
      middleY - SQUARE_SIZE / 2 + y,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
  };

  drawCap(corners.x1, corners.y1);
  drawCap(corners.x2, corners.y2);
};

context.fillStyle = "black";
context.fillRect(
  0,
  0,
  SCREEN_COLUMNS * CHAR_WIDTH,
  SCREEN_COLUMNS * CHAR_HEIGHT
);
context.fillStyle = "white";

const loop = (totalTime = 0) => {
  let timeDiff = totalTime - (prevRealTime + wastedRealTime);
  if (timeDiff > MAX_TIME_DIFF) {
    wastedRealTime += timeDiff - MAX_TIME_DIFF;
    // recalculate the difference in time
    timeDiff = totalTime - (prevRealTime + wastedRealTime);
  }
  currRealTime += timeDiff;
  currSimTime += timeDiff * speed();
  console.log(speed());
  //console.log(timeDiff);
  const prevSteps = Math.floor(prevSimTime / 1000);
  const currSteps = Math.floor(currSimTime / 1000);
  //console.log(prevSteps);
  //console.log(currSteps);
  //console.log("prev - curr " + (currSteps - prevSteps));

  for (let i = prevSteps; i < currSteps; i++) {
    col = steps % SCREEN_COLUMNS;
    row = Math.floor(steps / SCREEN_COLUMNS);
    drawChar(
      prob(),
      ((steps - offset) % SCREEN_COLUMNS) * CHAR_WIDTH,
      Math.floor((i - offset) / SCREEN_COLUMNS) * CHAR_HEIGHT
    );
    steps++;
    // scroll the screen up if needed
    if (steps - offset === SCREEN_ROWS * SCREEN_COLUMNS) {
      offset += SCREEN_COLUMNS * SCROLL_NUM;
      context.drawImage(canvas, 0, -SCROLL_NUM * CHAR_HEIGHT);
      context.fillStyle = "black";
      context.fillRect(
        0,
        (SCREEN_ROWS - SCROLL_NUM) * CHAR_HEIGHT,
        SCREEN_COLUMNS * CHAR_WIDTH,
        SCREEN_ROWS * CHAR_HEIGHT
      );
      context.fillStyle = "white";
    }
  }
  prevRealTime = currRealTime;
  prevSimTime = currSimTime;
  requestAnimationFrame(loop);
};

loop();
