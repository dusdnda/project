import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { SoundManager } from './audio/SoundManager.js';

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#1e1e24',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [TitleScene, GameScene, ResultScene]
};

let game = null;

export function startGame() {
  if (game) return game;
  game = new Phaser.Game(config);
  return game;
}

export function pauseGame() {
  if (game) {
    if (game.scene.isActive('GameScene')) {
      game.scene.pause('GameScene');
    }
    SoundManager.pauseAll();
  }
}

export function resumeGame() {
  if (game) {
    if (game.scene.isPaused('GameScene')) {
      game.scene.resume('GameScene');
    }
    SoundManager.resumeAll();
  }
}

// 원스토어 SDK 및 외부 제어용 글로벌 인터페이스
window.TangTangGuard = {
  start: startGame,
  pause: pauseGame,
  resume: resumeGame,
  getGame: () => game
};

// 게임 준비 완료 이벤트 전파
document.dispatchEvent(new CustomEvent('gameReady', { detail: window.TangTangGuard }));

// 네트워크 차단 또는 SDK 미호출 대비 안전한 자동 실행 폴백 (600ms)
setTimeout(() => {
  if (!game) {
    startGame();
  }
}, 600);
