import { MainScene } from '../scenes/MainScene';

export interface WeaponConfig {}

export class Weapon {
  scene: MainScene;

  constructor(scene: MainScene, config: Partial<WeaponConfig> = {}) {
    this.scene = scene;
  }

  restart() {}

  update(dt: number) {
    const { scene } = this;
    const { player } = scene;
    if (!player) return;
  }

  destroy() {
    // Remove sprites from scene
  }
}

// TODO: refactor and use for enemy movement
const getAngle = (
  obj1: { x: number; y: number },
  obj2: { x: number; y: number }
) => {
  // angle in radians
  var angleRadians = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
  // angle in degrees
  // var angleDeg = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180) / Math.PI;
  return angleRadians;
};

export interface SpearConfig {
  x: number;
  y: number;
}

export class Spear {
  scene: MainScene;
  sprite: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

  constructor(scene: MainScene, config: Partial<SpearConfig> = {}) {
    this.scene = scene;
    const {
      x = this.scene.player?.sprite.x || 0,
      y = this.scene.player?.sprite.y || 0,
    } = config;
    this.sprite = this.scene.bulletsGroup?.create(x, y, 'player');
    this.sprite.setDisplaySize(16, 16);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setData('object', this);
    this.sprite.setCircle(16);

    const target = this.scene.physics.closest(
      this.sprite,
      this.scene.enemiesGroup?.getChildren()
    ) as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    if (!target) return; // TODO: fire randomly

    const angle = getAngle(this.sprite, target);

    this.sprite.setVelocity(5 * 60 * Math.cos(angle), 5 * 60 * Math.sin(angle));
  }

  restart() {}

  update(dt: number) {
    const { scene } = this;
    const { player } = scene;
    if (!player) return;
  }

  destroy() {
    // Remove sprites from scene
    this.sprite?.destroy();
  }
}
