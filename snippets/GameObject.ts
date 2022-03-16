import _ from 'lodash';

import { MainScene } from '../src/MainScene';

export interface GameObjectInterface {
  //
}

export class GameObject {
  scene: MainScene;

  constructor(scene: MainScene, initialValues: Partial<GameObjectInterface>) {
    this.scene = scene;
    _.assign(this, initialValues);
  }

  init() {
    // Add sprites to scene
  }

  restart() {}

  update(dt: number) {
    const { cursors } = this.scene;
    if (!cursors) return;

    // Keyboard input
    if (cursors.right.isDown) {
      //
    }
  }

  render() {}

  destroy() {
    // Remove sprites from scene
  }
}
