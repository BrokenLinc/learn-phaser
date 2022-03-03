export const TRACK_RES = 0.7;
export const BRAKING_POWER = 0.03;
export const GAS_POWER = 0.02;
export const FRICTION_POWER = 0.02;
export const DRIFT_FACTOR = 0.05;
export const SEGMENT_LENGTH = 100 * TRACK_RES;
export const VISIBLE_SEGMENTS = Math.ceil(300 / TRACK_RES);
export const STEERING_POWER = (30 / 1_000) * TRACK_RES;
export const GRAVITY = 4.5;

export enum COLOR {
  almostwhite = 0xdd_dd_dd,
  black = 0x00_00_00,
  charcoal = 0x22_22_22,
  darkgray = 0x66_66_66,
  darkgreen = 0x39_7d_46,
  gray = 0x88_88_88,
  green = 0x42_93_52,
  red = 0xb8_31_2e,
  white = 0xff_ff_ff,
  teal = 0x22_dd_99,
}

export type SPRITE_NAME = 'background' | 'playerCar';

export enum SPRITE_KEY {
  // background = 'background',
  playerCar = 'playerCar',
  rider = 'rider',
  rider_shadow = 'rider_shadow',
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
