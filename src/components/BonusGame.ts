import * as PIXI from 'pixi.js';
import { BonusGameModal } from '../ui/BonusGameModal';
import { SpinButton } from '../ui/SpinButton';
import { WonContainer } from '../ui/Won';
import { Symbol } from './Symbol';
import { UIManager } from '../ui/uiManager';
import { Reel } from './Reel';
import { GameManager } from '../logic/GameManager';
import { Bet } from '../ui/Bet';
import { Balance } from '../ui/Balance';

export class BonusGame {
  private app: PIXI.Application;
  private totalFreeSpins = 0;
  private freeSpinsCounter = 0;
  private totalBonusWinnings = 0;
  private spinButton!: SpinButton;
  private wonContainer!: WonContainer;
  private gameManager!: GameManager;
  private background: PIXI.Sprite | null = null;
  private wonBg!: PIXI.Sprite;
  private counterBg!: PIXI.Sprite;
  private currentSpingWinningsText!: PIXI.Text;
  private freeSpinsLeftText!: PIXI.Text;
  private lockedWilds: PIXI.Sprite[] = [];
  private reels!: Reel[];
  private bet!: Bet;
  private balance!: Balance;
  private isPaused: boolean = false;
  private stickyWilds: Map<number, Set<number>> = new Map<number, Set<number>>();


  private readonly SYMBOL_HEIGHT = 112.5;

  constructor(app: PIXI.Application, background: PIXI.Sprite | null) {
    this.app = app;
    this.background = background;
  }

  public initBonusGame(freeSpins: number, spinButton: SpinButton, wonContainer: WonContainer, reels: Reel[], gameManager: GameManager, bet: Bet, balance: Balance) {
    this.totalFreeSpins = freeSpins;
    this.freeSpinsCounter = 0;
    this.totalBonusWinnings = 0;
    this.spinButton = spinButton;
    this.wonContainer = wonContainer;
    this.reels = reels;
    this.gameManager = gameManager;
    this.bet = bet;
    this.balance = balance;
    this.spinButton.disable();
    this.showBonusGameModal(freeSpins);
  }

  public showBonusGameModal(freeSpins: number) {
    if (!this.app) return;

    const modal = new BonusGameModal(this.app, false, freeSpins);
    modal.show();

    setTimeout(() => {
      if (this.background) {
        this.background.texture = PIXI.Texture.from('main_game/bg_bonus_landscape.jpg');
      }
  
      this.addWonContainer();
      this.addFreeSpinsCounter();
      this.startBonusGame();
    }, 3000);
  }

  private checkForAdditionalSpins(){
    const bonusCount = this.reels.reduce((count, reel) => 
      count + reel.getActiveSymbols().filter(symbol => symbol === "bonus").length, 0
    );

    if (bonusCount >= 3) {
      const freeSpins = bonusCount === 3 ? 10 : bonusCount === 4 ? 15 : 20;
      this.totalFreeSpins += freeSpins;
      const modal = new BonusGameModal(this.app, false, freeSpins);
      modal.show();
      this.isPaused = true;
  
      setTimeout(() => {
        this.freeSpinsLeftText.text = `${this.freeSpinsCounter} / ${this.totalFreeSpins}`;
        this.isPaused = false;
        this.startBonusGame();
      }, 3000);
    }
  }

  private startBonusGame() {
    if (!this.spinButton) return;
    
    const spin = () => {
      if (this.isPaused) {
        return;
      }

      if (this.freeSpinsCounter >= this.totalFreeSpins) {
        this.endBonusGame();
        return;
      }
  
      this.spinButton.disable();
      this.currentSpingWinningsText.text = 0;
      
      let completedReels = 0;
      const onReelComplete = () => {
        completedReels++;
        if (completedReels === this.reels.length) {
          const winAmount = this.wonContainer.calculateWinnings(this.gameManager.checkWinningLines(this.reels), this.bet, this.totalBonusWinnings);
          this.currentSpingWinningsText.text = winAmount - this.totalBonusWinnings;
          this.totalBonusWinnings = winAmount;
          
          this.freeSpinsCounter++;
          this.freeSpinsLeftText.text = `${this.freeSpinsCounter} / ${this.totalFreeSpins}`;
          this.checkForAdditionalSpins();
          setTimeout(spin, 1000);
        }
      };
  
      this.reels.forEach((reel, index) => {
        setTimeout(() => {
          let wildPositions: number[] = [];
          if (this.stickyWilds.has(index)) {
            wildPositions = Array.from(this.stickyWilds.get(index)!);
          }
          const spinReelPromise = wildPositions.length > 0
            ? reel.spinReel(true, "wild", wildPositions)
            : reel.spinReel(true);


          spinReelPromise.then(() => {
            reel.getActiveSymbols().forEach((symbol, pos) => {
              if (symbol === "wild_sticky") {
                if (!this.stickyWilds.has(index)) {
                  this.stickyWilds.set(index, new Set());
                }
                this.stickyWilds.get(index)!.add(pos);
                this.lockWildSymbol(reel, index, pos);
              }
            });

            onReelComplete();
          });
        }, index * 150);
      });
  
    };
  
    spin();
  }

