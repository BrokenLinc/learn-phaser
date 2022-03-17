import { MainScene } from '../scenes/MainScene';

export interface EnemyConfig {
  x: number;
  y: number;
}

export class Enemy {
  scene: MainScene;
  sprite: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

  constructor(scene: MainScene, config: Partial<EnemyConfig> = {}) {
    this.scene = scene;
    const { x = 0, y = 0 } = config;
    this.sprite = this.scene.enemiesGroup?.create(x, y, 'enemy');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setData('object', this);
    this.sprite.setCircle(32); // half sprite size
  }

  restart() {}

  update(dt: number) {
    const { scene, sprite } = this;
    const { player } = scene;
    if (!player) return;

    const baseSpeed = 5; // TODO: move into game state w/mods
    const speed = baseSpeed * 60; //dt

    const direction = Math.atan2(
      player.sprite.y - sprite.y,
      player.sprite.x - sprite.x
    );

    this.sprite?.setVelocityX(speed * Math.cos(direction));
    this.sprite?.setVelocityY(speed * Math.sin(direction));
  }

  destroy() {
    // Remove sprites from scene
    this.sprite?.destroy();
  }
}
