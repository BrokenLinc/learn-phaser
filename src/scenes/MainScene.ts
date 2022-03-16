import 'phaser';

import { KEY_DOWN, SCENE, SCREEN_CENTER, STATE } from '../constants';
import { Enemy } from '../objects/Enemy';
import { Player } from '../objects/Player';
import { Settings } from '../objects/Settings';

let state = STATE.init;

export class MainScene extends Phaser.Scene {
  player?: Player;
  enemies: Enemy[];
  enemiesGroup?: Phaser.Physics.Arcade.Group;
  settings?: Settings;
  sprites?: Partial<Record<string, Phaser.GameObjects.Image>>;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: SCENE.main });

    this.enemies = [];
  }

  preload() {
    // this.load.image('bg', './sprites/bg.png');
    this.load.image('player', './sprites/player.png');
    this.load.image('enemy', './sprites/enemy.png');
  }

  create() {
    this.enemiesGroup = this.physics.add.group();
    this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);

    // Add sprites
    this.sprites = {
      // background: this.add.image(0, 0, 'bg'),
    };

    // Add game objects
    // this.enemies.push(new Enemy(this));
    this.player = new Player(this, SCREEN_CENTER);
    this.settings = new Settings(this);
    this.addEnemy();

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

  addEnemy() {
    this.enemies.push(new Enemy(this, { x: 50, y: 150 }));
    this.enemies.push(new Enemy(this, { x: 50, y: 50 }));
    this.enemies.push(new Enemy(this, { x: 150, y: 50 }));
    this.enemies.push(new Enemy(this, { x: 500, y: 200 }));
  }

  update(time: number, delta: number) {
    switch (state) {
      case STATE.init:
        state = STATE.restart;
        break;
      case STATE.restart:
        // Recreate or restart game objects
        this.player?.restart();
        // TODO: destroy all enemies

        state = STATE.play;
        break;
      case STATE.play:
        const dt = Math.min(1, delta / 1000); // ms to sec
        // Update game objects (passing dt)
        this.player?.update(dt);
        this.enemies.forEach((enemy) => enemy.update(dt));
        // this.enemies?.children.each((enemy) => enemy.update(dt));

        break;
      case STATE.gameOver:
        break;
    }
  }
}
