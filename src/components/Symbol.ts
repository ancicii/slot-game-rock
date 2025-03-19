import * as PIXI from 'pixi.js';

export class Symbol {
  public sprite: PIXI.Sprite;
  public textureIndex: number;

  constructor(y: number, symbolIndex?: number) {
    this.textureIndex =
      symbolIndex !== undefined
        ? symbolIndex
        : Math.floor(Math.random() * 9) + 1;
    this.sprite = PIXI.Sprite.from(`main_game/icon_${this.textureIndex}.png`);

    this.sprite.scale.set(0.8);
    this.sprite.y = y;
  }

  public setRandomTexture(symbolIndex?: number) {
    this.textureIndex =
      symbolIndex !== undefined
        ? symbolIndex
        : Math.floor(Math.random() * 9) + 1;
    this.sprite = PIXI.Sprite.from(`main_game/icon_${this.textureIndex}.png`);
  }
}
