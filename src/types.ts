export enum COLOR {
  almostwhite = 0xdddddd,
  charcoal = 0x222222,
  darkgray = 0x666666,
  darkgreen = 0x397d46,
  gray = 0x888888,
  green = 0x429352,
  red = 0xb8312e,
  white = 0xffffff,
}

export type SPRITE_NAME = 'background' | 'playerCar';

export enum SPRITE_KEY {
  background = 'background',
  playerCar = 'playerCar',
}

export enum SPRITE_INDEX {
  PLAYER = 0,
}

export enum SCREEN {
  W = 1920,
  H = 1080,
}

export enum SCREEN_CENTER {
  X = SCREEN.W / 2,
  Y = SCREEN.H / 2,
}

export enum STATE {
  INIT = 1,
  RESTART = 2,
  PLAY = 3,
  GAMEOVER = 4,
}

export enum SCENE {
  MAIN = 'SceneMain',
  PAUSE = 'ScenePause',
}

export enum KEYDOWN {
  P = 'keydown-P',
}

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
}

export interface SegmentColor {
  road: number;
  grass: number;
  rumble: number;
  lane?: number;
}

export interface Segment {
  index: number;
  point: Point;
  color: SegmentColor;
}
