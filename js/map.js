function generateLevel() {
  tryTo("generate map", () => {
    return generateTiles() == randomPassableTile().getConnectedTiles().length;
  });

  generateMonsters();

  for (let i = 0; i < 3; i++) {
    randomPassableTile().treasure = true;
  }
}

function generateTiles() {
  let passableTiles = 0;
  for (let i = 0; i < numTiles; i++) {
    tiles[i] = [];
    for (let j = 0; j < numTiles; j++) {
      if (Math.random() < 0.3 || !inBounds(i, j)) {
        tiles[i][j] = new Wall(i, j);
      } else {
        tiles[i][j] = new Floor(i, j);
        passableTiles++;
      }
    }
  }
  return passableTiles;
}

function inBounds(x, y) {
  return x > 0 && y > 0 && x < numTiles - 1 && y < numTiles - 1;
}

function getTile(x, y) {
  if (inBounds(x, y)) {
    return tiles[x][y];
  }
  return new Wall(x, y);
}

function randomPassableTile() {
  let tile;
  tryTo("get random passable tile", () => {
    const x = randomRange(0, numTiles - 1);
    const y = randomRange(0, numTiles - 1);
    tile = getTile(x, y);
    return tile.passable && !tile.monster;
  });
  return tile;
}

function generateMonsters() {
  monsters = [];
  const numMonsters = level + 1;
  for (let i = 0; i < numMonsters; i++) {
    spawnMonster();
  }
}

function spawnMonster() {
  const monsterType = shuffle([Rat, Demon, Bat, Zombie])[0];
  const monster = new monsterType(randomPassableTile());
  monsters.push(monster);
}
