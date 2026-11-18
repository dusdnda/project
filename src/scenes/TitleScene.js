import { createButton } from '../ui/UIHelper.js';

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
  }

  create() {
    const { width, height } = this.scale;

    // 배경 이미지 (타이틀 텍스트 가독성을 위해 살짝 반투명하게 배치)
    if (this.textures.exists('background') && this.textures.get('background').key !== '__MISSING') {
      this.add.image(width / 2, height / 2, 'background')
        .setDisplaySize(width, height)
        .setAlpha(0.35);
    }

    // 제목
    this.add.text(width / 2, height * 0.3, '탕탕 수호대', {
      fontFamily: 'sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 설명 문구
    this.add.text(width / 2, height * 0.42, '몰려오는 적을 무찌르고 살아남으세요!\n조작: 방향키 / WASD / 드래그 이동\n공격: 자동 궤도 회전 공격', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    // 게임 시작 버튼 (design.md 공용 주 버튼 함수)
    createButton(this, width / 2, height * 0.6, '게임 시작', () => {
      this.scene.start('GameScene');
    }, { width: 220, height: 50, type: 'primary' });
  }
}
