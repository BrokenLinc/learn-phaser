import { Segment } from './types';
import { SCREEN, SEGMENT_LENGTH, VISIBLE_SEGMENTS } from './constants';
import { MainScene } from './index';
import { drawSegment, project3D } from './drawing';
import { createRoad } from './tracks';
export class Circuit {
  scene: MainScene;
  segments: Segment[];
  roadLanes: number;
  roadWidth: number;
  roadLength: number;
  graphics: Phaser.GameObjects.Graphics;
  texture: Phaser.GameObjects.RenderTexture;
  clipBottomLine: number;

  constructor(scene: MainScene) {
    this.scene = scene;

    this.graphics = scene.add.graphics();
    this.texture = scene.add.renderTexture(0, 0, SCREEN.W, SCREEN.H);
    this.segments = [];
    this.roadLanes = 3;
    this.roadWidth = 1000;
    this.roadLength = 0;
    this.clipBottomLine = SCREEN.H;
  }

  create() {
    this.segments = createRoad();
    this.roadLength = this.segments.length * SEGMENT_LENGTH;
  }

  getSegment(positionZ: number) {
    let z = positionZ;
    if (z < 0) {
      z += this.roadLength;
    }
    const index = Math.floor(z / SEGMENT_LENGTH) % this.segments.length;
    return this.segments[index];
  }

  // TODO: split into camera and player/enemy/moving-object
  getPositionals() {
    const camera = this.scene.camera;
    const player = this.scene.player;
    if (!camera || !player) return null;

    const baseSegment = this.getSegment(camera.z);
    const baseIndex = baseSegment?.index;

    const playerSegment = this.getSegment(player.z);
    const fractionOfSegmentTravelled =
      (player.z - playerSegment.point.world.z) / SEGMENT_LENGTH;
    const playerIndex = playerSegment.index;
    const nextIndex =
      playerIndex < this.segments.length - 1 ? playerIndex + 1 : 0;
    const nextSegment = this.segments[nextIndex];

    const playerTurn =
      playerSegment.point.turn * (1 - fractionOfSegmentTravelled) +
      nextSegment.point.turn * fractionOfSegmentTravelled;
    const nextSegmentTurnDiff =
      nextSegment.point.turn - playerSegment.point.turn;
    const groundY =
      playerSegment.point.world.y * (1 - fractionOfSegmentTravelled) +
      nextSegment.point.world.y * fractionOfSegmentTravelled;

    return {
      baseIndex,
      groundY,
      nextSegmentTurnDiff,
      playerIndex,
      playerTurn,
    };
  }

  render3D() {
    this.graphics.clear();

    const camera = this.scene.camera;
    const player = this.scene.player;
    if (!camera || !player) return;

    const pos = this.getPositionals();
    if (!pos) return;
    const { baseIndex, playerTurn, playerIndex } = pos;

    let playerSegmentFound = false;
    let turn = 0;
    let offsetX = 0;

    for (let n = 0; n < VISIBLE_SEGMENTS; n += 1) {
      const currIndex = (baseIndex + n) % this.segments.length;
      const currSegment = this.segments[currIndex];

      // get the camera offset-Z to loop back the road
      const offsetZ = currIndex < baseIndex ? this.roadLength : 0;

      // bend road only after the player segment
      if (playerSegmentFound) {
        turn += currSegment.point.turn - playerTurn;
        offsetX += turn;
      }
      if (currIndex === playerIndex) {
        playerSegmentFound = true;
      }

      project3D(currSegment.point, camera, this.roadWidth, offsetZ, offsetX);
    }

    for (let n = VISIBLE_SEGMENTS - 1; n >= 0; n -= 1) {
      const currIndex = (baseIndex + n) % this.segments.length;
      const currSegment = this.segments[currIndex];
      const prevIndex =
        currIndex > 0 ? currIndex - 1 : this.segments.length - 1;
      const prevSegment = this.segments[prevIndex];

      // draw this segment only if it is above the clipping bottom line
      const currBottomLine = currSegment.point.screen.y;

      if (n > 0 && currBottomLine < this.clipBottomLine) {
        drawSegment(
          this.graphics,
          currSegment,
          prevSegment.point.screen,
          currSegment.point.screen,
          prevSegment.point.world,
          currSegment.point.world
          // currIndex === playerIndex
        );
      }
    }

    this.texture.clear();

    this.texture.draw(
      player.shadowSprite,
      player.shadowScreenCoords.x,
      player.shadowScreenCoords.y
    );

    this.texture.draw(
      player.sprite,
      player.screenCoords.x,
      player.screenCoords.y
    );
  }
}
