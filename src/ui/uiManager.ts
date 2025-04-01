import * as PIXI from 'pixi.js';
import { Balance } from './Balance';
import { Bet } from './Bet';
import { SpinButton } from './SpinButton';
import { Reel } from '../components/Reel';
import { Symbol } from '../components/Symbol';
import { WonContainer } from './Won';
import { BonusGame } from '../components/BonusGame';
import { GameManager } from '../logic/GameManager';

export class UIManager {
  private app: PIXI.Application;
  private uiContainer: PIXI.Container;
  private gameManager: GameManager;
  private balance!: Balance;
  private bet!: Bet;
  private spinButton!: SpinButton;
  private wonContainer!: WonContainer;
  private bonusGame: BonusGame;
  private reels: Reel[];
  private spinCount = 0; 

  constructor(app: PIXI.Application, reels: Reel[], bonusGame: BonusGame, gameManager: GameManager) {
    this.app = app;
    this.reels = reels;
    this.bonusGame = bonusGame;
    this.gameManager = gameManager;
    this.uiContainer = new PIXI.Container();
    this.app.stage.addChild(this.uiContainer);

    this.balance = new Balance(this.uiContainer, this.app);
    this.spinButton = new SpinButton(this.uiContainer, this.app, () =>
      this.onSpin()
    );
    this.bet = new Bet(this.uiContainer, this.app, this.balance, this.spinButton);
    this.wonContainer = new WonContainer(this.uiContainer, this.app);
  }
  
  private onSpin() {
    this.wonContainer.showWin(0);
    let completedReels = 0;
    this.spinCount++;
    this.spinButton.disable();

    if(this.balance.getBalance() < this.bet.getBet()){
      return;
    }
    
    this.balance.increaseBalance(-this.bet.getBet());

    const isWin = this.spinCount % 5 === 0;
    const winningSymbolName = isWin ? Symbol.generateWinningSymbol() : null;
    const winningLine = this.gameManager.getRandomWinningLine();
    const winLengths = [3, 4, 5];
    const winningLength = winLengths[Math.floor(Math.random() * winLengths.length)];

    const onReelComplete = () => {
      completedReels++;
      if (completedReels === this.reels.length) {
        let win = this.wonContainer.calculateWinnings(this.gameManager.checkWinningLines(this.reels), this.bet);
        this.spinButton.enable();
        this.balance.increaseBalance(win);
        this.checkForBonusGame();
      }
    };

    this.reels.forEach((reel, index) => {
      setTimeout(() => {
        const shouldWin = isWin && winningLength > index;
        reel.spinReel(false, shouldWin ? winningSymbolName : undefined, shouldWin ? [winningLine[index]] : undefined)
        .then(onReelComplete);
      }, index * 200);
    });
  }

  private checkForBonusGame() {
    const bonusCount = this.reels.reduce((count, reel) => 
      count + reel.getActiveSymbols().filter(symbol => symbol === "bonus").length, 0
    );
  
    if (bonusCount >= 3) {
      const freeSpins = bonusCount === 3 ? 10 : bonusCount === 4 ? 15 : 20;
      this.bonusGame.initBonusGame(freeSpins, this.spinButton, this.wonContainer, this.reels, this.gameManager, this.bet, this.balance);
    }
  }

}
