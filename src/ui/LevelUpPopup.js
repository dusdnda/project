import { createSkillCard } from './UIHelper.js';

export class LevelUpPopup {
  constructor(scene, onSelectSkill) {
    this.scene = scene;
    this.onSelectSkill = onSelectSkill;
    this.container = null;
  }

  show(level, remainingChoices = 1, weaponState = null) {
    const { width, height } = this.scale || this.scene.scale;

    this.close();
    this.container = this.scene.add.container(0, 0).setDepth(100);

    // 반투명 어두운 배경 (뒤쪽 터치 차단)
    const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.78)
      .setInteractive();
    this.container.add(bg);

    const isWeaponTier = (level % 3 === 0);

    // 타이틀
    const titleText = isWeaponTier
      ? `🔥 WEAPON UNLOCK! (Lv.${level})`
      : `LEVEL UP! (Lv.${level})`;

    const titleColor = isWeaponTier ? '#f59e0b' : '#38bdf8';

    const title = this.scene.add.text(width / 2, height * 0.20, titleText, {
      fontFamily: 'sans-serif',
      fontSize: '26px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(title);

    const subText = isWeaponTier
      ? '✨ 강력한 신규 무기를 추가 장착하거나 강화하세요!'
      : (remainingChoices > 1 
          ? `강화할 능력을 선택하세요 (남은 선택: ${remainingChoices}회)` 
          : '강화할 능력을 선택하세요');

    const sub = this.scene.add.text(width / 2, height * 0.25, subText, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.container.add(sub);

    // 선택지 풀 구성
    let skillPool = [];

    if (isWeaponTier) {
      // 3의 배수 레벨: 신규 무기 장착 및 전용 무기 강화
      const gunLvl = (weaponState && weaponState.gunLevel) || 0;
      const crossLvl = (weaponState && weaponState.crossbowLevel) || 0;
      const laserLvl = (weaponState && weaponState.laserLevel) || 0;

      skillPool = [
        {
          id: 'gun',
          name: gunLvl === 0 ? '🔫 신규 무기: 권총/오토라이플' : `🔫 권총 강화 (Lv.${gunLvl + 1})`,
          desc: gunLvl === 0 ? '가장 가까운 적 자동 단일 조준 사격 (0.55초)' : '연사 속도 15% 및 탄환 공격력 대폭 증가'
        },
        {
          id: 'crossbow',
          name: crossLvl === 0 ? '🏹 신규 무기: 강습 석궁' : `🏹 강습 석궁 강화 (Lv.${crossLvl + 1})`,
          desc: crossLvl === 0 ? '적 무리를 꿰뚫는 강력한 다중 관통 화살 발사' : '관통 횟수 +1 및 볼트 위력 대폭 증가'
        },
        {
          id: 'laser',
          name: laserLvl === 0 ? '⚡ 신규 무기: 에너지 레이저' : `⚡ 에너지 레이저 강화 (Lv.${laserLvl + 1})`,
          desc: laserLvl === 0 ? '화면을 가로지르는 순간 관통 빔 일제 발사 (광역)' : '레이저 빔 굵기 확장 및 광역 공격력 증가'
        },
        {
          id: 'add_orb',
          name: '🪐 궤도 위성 무기 증설',
          desc: '플레이어 몸 주위를 회전하는 방어 공격 위성 +1기 추가'
        }
      ];
    } else {
      // 일반 레벨: 유틸리티 및 패시브
      skillPool = [
        { id: 'add_orb', name: '🪐 위성 무기 추가', desc: '몸 주위를 회전하는 무기 +1개 추가' },
        { id: 'speed_up', name: '⚡ 위성 회전 속도 증가', desc: '무기 공전 속도 25% 증가' },
        { id: 'damage_boost', name: '💥 전 무기 화력 강화', desc: '모든 장착 무기 공격력 +15% 증가' },
        { id: 'player_speed', name: '👟 이동 속도 증가', desc: '플레이어 이동 속도 20% 증가' },
        { id: 'heal', name: '💖 체력 회복', desc: '체력 +40 즉시 회복' }
      ];
    }

    // 무작위 3개 셔플
    const shuffled = Phaser.Utils.Array.Shuffle([...skillPool]).slice(0, 3);

    shuffled.forEach((skill, index) => {
      const cardY = height * 0.36 + index * 95;
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
