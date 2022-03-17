import { MainScene } from '../scenes/MainScene';

export interface PlayerConfig {
  x: number;
  y: number;
}

export class Player {
  scene: MainScene;
  sprite: Phaser.Physics.Arcade.Sprite;

  constructor(scene: MainScene, config: Partial<PlayerConfig> = {}) {
    this.scene = scene;
    const { x = 0, y = 0 } = config;
    this.sprite = this.scene.physics.add.sprite(x, y, 'player');
    this.sprite.setOrigin(0.5, 0.5);
  }

  restart() {}

  update(dt: number) {
    const { scene, sprite } = this;
    const { cursors } = scene;

    const baseSpeed = 7; // TODO: move into game state w/mods
    let speed = baseSpeed * 60; //dt

    // Negate diagnoal movement boost
    // Note that analog movement would require a vector multiplication approach
    const movingDiagonally =
      (cursors?.up.isDown || cursors?.down.isDown) &&
      (cursors?.right.isDown || cursors?.left.isDown);
    if (movingDiagonally) {
      speed /= 1.41; // sqrt(2)
    }

    sprite.setVelocityX(0);
    sprite.setVelocityY(0);

    // Keyboard input
    if (cursors?.up.isDown) {
      sprite.setVelocityY(-speed);
    }
    if (cursors?.right.isDown) {
      sprite.setVelocityX(speed);
    }
    if (cursors?.down.isDown) {
      sprite.setVelocityY(speed);
    }
    if (cursors?.left.isDown) {
      sprite.setVelocityX(-speed);
    }
  }

  destroy() {
    // Remove sprites from scene
    this.sprite?.destroy();
  }
}
