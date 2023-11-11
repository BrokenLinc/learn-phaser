import 'phaser';

import './index.css';

const Phaser = window.Phaser;

enum SCREEN {
  width = 480,
  height = 480,
}

enum SCREEN_CENTER {
  x = SCREEN.width / 2,
  y = SCREEN.height / 2,
}

const config = {
  type: Phaser.AUTO,
  width: SCREEN.width,
  height: SCREEN.height,
  pixelArt: true,
  // antialias: false,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
    },
  },
  scene: {
    init: init,
    preload: preload,
    create: create,
    update: update,
  },
  backgroundColor: '#ffffff',
  // debug: true,
};

let enemiesGroup: Phaser.Physics.Arcade.Group;
const bubbles: Phaser.Physics.Arcade.Sprite[] = [];

function preload(this: Phaser.Scene) {
  const { load } = this;

  load.image('bubble', 'bubble.png');
  load.image('green-donut', 'green-donut.png');

  enemiesGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
  });
  this.physics.add.collider(enemiesGroup, enemiesGroup);
}

function init(this: Phaser.Scene) {
  const { scale, input } = this;
  scale.displaySize.setSnap(320, 200);
  scale.refresh();

  input.keyboard.on('keyup-F', () => {
    scale.toggleFullscreen();
  });
}

function addBubble() {
  const bubble: Phaser.Physics.Arcade.Sprite = enemiesGroup?.create(
    Math.random() * SCREEN.width,
    Math.random() * SCREEN.height,
    'bubble'
  );
  bubble.setCircle(4); // pre-scaling
  bubble.setDisplaySize(8, 8);
  bubble.setVelocity(0, 0);
  // bubble.setMass(0.7);
  bubble.setBounce(0.99);
  bubble.setCollideWorldBounds(true);
  bubbles.push(bubble);
}

function create(this: Phaser.Scene) {
  for (let i = 0; i < 2000; i++) {
    addBubble();
  }

  // const greenDonut: Phaser.Types.Physics.Arcade.ImageWithStaticBody =
  //   this.physics.add.staticImage(
  //     SCREEN_CENTER.x,
  //     SCREEN_CENTER.y,
  //     'green-donut'
  //   );
  // greenDonut.setDisplaySize(64, 64);
  // greenDonut.setCircle(32); // pre-scaling
  // this.physics.add.collider(greenDonut, enemiesGroup);

  // greenDonut.setVelocity(-50, 50);
  // greenDonut.setMass(1.6);
  // greenDonut.setBounce(0);
  // greenDonut.setCollideWorldBounds(true);
}

function update(this: Phaser.Scene) {
  const force = 3;

  for (const bubble of bubbles) {
    const angle = Math.atan2(
      SCREEN_CENTER.y - bubble.y,
      SCREEN_CENTER.x - bubble.x
    );
    bubble.setVelocity(
      bubble.body.velocity.x + force * Math.cos(angle),
      bubble.body.velocity.y + force * Math.sin(angle)
    );
  }
}

new Phaser.Game(config);
