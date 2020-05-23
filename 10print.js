"use strict";

// no onload event listener needed since script is at bottom of page

const CHAR_WIDTH = 32;
const CHAR_HEIGHT = 32;

const SCREEN_ROWS = 25;
const SCREEN_COLUMNS = 40;

const SQUARE_SIZE = 4;
const SQUARE_DIAGONAL = 4 * 2 ** 0.5;

const SCROLL_NUM = 2;

const MAX_TIME_DIFF = 1000 / 15;

const FPS = 240;

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
  "canvas"
));

const context = canvas.getContext("2d");

// style for lines
context.strokeStyle = "white";
context.lineWidth = SQUARE_DIAGONAL;

// time varying values
let row = 0;
let col = 0;
let chars = 0;
let steps = 0;
let offset = 0;

// for keeping track of time
let currTime = 0;
let prevTime = 0;
let wastedTime = 0;
let targetChars = 0;

context.font = "32px serif";

/** @type {() => number} */
let speed;
/** @type {() => boolean} */
let prob;

/**
 * @typedef {Object} Phase
 * @property {number} start
 * @property {() => number} speedFunc
 * @property {() => boolean} probFunc
 */

/** @type {Phase[]} */
const timeline = [];

const pStart = () => {
  return timeline[timeIndex - 1].start;
};

const pSteps = () => {
  return steps - timeline[timeIndex - 1].start;
};

timeline.push({
  start: 0,
  speedFunc: () => (pSteps() / 16) * (1 + Math.cos(steps / 80)),
  probFunc: () => Math.random() > 0.5,
});

timeline.push({
  start: 3000,
  speedFunc: () => 300,
  probFunc: () => Math.cos(steps) > 0,
});

timeline.push({
  start: 5000,
  speedFunc: () => 400,
  probFunc: () => Math.cos(steps + row * col) > 0,
});

timeline.push({
  start: 10000,
  speedFunc: () => 500,
  probFunc: () => Math.tan(steps) > 0,
});

timeline.push({
  start: 10000,
  speedFunc: () => 500,
  probFunc: () => Math.tan(steps + row * col) > 0,
});

timeline.push({
  start: 15000,
  speedFunc: () => 3000,
  probFunc: () => Math.cos((row * col) / 400) > 0,
});

timeline.push({
  start: 17000,
  speedFunc: () => (Math.cos(steps / 80) + 1) * 700,
  probFunc: () => ((chars / 2000) * (row + col)) % 20 < 10,
});

timeline.sort((p1, p2) => p1.start - p2.start);
console.log(timeline);

let timeIndex = 0;

const speedSpan = document.getElementById("speed");
const sideSpan = document.getElementById("side");
const rowSpan = document.getElementById("row");
const colSpan = document.getElementById("col");
const stepSpan = document.getElementById("step");
const charSpan = document.getElementById("char");

/**
 * @param {boolean} side
 * @param {number} x
 * @param {number} y
 */
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

  while ((steps / FPS) * 1000 < currTime) {
    if (timeIndex < timeline.length && steps >= timeline[timeIndex].start) {
      speed = timeline[timeIndex].speedFunc;
      prob = timeline[timeIndex].probFunc;
      speedSpan.innerText = "speed: " + speed;
      sideSpan.innerText = "prob: " + prob;
      timeIndex++;
    }
    targetChars += speed() / FPS;
    while (chars < targetChars) {
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
  }
  prevTime = currTime;

  // update ui
  charSpan.innerText = "char: " + chars;
  rowSpan.innerText = "row: " + row;
  colSpan.innerText = "col: " + col;
  stepSpan.innerText = "step: " + steps;

  requestAnimationFrame(loop);
};

loop();
