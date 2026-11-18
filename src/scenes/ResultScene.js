import { createButton } from '../ui/UIHelper.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data) {
    this.result = data.result || 'lose'; // 'win' or 'lose'
    this.survivalTime = data.survivalTime || '00:00';
    this.kills = data.kills !== undefined ? data.kills : 0;
  }

  create() {
    const { width, height } = this.scale;
    const isWin = this.result === 'win';

    // 1. 결과 제목
    this.add.text(width / 2, height * 0.26, isWin ? '생존 성공! (클리어)' : '게임 오버', {
      fontFamily: 'sans-serif',
      fontSize: '34px',
      color: isWin ? '#22c55e' : '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 2. 결과 기록 박스
    const box = this.add.rectangle(width / 2, height * 0.42, 280, 110, 0x1f2937, 0.8)
      .setStrokeStyle(1, 0x374151);

    this.add.text(width / 2, height * 0.38, `⏱️ 생존 시간: ${this.survivalTime}`, {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.45, `⚔️ 처치한 적: ${this.kills} 마리`, {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#60a5fa'
    }).setOrigin(0.5);

    // 3. '다시 하기' 버튼 (공용 주 버튼)
    createButton(this, width / 2, height * 0.58, '다시 하기', () => {
      this.scene.start('GameScene');
    }, { width: 220, height: 50, type: 'primary' });

    // 4. '시작 화면으로' 버튼 (공용 보조 버튼)
    createButton(this, width / 2, height * 0.68, '시작 화면으로', () => {
      this.scene.start('TitleScene');
    }, { width: 220, height: 48, type: 'secondary', fontSize: '17px' });
  }
}
