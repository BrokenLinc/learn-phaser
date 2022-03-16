import _ from 'lodash';

import { SCREEN_CENTER } from '../constants';
import { MainScene } from '../scenes/MainScene';

export interface PlayerInterface {
  x: number;
  y: number;
}

export class Player implements PlayerInterface {
  scene: MainScene;
  x: number;
  y: number;
  sprite?: Phaser.GameObjects.Image;

  constructor(scene: MainScene, initialValues?: Partial<PlayerInterface>) {
    this.scene = scene;
    this.x = SCREEN_CENTER.x;
    this.y = SCREEN_CENTER.y;
    _.assign(this, initialValues);
  }

  init() {
    // Add sprites to scene
    this.sprite = this.scene.add.image(0, 0, 'player');
    this.sprite.setOrigin(0.5, 0.5);
  }

  restart() {}

  update(dt: number) {
    const { cursors } = this.scene;

    let speed = 10; // TODO: move into game state w/mods

    // Negate diagnoal movement boost
    // Note that analog movement would require a vector multiplication approach
    const movingDiagonally =
      (cursors?.up.isDown || cursors?.down.isDown) &&
      (cursors?.right.isDown || cursors?.left.isDown);
    if (movingDiagonally) {
      speed /= 1.41; // sqrt(2)
    }

    // Keyboard input
    if (cursors?.up.isDown) {
      this.y -= speed;
    }
    if (cursors?.right.isDown) {
      this.x += speed;
    }
    if (cursors?.down.isDown) {
      this.y += speed;
    }
    if (cursors?.left.isDown) {
      this.x -= speed;
    }
  }

  render() {
    this.sprite?.setPosition(this.x, this.y);
  }

  destroy() {
    // Remove sprites from scene
    this.sprite?.destroy();
  }
}
