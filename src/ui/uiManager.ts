import * as PIXI from 'pixi.js';
import { Balance } from './Balance';
import { Bet } from './Bet';
import { SpinButton } from './SpinButton';
import { Reel } from '../components/Reel';

export class UIManager {
  private app: PIXI.Application;
  private uiContainer: PIXI.Container;
  private balance!: Balance;
  private bet!: Bet;
  private spinButton!: SpinButton;
  private reels: Reel[];
  private spinCount = 0; 

  private readonly winningLines = [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
  ];

  constructor(app: PIXI.Application, reels: Reel[]) {
    this.app = app;
    this.reels = reels;
    this.uiContainer = new PIXI.Container();
    this.app.stage.addChild(this.uiContainer);

    this.balance = new Balance(this.uiContainer, this.app);
    this.bet = new Bet(this.uiContainer, this.app, this.balance);
    this.spinButton = new SpinButton(this.uiContainer, this.app, () =>
      this.onSpin()
    );
  }

  private getRandomWinningLine(): number[] {
    const winningLineIndex = Math.floor(
      Math.random() * this.winningLines.length
    );
    return this.winningLines[winningLineIndex];
  }

  public onSpin() {
    let completedReels = 0;
    this.spinCount++;
    this.spinButton.disable();
    this.balance.increaseBalance(-this.bet.getBet());
    const isWin = this.spinCount % 5 === 0;
    const winningSymbolIndex = isWin ? Math.floor(Math.random() * 9) : null;
    const winningLine = this.getRandomWinningLine();
    const winLengths = [3, 4, 5];
    const winningLength = winLengths[Math.floor(Math.random() * winLengths.length)];

    this.reels.forEach((reel, index) => {
      setTimeout(() => {
        if(isWin && winningLength > index){
          reel.spinReel(winningSymbolIndex, winningLine[index]).then(() => {
            completedReels++;
            if (completedReels === this.reels.length) {
              this.calculateWinnings(this.checkWinningLines());
              this.spinButton.enable();
            }
          });
        }else {
          reel.spinReel().then(() => {
            completedReels++;
  
            if (completedReels === this.reels.length) {
              this.calculateWinnings(this.checkWinningLines());
              this.spinButton.enable();
            }
          });
        }
        
      }, index * 500);
    });
  }

  public calculateWinnings(
    winningResults: { line: number[]; count: number }[]
  ) {
    for (const result of winningResults) {
      const winningSymbol = this.reels[0].getActiveSymbols()[result.line[0]];
      if ([1, 2, 3, 4, 5].includes(winningSymbol)) {
        if (result.count === 3) {
          this.balance.increaseBalance(this.bet.getBet() * 0.5);
        } else if (result.count === 4) {
          this.balance.increaseBalance(this.bet.getBet() * 1.5);
        } else {
          this.balance.increaseBalance(this.bet.getBet() * 4);
        }
      } else if ([6, 7].includes(winningSymbol)) {
        if (result.count === 3) {
          this.balance.increaseBalance(this.bet.getBet() * 1.5);
        } else if (result.count === 4) {
          this.balance.increaseBalance(this.bet.getBet() * 7);
        } else {
          this.balance.increaseBalance(this.bet.getBet() * 10);
        }
      } else if ([8, 9].includes(winningSymbol)) {
        if (result.count === 3) {
          this.balance.increaseBalance(this.bet.getBet() * 2);
        } else if (result.count === 4) {
          this.balance.increaseBalance(this.bet.getBet() * 10);
        } else {
          this.balance.increaseBalance(this.bet.getBet() * 20);
        }
      }
    }
  }

  public checkWinningLines(): { line: number[]; count: number }[] {
    let winningResults: { line: number[]; count: number }[] = [];

    for (const line of this.winningLines) {
      let firstSymbol = this.reels[0].getActiveSymbols()[line[0]];
      let consecutiveSymbols = 1;

      for (let reelIndex = 1; reelIndex < this.reels.length; reelIndex++) {
        const currentSymbol =
          this.reels[reelIndex].getActiveSymbols()[line[reelIndex]];

        if (currentSymbol === firstSymbol) {
          consecutiveSymbols++;
        } else {
          break;
        }
      }

      if (consecutiveSymbols >= 3) {
        winningResults.push({
          line: [...line],
          count: consecutiveSymbols,
        });

        for (let reelIndex = 0; reelIndex < this.reels.length; reelIndex++) {
          const reel = this.reels[reelIndex];
          const symbol = reel.getActiveSymbolAt(line[reelIndex]);

          const frame = PIXI.Sprite.from('main_game/frame.png');
          frame.width = symbol.width + 10;
          frame.height = symbol.height + 10;
          frame.x = symbol.x - 5;
          frame.y = symbol.y - 5;
          frame.name = 'frame';

          reel.container.addChild(frame);
        }
      }
    }
    return winningResults;
  }
}
