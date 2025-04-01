import * as PIXI from 'pixi.js';

export class Symbol {
  public sprite: PIXI.Sprite;
  public textureName: string;

  private static readonly SYMBOL_WEIGHTS: { [key: string]: number } = {
    "low_1": 30, // Highest probability
    "low_2": 30,
    "low_3": 30,
    "high_1": 20, // Medium
    "high_2": 20,
    "high_3": 20,
    "high_4": 10, // Lower
    "high_5": 10,
    "wild": 8, // Rare
    "bonus": 6, // Rare
  };

  private static readonly WEIGHTED_POOL = Symbol.generateWeightedPool();

  private static generateWeightedPool(): string[] {
    const pool: string[] = [];

    for (const [symbol, weight] of Object.entries(Symbol.SYMBOL_WEIGHTS)) {
      for (let i = 0; i < weight; i++) {
        pool.push(symbol);
      }
    }

    return pool;
  }

  private static generateRandomSymbol(isBonus: boolean): string {
    const filteredPool = isBonus
      ? Symbol.WEIGHTED_POOL.filter((symbol) => symbol !== "bonus")
      : Symbol.WEIGHTED_POOL;
  
    const randomIndex = Math.floor(Math.random() * filteredPool.length);
    return filteredPool[randomIndex];
  }

  public static generateWinningSymbol(): string {
    const validSymbols = Object.keys(Symbol.SYMBOL_WEIGHTS).filter(
      (symbol) => symbol !== "wild" && symbol !== "bonus"
    );
  
    const randomIndex = Math.floor(Math.random() * validSymbols.length);
    return validSymbols[randomIndex];
  }

  constructor(y: number, isBonusGame: boolean, isBonus: boolean, symbolName?: string) {
   
    this.textureName = symbolName || Symbol.generateRandomSymbol(isBonus);
    if (isBonusGame && this.textureName === "wild") {
      this.textureName = "wild_sticky";
    }
    this.sprite = PIXI.Sprite.from(`main_game/${this.textureName}.png`);
    (this.sprite as any).textureName = this.textureName;
    this.sprite.scale.set(0.8);
    this.sprite.y = y;
  }
}
