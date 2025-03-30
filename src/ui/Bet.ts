import * as PIXI from 'pixi.js';
import { Balance } from './Balance';

export class Bet {
  private betText: PIXI.Text;
  private balance: Balance;
  private bet: number = 10;

  constructor(
    uiContainer: PIXI.Container,
    app: PIXI.Application,
    balance: Balance
  ) {
    this.balance = balance;

    const betBg = new PIXI.Sprite(PIXI.Texture.from('main_game/ui/b2.png'));
    betBg.anchor.set(0.5);
    betBg.position.set(150, app.screen.height - 50);
    betBg.scale.set(0.3, 0.4);
    uiContainer.addChild(betBg);

    this.betText = new PIXI.Text(this.bet, {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: '#FFD700',
      fontWeight: 'bold',
    });
    this.betText.anchor.set(0.5);
    this.betText.position.set(betBg.x, betBg.y);
    uiContainer.addChild(this.betText);

    this.addArrows(uiContainer, app);
  }

  private addArrows(uiContainer: PIXI.Container, app: PIXI.Application) {
    const leftArrow = new PIXI.Sprite(
      PIXI.Texture.from('main_game/ui/minus.png')
    );
    leftArrow.anchor.set(0.5);
    leftArrow.scale.set(0.3);
    leftArrow.position.set(100, app.screen.height - 50);
    leftArrow.interactive = true;
    leftArrow.cursor = 'pointer';
    leftArrow.on('pointerdown', () => this.changeBet(-10));
    uiContainer.addChild(leftArrow);

    const rightArrow = new PIXI.Sprite(
      PIXI.Texture.from('main_game/ui/plus.png')
    );
    rightArrow.anchor.set(0.5);
    rightArrow.scale.set(0.3);
    rightArrow.position.set(200, app.screen.height - 50);
    rightArrow.interactive = true;
    rightArrow.cursor = 'pointer';
    rightArrow.on('pointerdown', () => this.changeBet(10));
    uiContainer.addChild(rightArrow);
  }

  private changeBet(amount: number) {
    const maxBet = this.balance.getBalance();
    this.bet = Math.max(10, this.bet + amount);
    this.bet = Math.min(this.bet, maxBet);
    this.betText.text = this.bet.toString();
  }

  public getBet(){
    return this.bet;
  }
}
