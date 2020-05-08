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
};
