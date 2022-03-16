export enum KEY_DOWN {
  p = 'keydown-P',
}

export enum SCENE {
  main = 'main',
  pause = 'pause',
}

export enum SCREEN {
  w = 1920,
  h = 1080,
}

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
