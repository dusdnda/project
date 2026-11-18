/**
 * UI 공용 컴포넌트 헬퍼 (design.md 규격 준수)
 * - 버튼: 둥근 모서리(10px), 2px 어두운 테두리(#15191f), 눌림 피드백, 주/보조 색상 구분
 * - 팝업: 반투명 오버레이 및 둥근 카드 패널
 */

import { SoundManager } from '../audio/SoundManager.js';

export function createButton(scene, x, y, text, onClick, options = {}) {
  const width = options.width || 220;
  const height = options.height || 50;
  const isPrimary = options.type !== 'secondary';

  // 주 버튼: 녹색(#22c55e) 또는 지정색, 보조 버튼: 어두운 슬레이트(#334155)
  const defaultFill = isPrimary ? (options.color || 0x22c55e) : 0x334155;
  const hoverFill = isPrimary ? (options.hoverColor || 0x16a34a) : 0x475569;
  const strokeColor = 0x15191f;
  const textColor = options.textColor || '#ffffff';
  const fontSize = options.fontSize || '18px';

  const container = scene.add.container(x, y);

  const bg = scene.add.graphics();
  const drawBg = (fill, stroke) => {
    bg.clear();
    bg.fillStyle(fill, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.lineStyle(2, stroke, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
  };
  drawBg(defaultFill, strokeColor);

  const label = scene.add.text(0, 0, text, {
    fontFamily: 'sans-serif',
    fontSize: fontSize,
    color: textColor,
    fontStyle: 'bold'
  }).setOrigin(0.5);

  container.add([bg, label]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });

  container.on('pointerover', () => {
    drawBg(hoverFill, 0x38bdf8); // 호버 시 테두리 하늘색 강조
  });

  container.on('pointerout', () => {
    drawBg(defaultFill, strokeColor);
    container.y = y;
  });

  container.on('pointerdown', () => {
    container.y = y + 2; // 눌림(Press) 효과
  });

  container.on('pointerup', () => {
    container.y = y;
    SoundManager.playClick(scene);
    if (onClick) {
      onClick();
    }
  });

  return container;
}

export function createSkillCard(scene, x, y, width, height, title, desc, onClick) {
  const container = scene.add.container(x, y);

  const bg = scene.add.graphics();
  const drawBg = (fill, stroke) => {
    bg.clear();
    bg.fillStyle(fill, 0.95);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.lineStyle(2, stroke, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
  };
  drawBg(0x1f252e, 0x38bdf8);

  const titleText = scene.add.text(0, -14, title, {
    fontFamily: 'sans-serif',
    fontSize: '18px',
    color: '#38bdf8',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  const descText = scene.add.text(0, 14, desc, {
    fontFamily: 'sans-serif',
    fontSize: '13px',
    color: '#cbd5e1'
  }).setOrigin(0.5);

  container.add([bg, titleText, descText]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });

  container.on('pointerover', () => {
    drawBg(0x2d3748, 0x22c55e);
    titleText.setColor('#22c55e');
  });

  container.on('pointerout', () => {
    drawBg(0x1f252e, 0x38bdf8);
    titleText.setColor('#38bdf8');
    container.y = y;
  });

  container.on('pointerdown', () => {
    container.y = y + 2;
  });

  container.on('pointerup', () => {
    container.y = y;
    SoundManager.playSkill(scene);
    if (onClick) {
      onClick();
    }
  });

  return container;
}
