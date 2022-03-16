import 'phaser';

import { KEY_DOWN, SCENE } from '../constants';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.pause });
  }
  preload() {}
  create() {
    this.input.keyboard.on(KEY_DOWN.p, () => {
      this.scene.resume(SCENE.main);
      this.scene.stop();
    });
  }
  update(time: number, delta: number) {}
}
