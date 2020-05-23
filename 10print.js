// no onload event listener needed since script is at bottom of page

const CHAR_WIDTH = 32;
const CHAR_HEIGHT = 32;

const SCREEN_ROWS = 25;
const SCREEN_COLUMNS = 40;

const SQUARE_SIZE = 4;
const SQUARE_DIAGONAL = 4 * 2 ** 0.5;

const SCROLL_NUM = 2;

const MAX_TIME_DIFF = 1000 / 15;

const FPS = 60;

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
let chars = 0;
let steps = 0;
let offset = 0;

let currTime = 0;
let prevTime = 0;
let wastedTime = 0;
let targetChars = 0;

context.font = "32px serif";

//let speed = () => 200 * Math.max(0, Math.cos(steps / 20));
let speed = () => 100 * (1 + Math.cos(steps / 20));
//let speed = () => 1;
//let prob = () => Math.random() > 0.5;
//let prob = () => Math.sin(row + col * Math.cos(steps / 1e5)) > 0;
let prob = () => Math.tan((chars / 500) * (chars / 1000)) > 0;

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
  let timeDiff = totalTime - (prevTime + wastedTime);
  if (timeDiff > MAX_TIME_DIFF) {
    wastedTime += timeDiff - MAX_TIME_DIFF;
    // recalculate the difference in time
    timeDiff = totalTime - (prevTime + wastedTime);
  }
  currTime += timeDiff;
  // TODO this needs to change
  //currSimTime += timeDiff * speed();
  //console.log(speed());
  //console.log(timeDiff);
  //const prevSteps = Math.floor(prevSimTime / 1000);
  //const currSteps = Math.floor(currSimTime / 1000);
  //console.log(prevSteps);
  //console.log(currSteps);
  //console.log("prev - curr " + (currSteps - prevSteps));

  while ((steps / FPS) * 1000 < currTime) {
    targetChars += speed() / FPS;
    console.log("target chars " + targetChars);
    while (chars < targetChars) {
      //for (let i = prevSteps; i < currSteps; i++) {
      col = chars % SCREEN_COLUMNS;
      row = Math.floor(chars / SCREEN_COLUMNS);
      drawChar(
        prob(),
        ((chars - offset) % SCREEN_COLUMNS) * CHAR_WIDTH,
        Math.floor((chars - offset) / SCREEN_COLUMNS) * CHAR_HEIGHT
      );
      chars++;
      // scroll the screen up if needed
      if (chars - offset === SCREEN_ROWS * SCREEN_COLUMNS) {
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
    steps++;
    console.log("steps " + steps);
  }
  prevTime = currTime;
  console.log("currTime" + currTime);
  requestAnimationFrame(loop);
};

loop();
