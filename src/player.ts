import { ScreenCoords, SCREEN, SCREEN_CENTER } from './types';
import { MainScene } from './index';

export class Player {
  scene: MainScene;
  x: number;
  y: number;
  z: number;
  w: number;
  screenCoords: ScreenCoords;
  maxSpeed: number;
  speed: number;
  sprite: Phaser.GameObjects.Image;

  constructor(scene: MainScene) {
    this.scene = scene;

    this.sprite = scene.sprites?.playerCar as Phaser.GameObjects.Image;

    // player world coordinates
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = (this.sprite.width / 1000) * 2;

    // player screen coordinates
    this.screenCoords = { x: 0, y: 0, w: 0, h: 0 };

    // avoid moving more than 1 segment per frame, at 60fps
    this.maxSpeed = (scene.circuit?.segmentLength ?? 0) / (1 / 60);

    this.speed = 0;
  }

  init() {
    this.screenCoords.w = this.sprite.width;
    this.screenCoords.h = this.sprite.height;

    this.screenCoords.x = SCREEN_CENTER.X;
    this.screenCoords.y = SCREEN.H - this.screenCoords.h / 2;
  }

  restart() {
    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.speed = this.maxSpeed;
  }

  update(dt: number) {
    const circuit = this.scene.circuit;
    if (!circuit) return;

    // moving in z direction
    this.z += this.speed * dt;
    if (this.z >= circuit.roadLength) {
      this.z -= circuit.roadLength;
    }

    const playerSegment = circuit.getSegment(this.z);
    this.y = playerSegment.point.world.y;
  }
}
