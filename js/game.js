function setupCanvas({ tileSize = 64, numTiles = 9, uiWidth = 4 }) {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = tileSize * (numTiles + uiWidth);
  canvas.height = tileSize * numTiles;
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
  ctx.imageSmoothingEnabled = false;

  return { ctx, canvas };
}

function draw() {
  if (gameState == "running" || gameState == "dead") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    screenshake();

    for (let i = 0; i < numTiles; i++) {
      for (let j = 0; j < numTiles; j++) {
        getTile(i, j).draw();
      }
    }

    monsters.forEach((m) => m.draw());

    player.draw();

    drawText(`Level: ${level}`, 30, false, 40, "violet");
    drawText(`Score: ${score}`, 30, false, 70, "violet");

    for (let i = 0; i < player.spells.length; i++) {
      const spellText = `${i + 1}) ${player.spells[i] || ""}`;
      drawText(spellText, 20, false, 110 + i * 40, "aqua");
    }
  }
}

function tick() {
  for (let k = monsters.length - 1; k >= 0; k--) {
    if (!monsters[k].dead) {
      monsters[k].update();
    } else {
      monsters.splice(k, 1);
    }
  }
  if (player.dead) {
    addScore(score, false);
    gameState = "dead";
  }
  spawnCounter--;
  if (spawnCounter <= 0) {
    spawnMonster();
    spawnCounter = spawnRate;
    spawnRate--;
  }
}

function screenshake() {
  if (shakeAmount) {
    shakeAmount--;
  }
  const shakeAngle = Math.random() * Math.PI * 2;
  shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
  shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
}

function drawText(text, size, centered, textY, color) {
  ctx.fillStyle = color;
  ctx.font = `${size}px monospace`;
  let textX;
  if (centered) {
    textX = (canvas.width - ctx.measureText(text).width) / 2;
  } else {
    textX = canvas.width - uiWidth * tileSize + 25;
  }

  ctx.fillText(text, textX, textY);
}

function rightPad(textArray) {
  let finalText = "";
  textArray.forEach((text) => {
    text += "";
    for (let i = text.length; i < 10; i++) {
      text += " ";
    }
    finalText += text;
  });
  return finalText;
}

function drawScores() {
  const scores = getScores();
  if (scores.length) {
    drawText(
      rightPad(["RUN", "SCORE", "TOTAL"]),
      18,
      true,
      canvas.height / 2,
      "white"
    );

    const newestScore = scores.pop();
    scores.sort(function (a, b) {
      return b.totalScore - a.totalScore;
    });
    scores.unshift(newestScore);

    for (let i = 0; i < Math.min(10, scores.length); i++) {
      const scoreText = rightPad([
        scores[i].run,
        scores[i].score,
        scores[i].totalScore,
      ]);
      drawText(
        scoreText,
        18,
        true,
        canvas.height / 2 + 24 + i * 24,
        i == 0 ? "aqua" : "violet"
      );
    }
  }
}

function showTitle() {
  ctx.fillStyle = `rgba(30,40,55,.75)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    title,
    canvas.width / 4,
    0,
    canvas.width / 2.4,
    canvas.height / 2.4
  );
  gameState = "title";

  drawScores();
}

function startGame() {
  level = 1;
  score = 0;
  numSpells = 1;

  startLevel(startingHp);

  gameState = "running";
}

function startLevel(playerHp) {
  spawnRate = 15;
  spawnCounter = spawnRate;

  generateLevel();

  player = new Player(randomPassableTile());
  player.hp = playerHp;

  randomPassableTile().replace(Exit);
}

function getScores() {
  if (localStorage.scores) {
    return JSON.parse(localStorage.scores);
  }
  return [];
}

function addScore(score, won) {
  const scores = getScores();
  const scoreObject = { score, run: 1, totalScore: score, active: won };
  const lastScore = scores.pop();

  if (lastScore) {
    if (lastScore.active) {
      scoreObject.run = lastScore.run + 1;
      scoreObject.totalScore += lastScore.totalScore;
    } else {
      scores.push(lastScore);
    }
  }
  scores.push(scoreObject);

  localStorage.scores = JSON.stringify(scores);
}

function initSounds() {
  sounds = {
    hit1: new Audio("sounds/hit1.wav"),
    hit2: new Audio("sounds/hit2.wav"),
    treasure: new Audio("sounds/treasure.wav"),
    newLevel: new Audio("sounds/newLevel.wav"),
    spell: new Audio("sounds/spell.wav"),
  };
}

function playSound(soundName) {
  sounds[soundName].currentTime = 0;
  sounds[soundName].play();
}
