import { ScreenCoords } from './types';
import {
  BRAKING_POWER,
  DRIFT_FACTOR,
  FRICTION_POWER,
  GAS_POWER,
  GRAVITY,
  SCREEN,
  SCREEN_CENTER,
  SEGMENT_LENGTH,
  STEERING_POWER,
} from './constants';
import { MainScene } from './index';
export class Player {
  scene: MainScene;
  x: number;
  y: number;
  groundY: number;
  z: number;
  w: number;
  dx: number;
  dy: number;
  screenCoords: ScreenCoords;
  shadowScreenCoords: ScreenCoords;
  maxSpeed: number;
  speed: number;
  sprite: Phaser.GameObjects.Image;
  shadowSprite: Phaser.GameObjects.Image;
  touchingGround: boolean;

  constructor(scene: MainScene) {
    this.scene = scene;

    this.sprite = scene.sprites?.rider as Phaser.GameObjects.Image;
    this.shadowSprite = scene.sprites?.rider_shadow as Phaser.GameObjects.Image;

    // player world coordinates
    this.x = 0;
    this.y = 0;
    this.groundY = 0;
    this.z = 0;
    this.w = (this.sprite.width / 1000) * 2;
    this.dx = 0;
    this.dy = 0;

    // player screen coordinates
    this.screenCoords = { x: 0, y: 0, w: 0, h: 0 };
    this.shadowScreenCoords = { x: 0, y: 0, w: 0, h: 0 };

    // avoid moving more than 1 segment per frame, at 60fps
    this.maxSpeed = SEGMENT_LENGTH * 60;
    this.speed = 0;
    this.touchingGround = true;
  }

  init() {
    const scale = 1.5;
    const width = this.sprite.width * scale;
    const height = this.sprite.height * scale;

    this.sprite.setDisplaySize(width, height);

    this.screenCoords.w = width;
    this.screenCoords.h = height;

    this.screenCoords.x = SCREEN_CENTER.X;
    this.screenCoords.y = (SCREEN.H * 3) / 4 - (this.screenCoords.h * 7) / 25;

    const shadowWidth = this.shadowSprite.width * scale;
    const shadowHeight = this.shadowSprite.height * scale;

    this.shadowSprite.setDisplaySize(shadowWidth, shadowHeight);

    this.shadowScreenCoords.w = shadowWidth;
    this.shadowScreenCoords.h = shadowHeight;

    this.shadowScreenCoords.x = SCREEN_CENTER.X;
    this.shadowScreenCoords.y =
      (SCREEN.H * 3) / 4 - (this.shadowScreenCoords.h * 7) / 25;
  }

  restart() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  update(dt: number) {
    const { circuit, cursors } = this.scene;
    if (!circuit || !cursors) return;

    const pos = circuit.getPositionals();
    if (!pos) return;
    const { nextSegmentTurnDiff, groundY } = pos;

    this.groundY = groundY;

    const MIN_SPEED_UP = 600;
    const MIN_SPEED_DOWN = 300;

    // speed modifiers
    if (this.touchingGround) {
      const grassMaxSpeed = this.maxSpeed / 2;
      const segmentMaxSpeed =
        this.x < -1 || this.x > 1 ? grassMaxSpeed : this.maxSpeed;
      if (this.speed > segmentMaxSpeed) {
        // high friction
        this.speed =
          segmentMaxSpeed +
          (this.speed - segmentMaxSpeed) * (1 - FRICTION_POWER);
        if (this.speed < MIN_SPEED_DOWN) {
          this.speed = 0;
        }
      } else if (this.speed < segmentMaxSpeed) {
        if (cursors.up.isDown) {
          // gas
          this.speed += (segmentMaxSpeed - this.speed) * GAS_POWER;
          if (this.speed < MIN_SPEED_UP) {
            this.speed = MIN_SPEED_UP;
          }
        } else if (cursors.down.isDown) {
          // brake
          this.speed *= 1 - BRAKING_POWER;
          if (this.speed < MIN_SPEED_DOWN) {
            this.speed = 0;
          }
        } else {
          // low friction
          this.speed *= 1 - BRAKING_POWER / 30;
          if (this.speed < MIN_SPEED_DOWN) {
            this.speed = 0;
          }
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

    // turn drift
    this.x += ((nextSegmentTurnDiff * DRIFT_FACTOR) / -1_000) * this.speed;

    // steering
    if (cursors.left.isDown) {
      this.x -= STEERING_POWER;
    }
    if (cursors.right.isDown) {
      this.x += STEERING_POWER;
    }

    // rises & jumps
    const newY = Math.max(this.y + this.dy - GRAVITY, groundY);
    this.dy = newY - this.y;
    this.y = newY;
    this.screenCoords.y =
      (SCREEN.H * 3) / 4 -
      (this.shadowScreenCoords.h * 7) / 25 -
      (this.y - groundY) / 10;
    // this.y = groundY;
    this.touchingGround = this.y === groundY;
    // this.sprite.alpha = this.touchingGround ? 1 : 0.5;
  }
}
