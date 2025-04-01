import * as PIXI from 'pixi.js';
import { SpinButton } from './SpinButton';
import { Bet } from './Bet';

export class Balance {
  private balanceText: PIXI.Text;
  private balanceAmount: number = 1000;

  constructor(uiContainer: PIXI.Container, app: PIXI.Application) {
    const balanceBg = new PIXI.Sprite(PIXI.Texture.from('main_game/ui/b2.png'));
    balanceBg.anchor.set(0.5);
    balanceBg.position.set(app.screen.width - 150, app.screen.height - 50);
    balanceBg.scale.set(0.5, 0.4);
    uiContainer.addChild(balanceBg);

    this.balanceText = new PIXI.Text('1000', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: '#FFD700',
      fontWeight: 'bold',
    });
    this.balanceText.anchor.set(0.5);
    this.balanceText.position.set(balanceBg.x, balanceBg.y);
    uiContainer.addChild(this.balanceText);
  }

  public updateBalance(amount: number) {
    this.balanceAmount = amount;
    this.balanceText.text = amount.toString();
  }

  public increaseBalance(amount: number) {
    this.balanceAmount += amount;
    this.balanceText.text = this.balanceAmount.toString();
  }

  public getBalance(): number {
    return this.balanceAmount;
  }
}
