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
  private readonly NUM_SYMBOLS = 18;

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

  private initializeSymbols(bonusGame: boolean = false, predefinedSymbol?: string | null, symbolPositions?: number[]) {
    let hasBonusSymbol = false;
    
    for (let i = 0; i < this.NUM_SYMBOLS; i++) {
      const symbol = (predefinedSymbol && symbolPositions?.includes(i)) ? new Symbol(i * this.SYMBOL_HEIGHT, bonusGame, hasBonusSymbol, predefinedSymbol) : new Symbol(i * this.SYMBOL_HEIGHT, bonusGame, hasBonusSymbol);
      if(symbol.textureName === 'bonus') hasBonusSymbol = true;
      this.symbols.push(symbol);
      this.container.addChild(symbol.sprite);
      symbol.sprite.zIndex = 1;
      symbol.sprite.parent.zIndex = 1;
      if (i < 3) this.activeSymbols.push(symbol);
    }
  }

  public spinReel(isBonusSpin: boolean, predefinedSymbol?: string | null, symbolPositions?: number[]): Promise<void> {
    return new Promise((resolve) => {
      if (this.spinning) return;
  
      function animate(time: number) {
        requestAnimationFrame(animate);
        TWEEN.update(time);
      }
      requestAnimationFrame(animate);
  
      this.spinning = true;
      this.container.y = -this.SYMBOL_HEIGHT * 18;

      const stickyWilds = new Map<number, Symbol>();
      if(isBonusSpin){
        this.symbols.forEach((symbol, index) => {
          if (symbol.textureName === "wild_sticky") {
            stickyWilds.set(index, symbol);
          }
        });
      }

      this.container.removeChildren();
      this.symbols = [];
      this.initializeSymbols(isBonusSpin, predefinedSymbol, symbolPositions);
      const spinDuration = 500 + Math.random() * 500;
  
      new TWEEN.Tween(this.container)
        .to({ y: 0 }, spinDuration)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          this.container.children.forEach((child) => {
            if (child.y > this.SYMBOL_HEIGHT * this.container.children.length) {
              child.y -= this.SYMBOL_HEIGHT * this.container.children.length;
            }
          });
  
          this.activeSymbols = this.symbols.slice(0, 3);
          this.spinning = false;
          resolve();
        })
        .start();
    });
  }
  
  
  public getActiveSymbols(): string[] {
    return this.activeSymbols.map((symbol) => symbol.textureName);
  }

  public getActiveSymbolAt(index: number): PIXI.Sprite {
    return this.activeSymbols[index].sprite;
  }
}
