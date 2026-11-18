/**
 * 10개 스테이지 설정 데이터 (다중 무기 체계에 맞춘 리밸런싱 적용)
 */

export const STAGES = [
  {
    stage: 1,
    name: '도심 대로',
    bossTime: 35,
    enemyHp: 35,
    enemySpeed: 76,
    enemyDamage: 10,
    spawnInterval: 1200,
    bosses: [
      { name: '자이언트 브루트', hp: 450, speed: 52, radius: 26, color: 0xd946ef, damage: 20 }
    ]
  },
  {
    stage: 2,
    name: '폐허 공사장',
    bossTime: 38,
    enemyHp: 45,
    enemySpeed: 80,
    enemyDamage: 12,
    spawnInterval: 1100,
    bosses: [
      { name: '철거 로봇 1호', hp: 320, speed: 58, radius: 24, color: 0xf59e0b, damage: 22, offsetX: -100 },
      { name: '철거 로봇 2호', hp: 320, speed: 58, radius: 24, color: 0xf59e0b, damage: 22, offsetX: 100 }
    ]
  },
  {
    stage: 3,
    name: '지하철역 (3차 무기 해금 구간)',
    bossTime: 40,
    enemyHp: 55,
    enemySpeed: 84,
    enemyDamage: 13,
    spawnInterval: 1000,
    bosses: [
      { name: '지하 가디언 A', hp: 280, speed: 64, radius: 22, color: 0x38bdf8, damage: 20, offsetX: -120 },
      { name: '지하 가디언 B', hp: 280, speed: 64, radius: 22, color: 0x38bdf8, damage: 20, offsetX: 0 },
      { name: '지하 가디언 C', hp: 280, speed: 64, radius: 22, color: 0x38bdf8, damage: 20, offsetX: 120 }
    ]
  },
  {
    stage: 4,
    name: '도심 공원',
    bossTime: 42,
    enemyHp: 65,
    enemySpeed: 88,
    enemyDamage: 14,
    spawnInterval: 950,
    bosses: [
      { name: '알파 비스트', hp: 550, speed: 52, radius: 28, color: 0x10b981, damage: 26, offsetX: 0 },
      { name: '쾌속 하운드 1호', hp: 220, speed: 92, radius: 18, color: 0xef4444, damage: 16, offsetX: -90 },
      { name: '쾌속 하운드 2호', hp: 220, speed: 92, radius: 18, color: 0xef4444, damage: 16, offsetX: 90 }
    ]
  },
  {
    stage: 5,
    name: '비밀 연구소',
    bossTime: 44,
    enemyHp: 75,
    enemySpeed: 90,
    enemyDamage: 15,
    spawnInterval: 900,
    bosses: [
      { name: '돌연변이 바이러스체', hp: 500, speed: 55, radius: 28, color: 0xa855f7, damage: 24, splitOnDeath: true, offsetX: 0 }
    ]
  },
  {
    stage: 6,
    name: '산업 단지 (6차 무기 강화 구간)',
    bossTime: 46,
    enemyHp: 85,
    enemySpeed: 94,
    enemyDamage: 16,
    spawnInterval: 850,
    bosses: [
      { name: '중장갑 타이탄 1호', hp: 480, speed: 54, radius: 26, color: 0x64748b, damage: 28, offsetX: -80 },
      { name: '중장갑 타이탄 2호', hp: 480, speed: 54, radius: 26, color: 0x64748b, damage: 28, offsetX: 80 }
    ]
  },
  {
    stage: 7,
    name: '사막 외곽로',
    bossTime: 48,
    enemyHp: 95,
    enemySpeed: 96,
    enemyDamage: 17,
    spawnInterval: 800,
    bosses: [
      { name: '북방 습격자', hp: 300, speed: 68, radius: 22, color: 0xf97316, damage: 22, spawnPos: 'top' },
      { name: '남방 습격자', hp: 300, speed: 68, radius: 22, color: 0xf97316, damage: 22, spawnPos: 'bottom' },
      { name: '서방 습격자', hp: 300, speed: 68, radius: 22, color: 0xf97316, damage: 22, spawnPos: 'left' },
      { name: '동방 습격자', hp: 300, speed: 68, radius: 22, color: 0xf97316, damage: 22, spawnPos: 'right' }
    ]
  },
  {
    stage: 8,
    name: '항만 부두',
    bossTime: 50,
    enemyHp: 110,
    enemySpeed: 98,
    enemyDamage: 18,
    spawnInterval: 750,
    bosses: [
      { name: '프로스트 리바이어선 A', hp: 580, speed: 58, radius: 28, color: 0x06b6d4, damage: 28, offsetX: -90 },
      { name: '프로스트 리바이어선 B', hp: 580, speed: 58, radius: 28, color: 0x06b6d4, damage: 28, offsetX: 90 }
    ]
  },
  {
    stage: 9,
    name: '군사 기지 (9차 최종 무기 풀강 구간)',
    bossTime: 52,
    enemyHp: 125,
    enemySpeed: 100,
    enemyDamage: 20,
    spawnInterval: 700,
    bosses: [
      { name: '돌격 장갑대장', hp: 550, speed: 56, radius: 27, color: 0xef4444, damage: 30, offsetX: -110 },
      { name: '쾌속 정찰대장', hp: 320, speed: 94, radius: 20, color: 0x38bdf8, damage: 22, offsetX: -40 },
      { name: '강습 저격대장', hp: 320, speed: 94, radius: 20, color: 0x38bdf8, damage: 22, offsetX: 40 },
      { name: '중화기 특공대장', hp: 550, speed: 56, radius: 27, color: 0xef4444, damage: 30, offsetX: 110 }
    ]
  },
  {
    stage: 10,
    name: '오염 핵심구 (최종 결전)',
    bossTime: 55,
    enemyHp: 145,
    enemySpeed: 105,
    enemyDamage: 22,
    spawnInterval: 650,
    bosses: [
      { name: '오염의 군주 (FINAL BOSS)', hp: 1350, speed: 60, radius: 34, color: 0xd946ef, damage: 35, isFinal: true, offsetX: 0 },
      { name: '심연의 호위병 A', hp: 380, speed: 78, radius: 22, color: 0xef4444, damage: 24, offsetX: -110 },
      { name: '심연의 호위병 B', hp: 380, speed: 78, radius: 22, color: 0xef4444, damage: 24, offsetX: 110 }
    ]
  }
];

export function getStageConfig(stageNumber) {
  const index = Math.max(0, Math.min(stageNumber - 1, STAGES.length - 1));
  return STAGES[index];
}
