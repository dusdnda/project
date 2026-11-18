import { createSkillCard } from './UIHelper.js';

export class LevelUpPopup {
  constructor(scene, onSelectSkill) {
    this.scene = scene;
    this.onSelectSkill = onSelectSkill;
    this.container = null;
  }

  show(level, remainingChoices = 1) {
    const { width, height } = this.scale || this.scene.scale;

    this.close();
    this.container = this.scene.add.container(0, 0).setDepth(100);

    // 반투명 어두운 배경
    const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.78)
      .setInteractive(); // 뒤쪽 터치 차단
    this.container.add(bg);

    // 타이틀
    const title = this.scene.add.text(width / 2, height * 0.22, `LEVEL UP! (Lv.${level})`, {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(title);

    const subText = remainingChoices > 1 
      ? `강화할 능력을 선택하세요 (남은 선택: ${remainingChoices}회)` 
      : '강화할 능력을 선택하세요';

    const sub = this.scene.add.text(width / 2, height * 0.27, subText, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.container.add(sub);

    // 선택지 풀
    const skillPool = [
      { id: 'add_orb', name: '위성 무기 추가', desc: '몸 주위를 회전하는 무기 +1개 추가' },
      { id: 'speed_up', name: '회전 속도 증가', desc: '무기 공전 속도 25% 증가' },
      { id: 'player_speed', name: '이동 속도 증가', desc: '플레이어 이동 속도 20% 증가' },
      { id: 'heal', name: '체력 회복', desc: '체력 +40 즉시 회복' }
    ];

    // 무작위 3개 셔플 선택
    const shuffled = Phaser.Utils.Array.Shuffle([...skillPool]).slice(0, 3);

    shuffled.forEach((skill, index) => {
      const cardY = height * 0.38 + index * 95;
      const card = createSkillCard(this.scene, width / 2, cardY, 360, 80, skill.name, skill.desc, () => {
        this.close();
        if (this.onSelectSkill) {
          this.onSelectSkill(skill.id);
        }
      });
      this.container.add(card);
    });
  }

  close() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
