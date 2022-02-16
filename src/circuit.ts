import { Segment, SegmentColor } from './types';
import { COLOR, SCREEN, SEGMENT_LENGTH, VISIBLE_SEGMENTS } from './constants';
import { MainScene } from './index';
import { drawSegment, project3D } from './drawing';

const SEGMENT_COLOR: Record<string, SegmentColor> = {
  LIGHT: {
    road: COLOR.gray,
    grass: COLOR.green,
    rumble: COLOR.red,
  },
  DARK: {
    road: COLOR.darkgray,
    grass: COLOR.darkgreen,
    rumble: COLOR.almostwhite,
    lane: COLOR.almostwhite,
  },
};

export class Circuit {
  scene: MainScene;
  segments: Segment[];
  total_segments: number;
  // rumble_segments: number;
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
    this.total_segments = 300;
    // this.rumble_segments = 5;
    this.roadLanes = 3;
    this.roadWidth = 1000;
    this.roadLength = 0;
    this.clipBottomLine = SCREEN.H;
  }

  create() {
    this.segments = [];

    this.createRoad();

    // for (let n = 0; n < this.rumble_segments; n += 1) {
    //   // start zone
    //   this.segments[n].color.road = COLOR.white;
    //   // finish zone
    //   this.segments[this.segments.length - 1 - n].color.road = COLOR.charcoal;
    // }

    this.roadLength = this.total_segments * SEGMENT_LENGTH;
  }

  createRoad() {
    this.createSection(this.total_segments);
  }

  createSection(nSegments: number) {
    for (let i = 0; i < nSegments; i += 1) {
      this.createSegment();
    }
  }

  createSegment() {
    const n = this.segments.length;

    this.segments.push({
      index: n,
      point: {
        world: {
          x: 0,
          y: Math.sin((n / this.total_segments) * 2 * Math.PI * 2) * 3000,
          z: n * SEGMENT_LENGTH,
        },
        screen: { x: 0, y: 0, w: 0, h: 0 },
        scale: -1,
        turn: Math.sin((n / this.total_segments) * Math.PI * 2) * 5,
      },
      color:
        Math.floor(n / 5) % 2
          ? { ...SEGMENT_COLOR.DARK }
          : { ...SEGMENT_COLOR.LIGHT },
    });
  }

  getSegment(positionZ: number) {
    let z = positionZ;
    if (z < 0) {
      z += this.roadLength;
    }
    const index = Math.floor(z / SEGMENT_LENGTH) % this.total_segments;
    return this.segments[index];
  }

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
      playerIndex < this.total_segments - 1 ? playerIndex + 1 : 0;
    const nextSegment = this.segments[nextIndex];

    const playerTurn = playerSegment.point.turn;
    const playerNextTurn = nextSegment.point.turn - playerSegment.point.turn;
    const groundY =
      playerSegment.point.world.y * (1 - fractionOfSegmentTravelled) +
      nextSegment.point.world.y * fractionOfSegmentTravelled;

    return {
      baseIndex,
      groundY,
      playerIndex,
      playerNextTurn,
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
    const { baseIndex, playerNextTurn, playerIndex } = pos;

    let playerSegmentFound = false;
    let turn = 0;
    let offsetX = 0;

    for (let n = 0; n < VISIBLE_SEGMENTS; n += 1) {
      const currIndex = (baseIndex + n) % this.total_segments;
      const currSegment = this.segments[currIndex];

      // get the camera offset-Z to loop back the road
      const offsetZ = currIndex < baseIndex ? this.roadLength : 0;

      // bend road only after the player segment
      if (playerSegmentFound) {
        turn += currSegment.point.turn - playerNextTurn;
        offsetX += turn;
      }
      if (currIndex === playerIndex) {
        playerSegmentFound = true;
      }

      project3D(currSegment.point, camera, this.roadWidth, offsetZ, offsetX);
    }

    for (let n = VISIBLE_SEGMENTS - 1; n >= 0; n -= 1) {
      const currIndex = (baseIndex + n) % this.total_segments;
      const currSegment = this.segments[currIndex];
      const prevIndex = currIndex > 0 ? currIndex - 1 : this.total_segments - 1;
      const prevSegment = this.segments[prevIndex];

      // draw this segment only if it is above the clipping bottom line
      const currBottomLine = currSegment.point.screen.y;

      if (n > 0 && currBottomLine < this.clipBottomLine) {
        drawSegment(
          this.graphics,
          currSegment,
          prevSegment.point.screen,
          currSegment.point.screen
        );
      }
    }

    this.texture.clear();

    this.texture.draw(
      player.sprite,
      player.screenCoords.x,
      player.screenCoords.y
    );
  }
}
