let labels = [];
let selectedLabels = [];
let spinnerAngle = 0;
let targetIndex = -1;
let targetAngle = 0;
let queuedMouseClicks;
let angles;
let struck;
let spinning = false;
let labelTextSize;

function setup() {
  createCanvas(windowWidth, windowHeight);
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

    // it has come to a halt
    if (abs(spinnerAngle - targetAngle) < 0.01) {
      spinning = false;
      targetIndex >= 0 && selectedLabels.push(labels[targetIndex])
      noLoop();
      executePendingMouseClicks();
    }


  {
    push();
    textSize(20);
    const h = textAscent() + textDescent();
    fill('gray');
    selectedLabels.forEach(label => {
      text(label, 10, height - h);
      translate(0, -h);
    })
    pop();
  }


  translate(width / 2, height / 2);

  textSize(labelTextSize);
  const radius = 0.9 * min(width, height) / 2 - max(labels.map(s => textWidth(s)));

  const discSize = min(width, height) - 10;
  fill(200);
  circle(0, 0, discSize);

  push();
  rotate(-spinnerAngle);
  colorMode(HSB);
  const index2angle = i => map(i, 0, 50, 0, TWO_PI);
  for (let i = 0; i < 50; i++) {
    const hue = (i / 3) % 3 * 100
    strokeWeight(2);
    fill(hue, 100, 100, 20);
    stroke(hue, 100, 75, 50);
    arc(0, 0, discSize, discSize, index2angle(i), index2angle(i + 1), PIE)
  }
  pop();
  fill("#E5BB4A");
  circle(0, 0, 1.7 * radius);

  if (targetIndex >= 0) {
    fill('white');
    const lineHeight = textAscent() + textDescent();
    rect(radius - 10, -lineHeight / 2, discSize / 2 - radius, lineHeight);
  }

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
    if (!spinning && targetIndex == i) {
      fill('black');
      // textStyle(BOLD);
    }
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
  labels = lines.map(s => s.trim()).filter(s => s);
  angles = labels.map((_, i) => TWO_PI * i / labels.length);
  shuffle(angles, true);
  struck = new Array(labels.length).fill(false);
  targetIndex = -1;
  selectedLabels = [];
  spinning = false;
  queuedMouseClicks = 0;

  const maxRadius = min(width, height) / 2;
  labelTextSize = 200;
  while (textSize(labelTextSize), 100 + max(labels.map(textWidth)) > maxRadius) labelTextSize *= 0.95;

  document.body.className = 'canvas selecting';
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

function executePendingMouseClicks() {
  if (queuedMouseClicks > 0) {
    queuedMouseClicks--;
    nextSpin();
  }
}

function nextSpin() {
  if (targetIndex >= 0) struck[targetIndex] = true;
  let remaining = struck.map((f, i) => f ? null : i).filter(i => i !== null);
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
