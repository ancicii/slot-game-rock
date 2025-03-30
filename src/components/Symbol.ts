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
    "wild": 5, // Rare
    "bonus": 5, // Rare
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

  private static generateRandomSymbol(){
    const randomIndex = Math.floor(Math.random() * Symbol.WEIGHTED_POOL.length);
    return Symbol.WEIGHTED_POOL[randomIndex];
  }

  public static generateWinningSymbol(): string {
    const validSymbols = Object.keys(Symbol.SYMBOL_WEIGHTS).filter(
      (symbol) => symbol !== "wild" && symbol !== "bonus"
    );
  
    const randomIndex = Math.floor(Math.random() * validSymbols.length);
    return validSymbols[randomIndex];
  }

  constructor(y: number, symbolName?: string) {
   
    this.textureName = symbolName || Symbol.generateRandomSymbol();
    this.sprite = PIXI.Sprite.from(`main_game/${this.textureName}.png`);

    this.sprite.scale.set(0.8);
    this.sprite.y = y;
  }
}
