let labels = [];
let spinnerAngle = 0;
let targetIndex = -1;
let targetAngle = 0;
let angles;
let struck;
let spinning = false;

function setup() {
  let header = document.getElementById('instructions');
  createCanvas(windowWidth, windowHeight - header.offsetTop - header.offsetHeight);
  // the following supports hot reload during development
  document.body.className = '';

  let textArea = document.getElementById('input-lines');
  createButton('Shuffle')
    .class('unless-canvas')
    .position(textArea.offsetLeft, textArea.offsetTop + textArea.offsetHeight + 10)
    .mousePressed(() => startShuffle(
      textArea.value.trim()
        ? textArea.split('\n')
        : Array(5).fill().map((_, i) => `Team #${i + 1}`)));
  noLoop();
}

function draw() {
  clear();
  color('white');
  textSize(40);
  translate(width / 2, height / 2);

  let radius = 0.9 * min(width, height) / 2 - max(labels.map(s => textWidth(s)));

  if (abs(spinnerAngle - targetAngle) < 0.01) {
    spinning = false;
    noLoop();
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
    let angle = angles[i];
    let x = radius * cos(angle), y = radius * sin(angle);
    let x0 = cos(angle + -spinnerAngle);

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
  struck = labels.map(() => false);
  angles = labels.map((_, i) => TWO_PI * i / labels.length);
  shuffle(angles, true);
  targetIndex = -1;
  spinning = false;
}

function mousePressed() {
  if (spinning) return;
  if (labels.length === 0) return;
  if (targetIndex >= 0) struck[targetIndex] = true;
  let remaining = struck.map((x, i) => x ? null : i).filter(i => i !== null);
  if (remaining.length === 1) document.body.className = 'canvas done';
  if (remaining.length === 0) { document.body.className = ''; return; }
  targetIndex = random(remaining);
  spinnerAngle %= TWO_PI;
  targetAngle = angles[targetIndex] + floor(random(1, 5)) * TWO_PI;
  spinning = true;
  loop();
}
