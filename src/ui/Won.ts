import * as PIXI from 'pixi.js';
import { Bet } from './Bet';

export class WonContainer {
  private wonAmount: PIXI.Text;

  private readonly PAYOUT_MULTIPLIERS: { [key: string]: { [key: number]: number } } = {
    "low_1": { 3: 0.5, 4: 1.5, 5: 4 },
    "low_2": { 3: 0.5, 4: 1.5, 5: 4 },
    "low_3": { 3: 0.5, 4: 1.5, 5: 4 },
    "high_1": { 3: 1.5, 4: 7, 5: 10 },
    "high_2": { 3: 1.5, 4: 7, 5: 10 },
    "high_3": { 3: 1.5, 4: 7, 5: 10 },
    "high_4": { 3: 2, 4: 10, 5: 20 },
    "high_5": { 3: 2, 4: 10, 5: 20 },
    "wild": { 5: 100 },
    "bonus": {},
  };

  constructor(uiContainer: PIXI.Container, app: PIXI.Application) {
    const wonBg = new PIXI.Sprite(PIXI.Texture.from('main_game/ui/b2.png'));
    wonBg.anchor.set(0.5);
    wonBg.position.set(app.screen.width / 2, app.screen.height - 122);
    wonBg.scale.set(0.5, 0.35);
    uiContainer.addChild(wonBg);

    this.wonAmount = new PIXI.Text('1000', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#FFD700',
      fontWeight: 'bold',
    });
    this.wonAmount.anchor.set(0.5);
    this.wonAmount.position.set(wonBg.x, wonBg.y);
    this.wonAmount.text = 0;
    uiContainer.addChild(this.wonAmount);
  }

  public showWin(amount: number) {
    this.wonAmount.text = amount.toString();
  }

  public calculateWinnings(
    winningResults: { line: number[]; count: number; winningSymbol: string | null }[], bet: Bet, previousWin: number = 0
  ) {
    let win = previousWin + 0;
    for (const result of winningResults) {
      if(!result.winningSymbol) continue;
      let i = 0;

      if (this.PAYOUT_MULTIPLIERS[result.winningSymbol] && this.PAYOUT_MULTIPLIERS[result.winningSymbol][result.count]) {
        const payout = this.PAYOUT_MULTIPLIERS[result.winningSymbol][result.count];
        win += bet.getBet() * payout;
      }
    }
    this.showWin(win);
    return win;
  }
}
