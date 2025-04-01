import * as PIXI from 'pixi.js';
import { toASCII } from 'punycode';

export class BonusGameModal {
  private app: PIXI.Application;
  private modalContainer: PIXI.Container;
  private freeSpins: number;
  private totalWin: number;
  private won: boolean;

  constructor(app: PIXI.Application, isWin: boolean, freeSpins: number = 0, totalWin: number = 0) {
    this.app = app;
    this.modalContainer = new PIXI.Container();
    this.freeSpins = freeSpins;
    this.totalWin = totalWin;
    this.won = isWin;
    this.createModal();
  }

  private createModal() {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.endFill();
    this.modalContainer.addChild(bg);
    this.modalContainer.zIndex = 2;
    let message = `You won ${this.freeSpins} free spins!`
    if(this.won) {
      message = `Total win ${this.totalWin}!`
    }
    const text = new PIXI.Text(message, {
      fontFamily: 'Arial',
      fontSize: 40,
      fill: 0xffffff,
      align: 'center',
    });
    text.anchor.set(0.5);
    text.x = this.app.screen.width / 2;
    text.y = this.app.screen.height / 2;
    this.modalContainer.addChild(text);
  }

  public show() {
    this.app.stage.addChild(this.modalContainer);

    setTimeout(() => {
      this.hide();
    }, 3000);
  }

  private hide() {
    this.app.stage.removeChild(this.modalContainer);
  }
}
