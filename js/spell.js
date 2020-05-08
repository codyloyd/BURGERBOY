spells = {
  WOOP() {
    player.move(randomPassableTile());
  },
  QUAKE() {
    for (let i = 0; i < numTiles; i++) {
      for (let j = 0; j < numTiles; j++) {
        const tile = getTile(i, j);
        if (tile.monster) {
          const numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
          tile.monster.hit(numWalls * 2);
        }
      }
    }
    shakeAmount = 20;
  },
  MAELSTROM() {
    for (let i = 0; i < monsters.length; i++) {
      monsters[i].move(randomPassableTile());
      monsters[i].teleportCounter = 2;
    }
  },
  AURA() {
    player.tile.getAdjacentNeighbors().forEach(function (t) {
      t.setEffect(12);
      if (t.monster) {
        t.monster.heal(1);
      }
    });
    player.tile.setEffect(12);
    player.heal(1);
  },
  DASH() {
    let newTile = player.tile;
    while (true) {
      const testTile = newTile.getNeighbor(
        player.lastMove[0],
        player.lastMove[1]
      );
      if (testTile.passable && !testTile.monster) {
        newTile = testTile;
      } else {
        break;
      }
    }
    if (player.tile != newTile) {
      player.move(newTile);
      newTile.getAdjacentNeighbors().forEach((t) => {
        if (t.monster) {
          t.setEffect(14);
          t.monster.stunned = true;
          t.monster.hit(1);
        }
      });
    }
  },
  DIG() {
    for (let i = 1; i < numTiles - 1; i++) {
      for (let j = 1; j < numTiles - 1; j++) {
        const tile = getTile(i, j);
        if (!tile.passable) {
          tile.replace(Floor);
        }
      }
    }
    player.tile.setEffect(12);
    player.heal(2);
  },
  ALCHEMY() {
    player.tile.getAdjacentNeighbors().forEach(function (t) {
      if (!t.passable && inBounds(t.x, t.y)) {
        t.replace(Floor).treasure = true;
      }
    });
  },
  POWER() {
    player.bonusAttack = 5;
  },
  BOLT() {
    boltTravel(player.lastMove, 14 + Math.abs(player.lastMove[1]), 4);
  },
  CROSS() {
    const directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];
    for (let k = 0; k < directions.length; k++) {
      boltTravel(directions[k], 14 + Math.abs(directions[k][1]), 2);
    }
  },
};

function boltTravel(direction, effect, damage) {
  let newTile = player.tile;
  while (true) {
    const testTile = newTile.getNeighbor(direction[0], direction[1]);
    if (testTile.passable) {
      newTile = testTile;
      if (newTile.monster) {
        newTile.monster.hit(damage);
      }
      newTile.setEffect(effect);
    } else {
      break;
    }
  }
}
