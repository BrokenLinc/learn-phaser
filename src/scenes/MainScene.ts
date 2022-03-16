import 'phaser';

import { KEY_DOWN, SCENE, STATE } from '../constants';
import { Player } from '../objects/Player';
import { Settings } from '../objects/Settings';

let state = STATE.init;

export class MainScene extends Phaser.Scene {
  player?: Player;
  settings?: Settings;
  sprites?: Partial<Record<string, Phaser.GameObjects.Image>>;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: SCENE.main });
  }

  preload() {
    // this.load.image('bg', './sprites/bg.png');
    this.load.image('player', './sprites/player.png');
  }

  create() {
    // Add sprites
    this.sprites = {
      // background: this.add.image(0, 0, 'bg'),
    };

    // Add game objects
    this.player = new Player(this);
    this.settings = new Settings(this);

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on(KEY_DOWN.p, () => {
      const { scene, settings } = this;

      if (settings) settings.txtPause.text = '[P] Resume';
      scene.pause();
      scene.launch(SCENE.pause);
    });

    // Event callbacks
    this.events.on('resume', () => {
      this.settings?.show();
    });
  }

  update(time: number, delta: number) {
    switch (state) {
      case STATE.init:
        // Init game objects
        this.player?.init();

        state = STATE.restart;
        break;
      case STATE.restart:
        // Recreate or restart game objects
        this.player?.restart();

        state = STATE.play;
        break;
      case STATE.play:
        const dt = Math.min(1, delta / 1000); // ms to sec
        // Update game objects (passing dt)
        this.player?.update(dt);

        // Render game objects
        this.player?.render();

        break;
      case STATE.gameOver:
        break;
    }
  }
}
