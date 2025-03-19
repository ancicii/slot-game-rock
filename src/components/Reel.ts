import * as PIXI from 'pixi.js';
import * as TWEEN from '@tweenjs/tween.js';
import { Symbol } from './Symbol';

export class Reel {
  public container: PIXI.Container;
  private symbols: Symbol[] = [];
  private mask: PIXI.Graphics;
  private spinning: boolean = false;
  private activeSymbols: Symbol[] = [];

  private readonly SYMBOL_HEIGHT = 112.5;
  private readonly NUM_SYMBOLS = 6;

  constructor(x: number, y: number) {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.mask = new PIXI.Graphics();
    this.mask.beginFill(0x000000);
    this.mask.drawRect(0, 0, this.SYMBOL_HEIGHT, this.SYMBOL_HEIGHT * 3);
    this.mask.endFill();
    this.container.addChild(this.mask);
    this.container.mask = this.mask;

    this.initializeSymbols();
  }

  private initializeSymbols(predefinedSymbol?: number | null, symbolPosition?: number) {

    for (let i = 0; i < this.NUM_SYMBOLS; i++) {
      const symbol = (predefinedSymbol && symbolPosition === i - 3) ? new Symbol(i * this.SYMBOL_HEIGHT, predefinedSymbol) :  new Symbol(i * this.SYMBOL_HEIGHT);
      this.symbols.push(symbol);
      this.container.addChild(symbol.sprite);
      if (i < 3) this.activeSymbols.push(symbol);
    }
  }

  public spinReel(predefinedSymbol?: number | null, symbolPosition?: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.spinning) return;

      function animate(time: number) {
        requestAnimationFrame(animate);
        TWEEN.update(time);
      }
      requestAnimationFrame(animate);

      this.spinning = true;
      this.container.y = 0;
      this.container.removeChildren();
      this.symbols = [];
      this.initializeSymbols(predefinedSymbol, symbolPosition);

      const distance = this.SYMBOL_HEIGHT * 3;
      const spinDuration = 1000 + Math.random() * 1000;

      new TWEEN.Tween(this.container)
        .to({ y: this.container.y - distance }, spinDuration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
          let firstChildIndex = 0;
          this.container.children.forEach((child, index) => {
            if (child.y === Math.abs(this.container.y)) {
              firstChildIndex = index;
            }
          });

          this.container.children.forEach((child) => {
            if (child.y < this.container.y) {
              child.y += this.SYMBOL_HEIGHT * this.container.children.length;
            }
          });

          this.spinning = false;
          this.activeSymbols = [
            this.symbols[firstChildIndex],
            this.symbols[firstChildIndex + 1],
            this.symbols[firstChildIndex + 2],
          ];
          resolve();
        })
        .start();
    });
  }

  public getActiveSymbols(): number[] {
    return this.activeSymbols.map((symbol) => symbol.textureIndex);
  }

  public getActiveSymbolAt(index: number): PIXI.Sprite {
    return this.activeSymbols[index].sprite;
  }
}
