let labels = [];
let spinnerAngle = 0;
let targetIndex = -1;
let targetAngle = 0;
let queuedMouseClicks;
let angles;
let struck;
let spinning = false;
let labelTextSize;

function setup() {
  const header = document.getElementById('instructions');
  createCanvas(windowWidth, windowHeight - header.offsetTop - header.offsetHeight);
  // the following supports hot reload during development
  document.body.className = '';

  const textArea = document.getElementById('input-lines');
  const testData = Array(5).fill().map((_, i) => `Team #${i + 1}`);
  createButton('Shuffle')
    .class('unless-canvas')
    .position(textArea.offsetLeft, textArea.offsetTop + textArea.offsetHeight + 10)
    .mousePressed(() => startShuffle(
      textArea.value.trim()
        ? textArea.value.split('\n')
        : testData));

  if (document.location.hash === '#test') {
    startShuffle(testData);
  }
}

function draw() {
  clear();
  color('white');
  textSize(40);
  translate(width / 2, height / 2);

  const radius = 0.9 * min(width, height) / 2 - max(labels.map(s => textWidth(s)));

  if (abs(spinnerAngle - targetAngle) < 0.01) {
    spinning = false;
    noLoop();
    if (queuedMouseClicks > 0) {
      queuedMouseClicks--;
      nextSpin();
    }
  }

  fill(200);
  circle(0, 0, width);
  fill('white');
  const lineHeight = textAscent() + textDescent();
  rect(radius, -lineHeight / 2, width, lineHeight);

  rotate(-spinnerAngle);

  push();
  rotate(spinnerAngle + HALF_PI);
  spinnerAngle += min(PI / 10, 0.1 * (targetAngle - spinnerAngle));
  fill('red');
  triangle(-20, 0, 0, -radius + 5, 20, 0);
  pop();

  fill('gray')
  labels.forEach((label, i) => {
    const angle = angles[i];
    const x = radius * cos(angle), y = radius * sin(angle);
    const x0 = cos(angle + -spinnerAngle);

    push();
    textAlign(x0 < 0 ? RIGHT : LEFT, CENTER);
    translate(x, y);
    rotate(angle);

    push();
    if (x0 < 0) rotate(PI);
    if (!spinning && targetIndex == i) fill('blue')
    text(label, 0, 0);
    pop();

    if (struck[i]) {
      strokeWeight(4);
      line(0, 0, textWidth(label), 0);
    }
    pop();
  });
}

function startShuffle(lines) {
  document.body.className = 'canvas selecting';
  labels = lines.map(s => s.trim()).filter(s => s);
  angles = labels.map((_, i) => TWO_PI * i / labels.length);
  shuffle(angles, true);
  struck = new Array(labels.length).fill(false);
  targetIndex = -1;
  spinning = false;
  queuedMouseClicks = 0;
  noLoop();
}

function mousePressed() {
  if (labels.length === 0) return;
  if (spinning) {
    queuedMouseClicks++;
  } else {
    nextSpin();
  }
}

function nextSpin() {
  if (targetIndex >= 0) struck[targetIndex] = true;
  let remaining = struck.map((x, i) => x ? null : i).filter(i => i !== null);
  switch (remaining.length) {
    case 0:
      document.body.className = '';
      return;
    case 1:
      document.body.className = 'canvas done';
      break;
  }
  targetIndex = random(remaining);
  spinnerAngle %= TWO_PI;
  targetAngle = angles[targetIndex] + floor(random(1, 5)) * TWO_PI;
  spinning = true;
  loop();
}
