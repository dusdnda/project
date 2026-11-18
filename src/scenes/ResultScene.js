import { createButton } from '../ui/UIHelper.js';
import { SoundManager } from '../audio/SoundManager.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data) {
    this.result = data.result || 'lose'; // 'win' or 'lose'
    this.stage = data.stage || 1;
    this.stageName = data.stageName || '도심 대로';
    this.isFinalStage = data.isFinalStage || false;
    this.survivalTime = data.survivalTime || '00:00';
    this.kills = data.kills !== undefined ? data.kills : 0;
    this.playerState = data.playerState || null;
  }

  create() {
    const { width, height } = this.scale;
    const isWin = this.result === 'win';

    SoundManager.createSoundToggle(this, width - 25, 30);

    // 1. 결과 타이틀
    let titleText = `STAGE ${this.stage} 작전 실패`;
    let titleColor = '#ef4444';

    if (isWin) {
      if (this.isFinalStage) {
        titleText = '🏆 전 구역 완전 수호! (ALL CLEAR)';
        titleColor = '#f59e0b';
      } else {
        titleText = `🎉 STAGE ${this.stage} 클리어!`;
        titleColor = '#22c55e';
      }
    }

    this.add.text(width / 2, height * 0.22, titleText, {
      fontFamily: 'sans-serif',
      fontSize: this.isFinalStage ? '23px' : '28px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 2. 결과 상세 기록 카드 패널
    this.add.rectangle(width / 2, height * 0.40, 320, 150, 0x1f252e, 0.95)
      .setStrokeStyle(2, 0x15191f);

    this.add.text(width / 2, height * 0.33, `📍 전장: ${this.stage}구역 - ${this.stageName}`, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.38, `⏱️ 생존 시간: ${this.survivalTime}`, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.43, `⚔️ 처치한 적: ${this.kills} 마리`, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#cbd5e1'
    }).setOrigin(0.5);

    const levelStr = this.playerState ? `Lv.${this.playerState.level}` : 'Lv.1';
    const weaponsStr = (this.playerState && this.playerState.weaponsSummary)
      ? this.playerState.weaponsSummary
      : '위성 1기';
    this.add.text(width / 2, height * 0.48, `⭐ 무기: ${weaponsStr} (${levelStr})`, {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#f59e0b',
      align: 'center'
    }).setOrigin(0.5);

    // 3. 상황별 버튼 분기
    if (isWin && !this.isFinalStage) {
      // 다음 스테이지 출격 (장비/레벨 계승, 체력 50% 회복 보너스)
      createButton(this, width / 2, height * 0.58, `다음 스테이지 (${this.stage + 1}) 출격`, () => {
        this.scene.start('GameScene', {
          stage: this.stage + 1,
          playerState: this.playerState,
          totalKills: this.kills
        });
      }, { width: 250, height: 50, type: 'primary' });

      // 시작 화면으로
      createButton(this, width / 2, height * 0.68, '시작 화면으로', () => {
        this.scene.start('TitleScene');
      }, { width: 250, height: 46, type: 'secondary', fontSize: '16px' });

    } else if (isWin && this.isFinalStage) {
      // 10스테이지 올클리어!
      createButton(this, width / 2, height * 0.58, '처음부터 다시 도전', () => {
        this.scene.start('GameScene', { stage: 1 });
      }, { width: 250, height: 50, type: 'primary' });

      createButton(this, width / 2, height * 0.68, '시작 화면으로', () => {
        this.scene.start('TitleScene');
      }, { width: 250, height: 46, type: 'secondary', fontSize: '16px' });

    } else {
      // 패배 시: 현재 스테이지 재도전 vs 처음부터 vs 로비
      createButton(this, width / 2, height * 0.56, `현재 스테이지(${this.stage}) 재도전`, () => {
        this.scene.start('GameScene', { stage: this.stage });
      }, { width: 250, height: 48, type: 'primary' });

      createButton(this, width / 2, height * 0.64, '1스테이지부터 다시하기', () => {
        this.scene.start('GameScene', { stage: 1 });
      }, { width: 250, height: 46, type: 'secondary', fontSize: '15px' });

      createButton(this, width / 2, height * 0.72, '시작 화면으로', () => {
        this.scene.start('TitleScene');
      }, { width: 250, height: 44, type: 'secondary', fontSize: '15px' });
    }
  }
}
