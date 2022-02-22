import { MainScene } from './index';

export class Camera {
  scene: MainScene;
  x: number;
  y: number;
  z: number;
  distToPlane: number;
  distToPlayer: number;

  constructor(scene: MainScene) {
    this.scene = scene;

    this.x = 0;
    this.y = 1000;
    this.z = 0;

    this.distToPlayer = 500;

    this.distToPlane = 0;
  }

  init() {
    this.distToPlane = 0.8 / (this.y / this.distToPlayer);
  }

  update() {
    // follow player

    const player = this.scene.player;
    const circuit = this.scene.circuit;
    if (!player || !circuit) return;

    // player.x is normalized to [-1, 1], camera must be multiplied
    this.x = player.x * circuit.roadWidth;
    this.y = player.groundY + 1000;

    this.z = player.z - this.distToPlayer;

    // don't let the camera Z go negative
    if (this.z < 0) {
      this.z += circuit.roadLength;
    }
  }
}
