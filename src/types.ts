export interface WorldCoords {
  x: number;
  y: number;
  z: number;
}

export interface ScreenCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  world: WorldCoords;
  screen: ScreenCoords;
  scale: number;
  turn: number;
}

export interface SegmentColor {
  road: number;
  underRoad: number;
  grass: number;
  rumble: number;
  lane?: number;
}

export interface Segment {
  index: number;
  point: Point;
  color: SegmentColor;
  hash: number;
  hash2: number;
}
