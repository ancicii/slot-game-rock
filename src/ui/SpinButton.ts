import * as PIXI from 'pixi.js';

export class SpinButton {
  private button: PIXI.Sprite;
  private defaultTexture: PIXI.Texture;
  private hoverTexture: PIXI.Texture;

  constructor(
    uiContainer: PIXI.Container,
    app: PIXI.Application,
    onSpin: () => void
  ) {
    this.defaultTexture = PIXI.Texture.from('main_game/ui/spin.png');
    this.hoverTexture = PIXI.Texture.from('main_game/ui/spin_selected.png');

    this.button = new PIXI.Sprite(this.defaultTexture);
    this.button.anchor.set(0.5);
    this.button.width = 80;
    this.button.height = 80;
    this.button.position.set(app.screen.width / 2, app.screen.height - 50);
    this.button.interactive = true;
    this.button.cursor = 'pointer';

    this.button.on('pointerdown', onSpin);
    this.button.on('pointerover', this.onHover.bind(this));
    this.button.on('pointerout', this.onLeave.bind(this));

    uiContainer.addChild(this.button);
  }

  private onHover() {
    this.button.texture = this.hoverTexture;
  }

  private onLeave() {
    this.button.texture = this.defaultTexture;
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
