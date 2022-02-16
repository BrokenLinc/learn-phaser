import { ScreenCoords, SCREEN, SCREEN_CENTER } from './types';
import { MainScene } from './index';

const GRAVITY = 4;
const STEERING_POWER = 0.03;
const BRAKING_POWER = 0.03;
const GAS_POWER = 0.02;
const FRICTION_POWER = 0.2;
const DRIFT_FACTOR = 0.04;
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
        this.speed =
          segmentMaxSpeed +
          (this.speed - segmentMaxSpeed) * (1 - FRICTION_POWER);
      } else if (this.speed < segmentMaxSpeed) {
        // gas
        if (cursors.up.isDown) {
          this.speed += (segmentMaxSpeed - this.speed) * GAS_POWER;
        }
        // brake
        // TODO: halt under lowest speed
        if (cursors.down.isDown) {
          this.speed *= 1 - BRAKING_POWER;
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

    // TODO: move playerturn/playerground to circuit, read into camera and player
    const playerSegment = circuit.getSegment(this.z);
    const fractionOfSegmentTravelled =
      (this.z - playerSegment.point.world.z) / circuit.segmentLength;
    const playerIndex = playerSegment.index;
    const nextIndex =
      playerIndex < circuit.total_segments - 1 ? playerIndex + 1 : 0;
    const nextSegment = circuit.segments[nextIndex];
    const turn = nextSegment.point.turn - playerSegment.point.turn;
    const groundY =
      playerSegment.point.world.y * (1 - fractionOfSegmentTravelled) +
      nextSegment.point.world.y * fractionOfSegmentTravelled;

    // turn drift
    this.x += ((turn * DRIFT_FACTOR) / -1000) * this.speed;

    // steering
    if (cursors.left.isDown) {
      this.x -= STEERING_POWER;
    }
    if (cursors.right.isDown) {
      this.x += STEERING_POWER;
    }

    // this.y = groundY;

    // rises & jumps
    const newY = Math.max(this.y + this.dy - GRAVITY, groundY);
    this.dy = newY - this.y;
    this.y = newY;
    this.touchingGround = this.y <= groundY;
    this.sprite.alpha = this.touchingGround ? 1 : 0.5;
  }
}
