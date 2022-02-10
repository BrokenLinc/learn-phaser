import { ScreenCoords, SCREEN, SCREEN_CENTER } from './types';
import { MainScene } from './index';

const GRAVITY = 1.4;
export class Player {
  scene: MainScene;
  x: number;
  y: number;
  z: number;
  w: number;
  dx: number;
  dy: number;
  screenCoords: ScreenCoords;
  maxSpeed: number;
  speed: number;
  sprite: Phaser.GameObjects.Image;
  touchingGround: boolean;

  constructor(scene: MainScene) {
    this.scene = scene;

    this.sprite = scene.sprites?.playerCar as Phaser.GameObjects.Image;

    // player world coordinates
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = (this.sprite.width / 1000) * 2;
    this.dx = 0;
    this.dy = 0;

    // player screen coordinates
    this.screenCoords = { x: 0, y: 0, w: 0, h: 0 };

    // avoid moving more than 1 segment per frame, at 60fps
    this.maxSpeed = (scene.circuit?.segmentLength ?? 0) / (1 / 60);

    this.speed = 0;

    this.touchingGround = true;
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

    // this.speed = this.maxSpeed;
  }

  update(dt: number) {
    const { circuit, cursors } = this.scene;
    if (!circuit || !cursors) return;

    // speed modifiers
    if (this.touchingGround) {
      const grassMaxSpeed = this.maxSpeed / 2;
      const segmentMaxSpeed =
        this.x < -1 || this.x > 1 ? grassMaxSpeed : this.maxSpeed;
      if (this.speed > segmentMaxSpeed) {
        // friction
        this.speed = segmentMaxSpeed + (this.speed - segmentMaxSpeed) * 0.8;
      } else if (this.speed < segmentMaxSpeed) {
        // gas
        if (cursors.up.isDown) {
          this.speed += (segmentMaxSpeed - this.speed) * 0.02;
        }
      }
    }

    // cap speed
    this.speed = Math.min(this.maxSpeed, this.speed);

    // moving in z direction
    this.z += this.speed * dt;
    if (this.z >= circuit.roadLength) {
      this.z -= circuit.roadLength;
    }

    const playerSegment = circuit.getSegment(this.z);

    // turn drift
    // this.x += playerSegment.point.turn * -0.008; // TODO: FIX: adjust factor by speed

    // steering
    if (cursors.left.isDown) {
      this.x += -0.05;
    }
    if (cursors.right.isDown) {
      this.x += 0.05;
    }

    this.y = playerSegment.point.world.y;

    // rises & jumps
    // const newY = Math.max(
    //   this.y + this.dy - GRAVITY,
    //   playerSegment.point.world.y // TODO: FIX: determine slope
    // );
    // this.dy = newY - this.y;
    // this.y = newY;
    // this.touchingGround = this.y <= playerSegment.point.world.y;
    // this.sprite.alpha = this.touchingGround ? 1 : 0.5;
  }
}
