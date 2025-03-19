import * as PIXI from 'pixi.js';

export class SpinButton {
  private button: PIXI.Sprite;

  constructor(
    uiContainer: PIXI.Container,
    app: PIXI.Application,
    onSpin: () => void
  ) {
    this.button = new PIXI.Sprite(
      PIXI.Texture.from('main_game/ui/start_btn.png')
    );
    this.button.anchor.set(0.5);
    this.button.width = 100;
    this.button.height = 100;
    this.button.position.set(app.screen.width / 2, app.screen.height - 60);
    this.button.interactive = true;
    this.button.cursor = 'pointer';
    this.button.on('pointerdown', onSpin);
    uiContainer.addChild(this.button);
  }

  disable() {
    this.button.interactive = false;
    this.button.alpha = 0.5;
  }

  enable() {
    this.button.interactive = true;
    this.button.alpha = 1;
  }
}
