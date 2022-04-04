export enum KEY_DOWN {
  p = 'keydown-P',
}

export enum SCENE {
  main = 'main',
  pause = 'pause',
}

export enum SCREEN {
  w = 800, //1920 / 2,
  h = 800, //1080 / 2,
}

const SCREEN_BOUNDS_DIST = Math.sqrt(
  Math.pow(SCREEN.h / 2, 2) + Math.pow(SCREEN.w / 2, 2)
);

export enum SCREEN_CENTER {
  x = SCREEN.w / 2,
  y = SCREEN.h / 2,
}

export enum STATE {
  init = 1,
  restart = 2,
  play = 3,
  gameOver = 4,
}

export enum DISTANCE {
  edge = SCREEN_BOUNDS_DIST,
  spawn = SCREEN_BOUNDS_DIST + 40,
  despawn = SCREEN_BOUNDS_DIST + 80,
}
