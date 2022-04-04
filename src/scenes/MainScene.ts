import 'phaser';
import _ from 'lodash';

import {
  DISTANCE,
  KEY_DOWN,
  SCENE,
  SCREEN,
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
  background?: Phaser.GameObjects.TileSprite;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  timeElapsed: number = 0;

  constructor() {
    super({ key: SCENE.main });
  }

  preload() {
    this.load.image('bg', './sprites/bg.png');
    this.load.image('bg-tile', './sprites/bg-tile.png');
    this.load.image('player', './sprites/player.png');
    this.load.image('enemy', './sprites/enemy.png');
    this.load.image('orc', './sprites/orc.png');
    this.load.image('golem-2', './sprites/golem-2.png');
  }

  create() {
    this.enemiesGroup = this.physics.add.group();
    this.bulletsGroup = this.physics.add.group({});
    this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);
    this.physics.add.overlap(
      this.enemiesGroup,
      this.bulletsGroup,
      this.handleBulletEnemyCollide,
      undefined,
      this
    );

    // TODO: refactor into BackgroundLayer object
    this.background = this.add.tileSprite(0, 0, SCREEN.w, SCREEN.h, 'bg-tile');
    this.background.setOrigin(0, 0);
    this.background.setScrollFactor(0, 0);

    // Add game objects
    this.player = new Player(this, SCREEN_CENTER);
    // this.physics.add.collider(this.enemiesGroup, this.player?.sprite);
    this.settings = new Settings(this);

    // Camera follow
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

  handleBulletEnemyCollide(
    enemySprite: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    bulletSprite: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
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
  }

  addEnemy() {
    const { player, enemies } = this;
    if (!player) return;

    const angle = Math.random() * Math.PI * 2; // remove [*2] to spawn from bottom half
    const distance = DISTANCE.spawn;
    enemies.push(
      new Enemy(this, {
        x: player.sprite.x + Math.cos(angle) * distance,
        y: player.sprite.y + Math.sin(angle) * distance,
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
          Math.floor((this.timeElapsed + dt) / 0.4) >
          Math.floor(this.timeElapsed / 0.4)
        ) {
          this.addEnemy();
        }
        if (
          Math.floor((this.timeElapsed + dt) / 0.5) >
          Math.floor(this.timeElapsed / 0.5)
        ) {
          new Spear(this);
        }
        this.timeElapsed += dt;
        // Update game objects (passing dt)
        this.player?.update(dt);
        this.background?.setTilePosition(
          this.player?.sprite.x,
          this.player?.sprite.y
        );
        this.enemies.forEach((enemy) => enemy.update(dt));
        this.bulletsGroup?.children.each((bulletSprite) => {
          const bullet = bulletSprite.getData('object') as Spear;
          bullet.update(dt);
        });

        break;
      case STATE.gameOver:
        break;
    }
  }
}