  private lockWildSymbol(reel: Reel, reelIndex: number, pos: number) {
    const wildSymbol = new Symbol(reelIndex * 90, true, false, "wild_sticky");
    
    wildSymbol.sprite.x = reel.container.parent.x + reel.container.x;
    wildSymbol.sprite.y = reel.container.parent.y + pos * this.SYMBOL_HEIGHT;
    wildSymbol.sprite.width = 90;

    this.app.stage.addChild(wildSymbol.sprite);
    this.lockedWilds.push(wildSymbol.sprite);
  }

  private endBonusGame() {
    const modal = new BonusGameModal(this.app, true, 0, this.totalBonusWinnings);
    modal.show();

    this.balance.increaseBalance(this.totalBonusWinnings);

    this.freeSpinsCounter = 0;
    this.totalBonusWinnings = 0;
    this.wonContainer.showWin(0);
    setTimeout(() => {
      if (this.wonBg) this.app.stage.removeChild(this.wonBg);
      if (this.currentSpingWinningsText) this.app.stage.removeChild(this.currentSpingWinningsText);
  
      if (this.counterBg) this.app.stage.removeChild(this.counterBg);
      if (this.freeSpinsLeftText) this.app.stage.removeChild(this.freeSpinsLeftText);
  
      if (this.background) {
        this.background.texture = PIXI.Texture.from('main_game/bg_main_landscape.jpg');
      }

      this.lockedWilds.forEach((wild) => {
          this.app.stage.removeChild(wild);
      });
      this.lockedWilds = [];

      this.spinButton.enable();
    }, 3000);
  }

  private addWonContainer() {
    this.wonBg = new PIXI.Sprite(PIXI.Texture.from('main_game/ui/b2.png'));
    this.wonBg.anchor.set(0.5);
    this.wonBg.position.set(this.app.screen.width / 2, this.app.screen.height - 175);
    this.wonBg.scale.set(0.25, 0.3);
    this.wonBg.zIndex = 1;
    this.app.stage.addChild(this.wonBg);

    this.currentSpingWinningsText = new PIXI.Text('1000', {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#FFD700',
      fontWeight: 'bold',
    });
    this.currentSpingWinningsText.anchor.set(0.5);
    this.currentSpingWinningsText.position.set(this.wonBg.x, this.wonBg.y);
    this.currentSpingWinningsText.text = 0;
    this.currentSpingWinningsText.zIndex = 1;
    this.app.stage.addChild(this.currentSpingWinningsText);
  }

  private addFreeSpinsCounter() {
    this.counterBg = new PIXI.Sprite(PIXI.Texture.from('main_game/ui/b2.png'));
    this.counterBg.anchor.set(0.5);
    this.counterBg.position.set(this.app.screen.width / 2, 55);
    this.counterBg.scale.set(0.4, 0.4);
    this.counterBg.zIndex = 1;
    this.app.stage.addChild(this.counterBg);

    this.freeSpinsLeftText = new PIXI.Text('1000', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#FFD700',
      fontWeight: 'bold',
    });
    this.freeSpinsLeftText.anchor.set(0.5);
    this.freeSpinsLeftText.position.set(this.counterBg.x, this.counterBg.y);
    this.freeSpinsLeftText.text = `${this.freeSpinsCounter} / ${this.totalFreeSpins}`;
    this.freeSpinsLeftText.zIndex = 1;
    this.app.stage.addChild(this.freeSpinsLeftText);
  }

}
