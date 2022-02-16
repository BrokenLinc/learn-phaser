import 'phaser';

import './index.css';

import {
  KEYDOWN,
  SCENE,
  SCREEN,
  SCREEN_CENTER,
  SPRITE_KEY,
  STATE,
} from './constants';
import { Camera } from './camera';
import { Circuit } from './circuit';
import { Settings } from './settings';
import { Player } from './player';

let state: STATE = STATE.INIT;
export class MainScene extends Phaser.Scene {
  camera?: Camera;
  player?: Player;
  circuit?: Circuit;
  settings?: Settings;
  sprites?: Record<SPRITE_KEY, Phaser.GameObjects.Image>;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: SCENE.MAIN });
  }

  preload() {
    this.load.image(SPRITE_KEY.background, './assets/img_back.png');
    this.load.image(SPRITE_KEY.playerCar, './assets/img_player.png');
  }

  create() {
    this.sprites = {
      background: this.add.image(
        SCREEN_CENTER.X,
        SCREEN_CENTER.Y,
        SPRITE_KEY.background
      ),
      playerCar: this.add.image(0, 0, SPRITE_KEY.playerCar).setVisible(false),
    };

    this.circuit = new Circuit(this);
    this.player = new Player(this);
    this.camera = new Camera(this);
    this.settings = new Settings(this);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on(KEYDOWN.P, () => {
      if (this.settings) this.settings.txtPause.text = '[P] Resume';
      this.scene.pause();
      this.scene.launch(SCENE.PAUSE);
    });
    this.events.on('resume', () => {
      this.settings?.show();
    });
  }

  update(time: number, delta: number) {
    // console.log(state);
    switch (state) {
      case STATE.INIT:
        this.camera?.init();
        this.player?.init();

        state = STATE.RESTART;
        break;
      case STATE.RESTART:
        this.circuit?.create();
        this.player?.restart();

        state = STATE.PLAY;
        break;
      case STATE.PLAY:
        const dt = Math.min(1, delta / 1000); // ms to sec

        this.player?.update(dt);
        this.camera?.update();
        this.circuit?.render3D();
        break;
      case STATE.GAMEOVER:
        break;
    }
  }
}
class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.PAUSE });
  }
  preload() {}
  create() {
    this.input.keyboard.on(KEYDOWN.P, () => {
      this.scene.resume(SCENE.MAIN);
      this.scene.stop();
    });
  }
  update(time: number, delta: number) {}
}

const config = {
  type: Phaser.AUTO,
  width: SCREEN.W,
  height: SCREEN.H,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [MainScene, PauseScene],
};

new Phaser.Game(config);
