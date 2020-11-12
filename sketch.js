const defaultLines = 'team 1\nteam 2\nteam 3\nteam 4\nteam 5\nteam 6\nteam 7';

let labels = [];
let spinnerAngle = 0;
let targetIndex = -1;
let targetAngle = 0;
let angles;
let struck = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  // this next line is necessary for hot reload during development
  document.body.className = document.body.className.replace(/\bshuffled\b/, '');

  let textArea = document.getElementById('input-lines');
  createButton('Shuffle')
    .position(textArea.offsetLeft, textArea.offsetTop + textArea.offsetHeight + 10)
    .mousePressed(() => startShuffle((textArea.value.trim() || defaultLines).split('\n')));
  noLoop();

  // startShuffle(defaultLines.split(/\n/));
}

let stopped = true;

function draw() {
  clear();
  color('white');
  textSize(40);
  translate(width / 2, height / 2);

  let radius = 0.9 * min(width, height) / 2 - max(labels.map(s => textWidth(s)));

  if (abs(spinnerAngle - targetAngle) < 0.01) {
    stopped = true;
    noLoop();
  }

  push();
  rotate(spinnerAngle + HALF_PI);
  spinnerAngle = lerp(spinnerAngle, targetAngle, 0.1);
  fill('red');
  triangle(-20, 0, 0, -radius + 5, 20, 0);
  pop();

  fill('gray')
  labels.forEach((label, i) => {
    let angle = angles[i];
    let x = radius * cos(angle), y = radius * sin(angle)

    push();
    textAlign(x < 0 ? RIGHT : LEFT, CENTER);
    translate(x, y);
    rotate(angle);

    push();
    if (x < 0) rotate(PI);
    if (stopped && targetIndex == i) fill('blue')
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
  document.body.className += ' shuffling';
  labels = lines.map(s => s.trim()).filter(s => s);
  angles = labels.map((_, i) => TWO_PI * i / labels.length);
  angles = shuffle(angles);
  stopped = true;
}

function mousePressed() {
  if (!stopped) return;
  if (labels.length === 0) return;
  struck[targetIndex] = true;
  let remaining;
  do {
    remaining = labels.map((_, i) => struck[i] ? null : i).filter(i => i !== null);
    if (remaining.length === 0) struck = [];
  } while (remaining.length === 0);
  targetIndex = random(remaining);
  targetAngle = angles[targetIndex] + (floor(random(1, 5) + floor(spinnerAngle / TWO_PI)) * TWO_PI);
  stopped = false;
  loop();
}
