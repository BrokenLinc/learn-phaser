import 'phaser';
import _ from 'lodash';

import {
  KEY_DOWN,
  SCENE,
  SCREEN,
  SCREEN_BOUNDS_DIST,
  SCREEN_CENTER,
  STATE,
} from '../constants';
import { Enemy } from '../objects/Enemy';
import { Player } from '../objects/Player';
import { Spear } from '../objects/Weapon';
import { Settings } from '../objects/Settings';

let state = STATE.init;

export class MainScene extends Phaser.Scene {
  player?: Player;
  enemies: Enemy[] = [];
  enemiesGroup?: Phaser.Physics.Arcade.Group;
  bulletsGroup?: Phaser.Physics.Arcade.Group;
  settings?: Settings;
  sprites?: Partial<Record<string, Phaser.GameObjects.Image>>;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  timeElapsed: number = 0;

  constructor() {
    super({ key: SCENE.main });
  }

  preload() {
    // this.load.image('bg', './sprites/bg.png');
    this.load.image('player', './sprites/player.png');
    this.load.image('enemy', './sprites/enemy.png');
  }

  create() {
    this.enemiesGroup = this.physics.add.group();
    this.bulletsGroup = this.physics.add.group({});
    this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);
    this.physics.add.overlap(
      this.enemiesGroup,
      this.bulletsGroup,
      (enemySprite, bulletSprite) => {
        const enemy = enemySprite.getData('object') as Enemy;
        const spear = bulletSprite.getData('object') as Spear;

        // escape if already destroyed
        if (!enemy || !spear) {
          return;
        }

        // Simple test... TODO: make it better
        this.bulletsGroup?.remove(bulletSprite);
        spear.destroy();

        // Simple test... TODO: make it better
        _.remove(this.enemies, enemy);
        this.enemiesGroup?.remove(enemySprite);
        enemy.destroy();
      },
      undefined,
      this
    );

    // Add sprites
    this.sprites = {
      // background: this.add.image(0, 0, 'bg'),
    };

    // Add game objects
    this.player = new Player(this, SCREEN_CENTER);
    this.settings = new Settings(this);

    this.cameras.main.setBounds(0, 0, SCREEN.w, 10000);
    this.cameras.main.startFollow(this.player.sprite, false);

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
    if (!this.player) return;

    const angle = Math.random() * Math.PI; // spawn from bottom half
    const distance = SCREEN_BOUNDS_DIST + 40;
    this.enemies.push(
      new Enemy(this, {
        x: this.player.sprite.x + Math.cos(angle) * distance,
        y: this.player.sprite.y + Math.sin(angle) * distance,
      })
    );
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
        if (
          Math.floor((this.timeElapsed + dt) / 1) >
          Math.floor(this.timeElapsed / 1)
        ) {
          this.addEnemy();
        }
        if (
          Math.floor((this.timeElapsed + dt) / 0.2) >
          Math.floor(this.timeElapsed / 0.2)
        ) {
          new Spear(this);
        }
        this.timeElapsed += dt;
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
