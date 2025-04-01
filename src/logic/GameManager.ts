import * as PIXI from 'pixi.js';
import { Reel } from "../components/Reel";

export class GameManager {
  private winningLines: number[][];

  constructor() {
    this.winningLines = [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
      [0, 1, 2, 1, 0],
      [2, 1, 0, 1, 2],
    ];
  }

  public getRandomWinningLine(): number[] {
    const winningLineIndex = Math.floor(
      Math.random() * this.winningLines.length
    );
    return this.winningLines[winningLineIndex];
  }

  public checkWinningLines(reels: Reel[]): { line: number[]; count: number; winningSymbol: string | null }[] {
    let winningResults: { line: number[]; count: number; winningSymbol: string | null }[] = [];

    for (const line of this.winningLines) {
      let firstSymbol = reels[0].getActiveSymbols()[line[0]];
      if (firstSymbol === "bonus") continue;

      let winningSymbol = (firstSymbol === "wild" || firstSymbol === "wild_sticky") ? null : firstSymbol;
      let consecutiveSymbols = 1;
      let wildCount = (firstSymbol === "wild" || firstSymbol === "wild_sticky") ? 1 : 0;

      for (let reelIndex = 1; reelIndex < reels.length; reelIndex++) {
        const currentSymbol = reels[reelIndex].getActiveSymbols()[line[reelIndex]];
        if (currentSymbol === "bonus") break;

        if (currentSymbol === "wild" || currentSymbol === "wild_sticky") {
          wildCount++;
        }

        if(!winningSymbol && currentSymbol !== "wild" && currentSymbol !== "wild_sticky") winningSymbol = currentSymbol;
        if (currentSymbol === winningSymbol || currentSymbol === "wild" || currentSymbol === "wild_sticky" || (consecutiveSymbols === 1 && (firstSymbol === "wild" || firstSymbol === "wild_sticky"))) {
          consecutiveSymbols++;
        } else {
          break;
        }
      }

      if (consecutiveSymbols >= 3 || wildCount === 5) {
        winningResults.push({
          line: [...line],
          count: wildCount===5 ? 5 : consecutiveSymbols,
          winningSymbol: wildCount===5 ? "wild" : winningSymbol,
        });

        for (let reelIndex = 0; reelIndex < consecutiveSymbols; reelIndex++) {
          const reel = reels[reelIndex];
          const symbol = reel.getActiveSymbolAt(line[reelIndex]);

          if (symbol && (symbol as any).textureName !== "bonus") {
            const textureName = (symbol as any).textureName;
            const newTexture = PIXI.Texture.from(`main_game/${textureName}_win.png`);
            symbol.texture = newTexture;
          }
        }
      }
    }
    return winningResults;
  }
}
