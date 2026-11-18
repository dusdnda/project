import { createButton } from '../ui/UIHelper.js';
import { SoundManager } from '../audio/SoundManager.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    if (!this.textures.exists('player')) {
      this.load.image('player', 'assets/images/player.png');
    }
    if (!this.textures.exists('background')) {
      this.load.image('background', 'assets/images/background.png');
    }
    SoundManager.preload(this);
  }

  create() {
    const { width, height } = this.scale;

    // 사운드 시스템 및 첫 클릭 시 BGM 시작 준비, 소리 토글 버튼
    SoundManager.initUserInteraction(this);
    SoundManager.createSoundToggle(this, width - 25, 30);

    // 배경 이미지
    if (this.textures.exists('background') && this.textures.get('background').key !== '__MISSING') {
      this.add.image(width / 2, height / 2, 'background')
        .setDisplaySize(width, height)
        .setAlpha(0.35);
    }

    // 제목
    this.add.text(width / 2, height * 0.28, '탕탕 수호대', {
      fontFamily: 'sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 설명 문구
    this.add.text(width / 2, height * 0.40, '10개의 전장을 돌파하고 구역을 수호하세요!\n조작: 방향키 / WASD / 드래그 이동\n공격: 자동 궤도 회전 공격', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    // 게임 시작 버튼
    createButton(this, width / 2, height * 0.58, '1스테이지 출격', () => {
      SoundManager.playBGM(this);
      this.scene.start('GameScene', { stage: 1 });
    }, { width: 220, height: 50, type: 'primary' });
  }
}
