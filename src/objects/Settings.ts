export class Settings {
  scene: Phaser.Scene;
  txtPause: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const font = { font: '32px Arial', fill: '#ffffff' };
    this.txtPause = scene.add.text(1720, 5, '', font);

    this.show();
  }

  show() {
    this.txtPause.text = '[P] Pause';
  }
}
