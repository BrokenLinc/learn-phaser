import 'phaser';

import { SCREEN } from './constants';
import { PauseScene } from './scenes/PauseScene';
import { MainScene } from './scenes/MainScene';

// Configure game rendering, load all scenes
const config = {
  type: Phaser.AUTO,
  width: SCREEN.w,
  height: SCREEN.h,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },

  scene: [MainScene, PauseScene],
};

new Phaser.Game(config);
