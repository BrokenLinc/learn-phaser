import 'phaser';

import './index.css';

const Phaser = window.Phaser;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: {
    preload: preload,
    create: create,
  },
};

function preload(this: Phaser.Scene) {
  const { load } = this;
  load.setBaseURL('http://labs.phaser.io');

  load.image('sky', 'assets/skies/space3.png');
  load.image('logo', 'assets/sprites/phaser3-logo.png');
  load.image('red', 'assets/particles/red.png');
}

function create(this: Phaser.Scene) {
  const { add, physics } = this;

  add.image(400, 300, 'sky');

  const particles = add.particles('red');

  const emitter = particles.createEmitter({
    speed: 100,
    scale: { start: 1, end: 0 },
    blendMode: 'ADD',
  });

  const logo = physics.add.image(400, 100, 'logo');

  logo.setVelocity(100, 200);
  logo.setBounce(1, 1);
  logo.setCollideWorldBounds(true);

  emitter.startFollow(logo);
}

new Phaser.Game(config);
