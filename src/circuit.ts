import {
  COLOR,
  Point,
  SCREEN,
  SCREEN_CENTER,
  ScreenCoords,
  Segment,
  SegmentColor,
} from './types';
import { MainScene } from './index';
import { Camera } from './camera';

const SEGMENT_COLOR: Record<string, SegmentColor> = {
  LIGHT: { road: COLOR.gray, grass: COLOR.green, rumble: COLOR.red },
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
  segmentLength: number;
  total_segments: number;
  visible_segments: number;
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
    this.segmentLength = 100;
    this.total_segments = 300;
    this.visible_segments = 300;
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

    this.roadLength = this.total_segments * this.segmentLength;
  }

  createRoad() {
    this.createSection(this.total_segments);
  }

  createSection(nSegments: number) {
    for (var i = 0; i < nSegments; i += 1) {
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
          y: Math.sin((n / this.total_segments) * 10 * Math.PI * 2) * 300,
          z: n * this.segmentLength,
        },
        screen: { x: 0, y: 0, w: 0, h: 0 },
        scale: -1,
        turn: 0, //Math.sin((n / this.total_segments) * Math.PI * 2) * 5,
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
    const index = Math.floor(z / this.segmentLength) % this.total_segments;
    return this.segments[index];
  }

  project3D(point: Point, camera: Camera, offsetZ: number) {
    // translate world coordinates to camera coordinates
    const transX = point.world.x - camera.x;
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

  render3D() {
    this.graphics.clear();

    const camera = this.scene.camera;
    const player = this.scene.player;
    if (!camera || !player) return;

    const baseSegment = this.getSegment(camera.z);
    const baseIndex = baseSegment?.index;
    const playerSegment = this.getSegment(player.z);

    let turn = 0;
    let offset = 0;

    for (let n = 0; n < this.visible_segments; n += 1) {
      const currIndex = (baseIndex + n) % this.total_segments;
      const currSegment = this.segments[currIndex];

      // get the camera offset-Z to loop back the road
      const offsetZ = currIndex < baseIndex ? this.roadLength : 0;

      this.project3D(currSegment.point, camera, offsetZ);

      turn += currSegment.point.turn;
      offset += turn;

      currSegment.point.screen.x += offset * currSegment.point.scale * 1000;
    }

    for (let n = this.visible_segments - 1; n >= 0; n -= 1) {
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
          // currSegment === playerSegment
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
      isBase ? 0xff99cc : segment.color.road
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
