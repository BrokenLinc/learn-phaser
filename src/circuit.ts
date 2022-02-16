import { Point, ScreenCoords, Segment, SegmentColor } from './types';
import {
  COLOR,
  SCREEN,
  SCREEN_CENTER,
  SEGMENT_LENGTH,
  VISIBLE_SEGMENTS,
} from './constants';
import { MainScene } from './index';
import { Camera } from './camera';

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
  rumble_segments: number;
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
    this.rumble_segments = 5;
    this.roadLanes = 3;
    this.roadWidth = 1000;
    this.roadLength = 0;
    this.clipBottomLine = SCREEN.H;
  }

  create() {
    this.segments = [];

    this.createRoad();

    for (let n = 0; n < this.rumble_segments; n += 1) {
      // start zone
      this.segments[n].color.road = COLOR.white;
      // finish zone
      this.segments[this.segments.length - 1 - n].color.road = COLOR.charcoal;
    }

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
        Math.floor(n / this.rumble_segments) % 2
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

  project3D(point: Point, camera: Camera, offsetZ: number, offsetX: number) {
    // translate world coordinates to camera coordinates
    const transX = point.world.x - camera.x + offsetX;
    const transY = point.world.y - camera.y;
    const transZ = point.world.z - camera.z + offsetZ;

    // scaling factor baded on the law of similar triangles
    point.scale = camera.distToPlane / transZ;

    // projecting camera coordinates onto a normalized projection plane
    const projectedX = point.scale * transX;
    const projectedY = point.scale * transY;
    const projectedW = point.scale * this.roadWidth;

    // scaling projected coordinates to the screen coordinates
    point.screen.x = Math.round((1 + projectedX) * SCREEN_CENTER.X);
    point.screen.y = Math.round((1 - projectedY) * SCREEN_CENTER.Y);
    point.screen.w = Math.round(projectedW * SCREEN_CENTER.X);
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

    const playerTurn =
      playerSegment.point.turn * (1 - fractionOfSegmentTravelled) +
      nextSegment.point.turn * fractionOfSegmentTravelled;
    const drift = nextSegment.point.turn - playerSegment.point.turn;
    const groundY =
      playerSegment.point.world.y * (1 - fractionOfSegmentTravelled) +
      nextSegment.point.world.y * fractionOfSegmentTravelled;

    return {
      baseIndex,
      drift,
      groundY,
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
      const currIndex = (baseIndex + n) % this.total_segments;
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

      this.project3D(currSegment.point, camera, offsetZ, offsetX);
    }

    for (let n = VISIBLE_SEGMENTS - 1; n >= 0; n -= 1) {
      const currIndex = (baseIndex + n) % this.total_segments;
      const currSegment = this.segments[currIndex];
      const prevIndex = currIndex > 0 ? currIndex - 1 : this.total_segments - 1;
      const prevSegment = this.segments[prevIndex];

      // draw this segment only if it is above the clipping bottom line
      const currBottomLine = currSegment.point.screen.y;

      if (n > 0 && currBottomLine < this.clipBottomLine) {
        this.drawSegment(
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

  drawSegment(
    segment: Segment,
    p1: ScreenCoords,
    p2: ScreenCoords,
    isBase?: boolean
  ) {
    // draw grass
    this.graphics.fillStyle(segment.color.grass, 1);
    this.graphics.fillRect(0, p2.y, SCREEN.W, p1.y - p2.y);

    // draw road
    this.drawPolygon(
      p1.x - p1.w,
      p1.y,
      p1.x + p1.w,
      p1.y,
      p2.x + p2.w,
      p2.y,
      p2.x - p2.w,
      p2.y,
      isBase ? 0xff_99_cc : segment.color.road
    );

    // draw rumble strips
    const rumble_w1 = p1.w / 5;
    const rumble_w2 = p2.w / 5;
    this.drawPolygon(
      p1.x - p1.w - rumble_w1,
      p1.y,
      p1.x - p1.w,
      p1.y,
      p2.x - p2.w,
      p2.y,
      p2.x - p2.w - rumble_w2,
      p2.y,
      segment.color.rumble
    );
    this.drawPolygon(
      p1.x + p1.w + rumble_w1,
      p1.y,
      p1.x + p1.w,
      p1.y,
      p2.x + p2.w,
      p2.y,
      p2.x + p2.w + rumble_w2,
      p2.y,
      segment.color.rumble
    );

    // draw lanes
    if (segment.color.lane) {
      const line_w1 = p1.w / 20 / 2;
      const line_w2 = p2.w / 20 / 2;

      const lane_w1 = (p1.w * 2) / this.roadLanes;
      const lane_w2 = (p2.w * 2) / this.roadLanes;

      let lane_x1 = p1.x - p1.w;
      let lane_x2 = p2.x - p2.w;

      for (let i = 1; i < this.roadLanes; i += 1) {
        lane_x1 += lane_w1;
        lane_x2 += lane_w2;

        this.drawPolygon(
          lane_x1 - line_w1,
          p1.y,
          lane_x1 + line_w1,
          p1.y,
          lane_x2 + line_w2,
          p2.y,
          lane_x2 - line_w2,
          p2.y,
          segment.color.lane
        );
      }
    }
  }

  drawPolygon(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
    color: number
  ) {
    this.graphics.fillStyle(color, 1);
    this.graphics.beginPath();

    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.lineTo(x3, y3);
    this.graphics.lineTo(x4, y4);

    this.graphics.closePath();
    this.graphics.fill();
  }
}
