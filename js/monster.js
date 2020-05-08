/* eslint-disable max-classes-per-file */
class Monster {
  constructor(tile, sprite, hp) {
    this.move(tile);
    this.sprite = sprite;
    this.hp = hp;
    this.teleportCounter = 2;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lastMove = [-1, 0];
    this.bonusAttack = 0;
  }

  update() {
    this.teleportCounter--;
    if (this.stunned || this.teleportCounter > 0) {
      this.stunned = false;
      return;
    }
    this.doStuff();
  }

  heal(x) {
    this.hp = Math.min(maxHp, this.hp + x);
  }

  doStuff() {
    const neighbors = this.tile
      .getAdjacentPassableNeighbors()
      .filter((t) => !t.monster || t.monster.isPlayer);

    if (neighbors.length) {
      neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
      const newTile = neighbors[0];
      this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
    }
  }

  tryMove(dx, dy) {
    const newTile = this.tile.getNeighbor(dx, dy);
    if (newTile.passable) {
      this.lastMove = [dx, dy];
      if (!newTile.monster) {
        this.move(newTile);
      } else if (this.isPlayer != newTile.monster.isPlayer) {
        this.attackedThisTurn = true;
        newTile.monster.stunned = true;
        newTile.monster.hit(1 + this.bonusAttack);
        this.bonusAttack = 0;

        shakeAmount = 5;

        this.offsetX = (newTile.x - this.tile.x) / 2;
        this.offsetY = (newTile.y - this.tile.y) / 2;
      }
      return true;
    }
  }

  hit(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.die();
    }
    if (this.isPlayer) {
      playSound("hit2");
    } else {
      playSound("hit1");
    }
  }

  die() {
    this.dead = true;
    this.tile.monster = null;
    this.sprite = 1;
  }

  getDisplayX() {
    return this.tile.x + this.offsetX;
  }

  getDisplayY() {
    return this.tile.y + this.offsetY;
  }

  move(tile) {
    if (this.tile) {
      this.tile.monster = null;
      this.offsetX = this.tile.x - tile.x;
      this.offsetY = this.tile.y - tile.y;
    }
    this.tile = tile;
    tile.monster = this;
    tile.stepOn(this);
  }

  draw() {
    if (this.teleportCounter > 0) {
      drawSprite(9, this.getDisplayX(), this.getDisplayY());
    } else {
      drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
      this.drawHp();
    }

    this.offsetX -= Math.sign(this.offsetX) * (1 / 8);
    this.offsetY -= Math.sign(this.offsetY) * (1 / 8);
  }

  drawHp() {
    for (let i = 0; i < this.hp; i++) {
      drawSprite(
        8,
        this.getDisplayX() + (i % 3) * (9 / 32) + 4 / 32,
        this.getDisplayY() - Math.floor(i / 3)
      );
    }
  }
}

class Player extends Monster {
  constructor(tile) {
    super(tile, 0, 3);
    this.isPlayer = true;
    this.teleportCounter = 0;
    this.spells = shuffle(Object.keys(spells)).splice(0, numSpells);
  }

  tryMove(dx, dy) {
    if (super.tryMove(dx, dy)) {
      tick();
    }
  }

  addSpell() {
    const newSpell = shuffle(Object.keys(spells))[0];
    this.spells.push(newSpell);
  }

  castSpell(index) {
    console.log(index);
    const spellName = this.spells[index];
    if (spellName) {
      delete this.spells[index];
      spells[spellName]();
      playSound("spell");
      tick();
    }
  }
}

class Rat extends Monster {
  constructor(tile) {
    super(tile, 4, 1);
  }

  doStuff() {
    const neighbors = this.tile
      .getAdjacentNeighbors()
      .filter((t) => !t.passable && inBounds(t.x, t.y));

    if (neighbors.length) {
      neighbors[0].replace(Floor);
      this.heal(0.5);
    } else {
      super.doStuff();
    }
  }
}

class Demon extends Monster {
  constructor(tile) {
    super(tile, 5, 2);
  }

  doStuff() {
    const neighbors = this.tile.getAdjacentPassableNeighbors();
    if (neighbors.length) {
      this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
    }
  }
}

class Bat extends Monster {
  constructor(tile) {
    super(tile, 6, 1);
  }

  doStuff() {
    this.attackedThisTurn = false;
    super.doStuff();
    if (!this.attackedThisTurn) {
      super.doStuff();
    }
  }
}

class Zombie extends Monster {
  constructor(tile) {
    super(tile, 7, 2);
  }

  update() {
    const startedStunned = this.stunned;
    super.update();
    if (!startedStunned) {
      this.stunned = true;
    }
  }
}
