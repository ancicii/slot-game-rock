import * as PIXI from 'pixi.js';
import { Reel } from './Reel';
import { UIManager } from '../ui/uiManager';
import { BonusGame } from './BonusGame';
import { GameManager } from '../logic/GameManager';

declare global {
  interface GlobalThis {
    __PIXI_APP__: PIXI.Application;
  }
}

export class Game {
  public app: PIXI.Application | null = null;
  private reels: Reel[] = [];
  private reelsContainer: PIXI.Container = new PIXI.Container();
  private uiManager!: UIManager;
  private bonusGame!: BonusGame;
  private gameManager!: GameManager;
  private background: PIXI.Sprite | null = null;

  constructor() {
    this.initializeApp();
  }

  private async initializeApp() {
    this.app = new PIXI.Application({
      width: 1280,
      height: 720,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    await this.app.init();
    (globalThis as any).__PIXI_APP__ = this.app;
    document
      .getElementById('game-container')
      ?.appendChild(this.app.canvas);

    this.setupResizeListener();
    this.loadAssets().then(() => {
      this.init();
    });
  }

  private loadAssets(): Promise<void> {
    const assetsFolder = 'main_game';
    return new Promise((resolve) => {
      PIXI.Assets.load([
        `${assetsFolder}/low_1.png`,
        `${assetsFolder}/low_1_win.png`,
        `${assetsFolder}/low_2.png`,
        `${assetsFolder}/low_2_win.png`,
        `${assetsFolder}/low_3.png`,
        `${assetsFolder}/low_3_win.png`,
        `${assetsFolder}/high_1.png`,
        `${assetsFolder}/high_1_win.png`,
        `${assetsFolder}/high_2.png`,
        `${assetsFolder}/high_2_win.png`,
        `${assetsFolder}/high_3.png`,
        `${assetsFolder}/high_3_win.png`,
        `${assetsFolder}/high_4.png`,
        `${assetsFolder}/high_4_win.png`,
        `${assetsFolder}/high_5.png`,
        `${assetsFolder}/high_5_win.png`,
        `${assetsFolder}/wild.png`,
        `${assetsFolder}/wild_win.png`,
        `${assetsFolder}/wild_sticky.png`,
        `${assetsFolder}/wild_sticky_win.png`,
        `${assetsFolder}/bonus.png`,
        `${assetsFolder}/bonus_win.png`,
        `${assetsFolder}/bg_main_landscape.jpg`,
        `${assetsFolder}/bg_bonus_landscape.jpg`,
        `${assetsFolder}/frame.png`,
        `${assetsFolder}/ui/spin.png`,
        `${assetsFolder}/ui/spin_selected.png`,
        `${assetsFolder}/ui/minus.png`,
        `${assetsFolder}/ui/plus.png`,
        `${assetsFolder}/ui/b2.png`,
      ]).then(() => {
        resolve();
      });
    });
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      if (!this.app) return;
      const scale = Math.min(
        window.innerWidth / 1280,
        window.innerHeight / 720
      );
      const canvas = this.app.view as HTMLCanvasElement;
      canvas.style.width = `${1280 * scale}px`;
      canvas.style.height = `${720 * scale}px`;
      this.positionReels();
    });
    window.dispatchEvent(new Event('resize'));
  }

  private addBackground() {
    if (!this.app) return;

    if (this.background) {
      this.app.stage.removeChild(this.background);
    }

    this.background = new PIXI.Sprite(PIXI.Texture.from('main_game/bg_main_landscape.jpg'));
    this.background.width = this.app.screen.width;
    this.background.height = this.app.screen.height;
    this.app.stage.addChildAt(this.background, 0);
  }

  private createReels() {
    if (!this.app) return;
    this.reelsContainer.removeChildren();

    const frame = PIXI.Sprite.from('main_game/frame.png');

    this.app.stage.addChild(frame);
    this.app.stage.addChild(this.reelsContainer);

    for (let i = 0; i < 5; i++) {
      const reel = new Reel(i * 90 + i * 10, 0);
      reel.container.width = 90;
      this.reels.push(reel);
      this.reelsContainer.addChild(reel.container);
    }
    this.positionReels();

    frame.width = this.reelsContainer.width + 150;
    frame.height = this.reelsContainer.height + 140;
    frame.x = this.reelsContainer.x - 75;
    frame.y = this.reelsContainer.y - 93;
    frame.zIndex = 1;
  }

  private positionReels() {
    if (!this.app) return;
    this.reelsContainer.x = 150;
    this.reelsContainer.y = 85;
  }

  private init() {
    this.addBackground();
    this.createReels();
    if (this.app) {
      this.gameManager = new GameManager();
      this.bonusGame = new BonusGame(this.app, this.background);
      this.uiManager = new UIManager(this.app, this.reels, this.bonusGame, this.gameManager);
    }
  }

}