import { OrbitWeapon } from './OrbitWeapon.js';
import { SoundManager } from '../audio/SoundManager.js';

export class WeaponManager {
  constructor(scene, player, enemyManager) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;

    // 1. 기본 회전 궤도 위성 무기
    this.orbitWeapon = new OrbitWeapon(scene, player);

    // 2. 추가 무기 스펙
    this.gun = { level: 0, timer: 0, interval: 550, baseDamage: 25 };
    this.crossbow = { level: 0, timer: 0, interval: 1100, baseDamage: 40 };
    this.laser = { level: 0, timer: 0, interval: 1700, baseDamage: 38 };

    this.damageMultiplier = 1.0;

    // 투사체 그룹 생성
    this.bullets = scene.physics.add.group();
    this.bolts = scene.physics.add.group();

    // 레이저 그래픽스
    this.laserGraphics = scene.add.graphics().setDepth(5);

    // 충돌 등록
    this.setupCollisions();
  }

  setupCollisions() {
    // 1. 총알 <-> 적 충돌
    this.scene.physics.add.overlap(
      this.bullets,
      this.enemyManager.group,
      (bulletSprite, enemySprite) => {
        if (!bulletSprite.active || !enemySprite.active) return;
        const damage = Math.round(bulletSprite.damageValue * this.damageMultiplier);
        this.enemyManager.damageEnemy(enemySprite, damage);
        bulletSprite.destroy();
      }
    );

    // 2. 석궁 화살 (관통) <-> 적 충돌
    this.scene.physics.add.overlap(
      this.bolts,
      this.enemyManager.group,
      (boltSprite, enemySprite) => {
        if (!boltSprite.active || !enemySprite.active) return;
        if (boltSprite.hitEnemies && boltSprite.hitEnemies.has(enemySprite)) return;

        boltSprite.hitEnemies.add(enemySprite);
        const damage = Math.round(boltSprite.damageValue * this.damageMultiplier);
        this.enemyManager.damageEnemy(enemySprite, damage);

        boltSprite.pierceLeft -= 1;
        if (boltSprite.pierceLeft <= 0) {
          boltSprite.destroy();
        }
      }
    );

    // 3. 궤도 무기 <-> 적 충돌
    this.scene.physics.add.overlap(
      this.orbitWeapon.group,
      this.enemyManager.group,
      (orb, enemySprite) => {
        if (!this.scene.isPaused && !this.scene.isGameOver) {
          const damage = Math.round(this.orbitWeapon.damage * this.damageMultiplier);
          this.enemyManager.damageEnemy(enemySprite, damage);
        }
      }
    );
  }

  // 가장 가까운 적 탐색
  getNearestEnemy(maxRange = 450) {
    const enemies = this.enemyManager.enemies;
    if (!enemies || enemies.length === 0) return null;

    let nearest = null;
    let minDist = maxRange;
    const px = this.player.x;
    const py = this.player.y;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.sprite || !e.sprite.active) continue;

      const dist = Math.hypot(e.x - px, e.y - py);
      if (dist < minDist) {
        minDist = dist;
        nearest = e;
      }
    }
    return nearest;
  }

  // 1. 총 자동 발사 (가장 가까운 적에게 빠른 탄환)
  fireGun() {
    const target = this.getNearestEnemy(400);
    if (!target) return;

    const px = this.player.x;
    const py = this.player.y;
    const dx = target.x - px;
    const dy = target.y - py;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    const bullet = this.scene.add.circle(px, py, 4, 0xf59e0b);
    this.scene.physics.add.existing(bullet);
    bullet.body.setCircle(4);
    bullet.damageValue = this.gun.baseDamage + (this.gun.level - 1) * 8;

    const speed = 520;
    bullet.body.setVelocity((dx / dist) * speed, (dy / dist) * speed);

    this.bullets.add(bullet);

    // 1.2초 후 자동 소멸 (화면 밖 이탈 대비)
    this.scene.time.delayedCall(1200, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  // 2. 석궁 발사 (적 무리를 꿰뚫는 강력한 관통 볼트)
  fireCrossbow() {
    const target = this.getNearestEnemy(450);
    if (!target) return;

    const px = this.player.x;
    const py = this.player.y;
    const dx = target.x - px;
    const dy = target.y - py;
    const angle = Math.atan2(dy, dx);
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    const bolt = this.scene.add.rectangle(px, py, 18, 5, 0x22c55e);
    bolt.setRotation(angle);
    this.scene.physics.add.existing(bolt);
    bolt.damageValue = this.crossbow.baseDamage + (this.crossbow.level - 1) * 12;
    bolt.pierceLeft = 2 + this.crossbow.level; // 관통 횟수
    bolt.hitEnemies = new Set();

    const speed = 580;
    bolt.body.setVelocity((dx / dist) * speed, (dy / dist) * speed);

    this.bolts.add(bolt);

    this.scene.time.delayedCall(1200, () => {
      if (bolt && bolt.active) bolt.destroy();
    });
  }

  // 3. 레이저 발사 (화면을 가로지르는 순간 관통 빔)
  fireLaser() {
    const target = this.getNearestEnemy(450);
    const px = this.player.x;
    const py = this.player.y;

    let targetX = px;
    let targetY = py - 300; // 기본은 위쪽

    if (target) {
      targetX = target.x;
      targetY = target.y;
    }

    const dx = targetX - px;
    const dy = targetY - py;
    const angle = Math.atan2(dy, dx);

    // 빔 끝점 계산 (화면 밖까지 연장)
    const beamLength = 650;
    const endX = px + Math.cos(angle) * beamLength;
    const endY = py + Math.sin(angle) * beamLength;

    // 빔 시각 효과 (Graphics)
    const beamWidth = 6 + (this.laser.level - 1) * 2;
    this.laserGraphics.clear();

    // 겉 테두리 광선
    this.laserGraphics.lineStyle(beamWidth + 4, 0x38bdf8, 0.5);
    this.laserGraphics.lineBetween(px, py, endX, endY);
    // 중심 코어 광선
    this.laserGraphics.lineStyle(beamWidth, 0xffffff, 0.9);
    this.laserGraphics.lineBetween(px, py, endX, endY);

    // 120ms 후 서서히 사라짐
    this.scene.time.delayedCall(120, () => {
      this.laserGraphics.clear();
    });

    // 빔 선상에 있는 모든 적 타격 판정
    const damage = Math.round((this.laser.baseDamage + (this.laser.level - 1) * 10) * this.damageMultiplier);
    const hitThreshold = 22 + beamWidth;

    this.enemyManager.enemies.forEach(enemy => {
      if (!enemy.sprite || !enemy.sprite.active) return;
      const ex = enemy.x;
      const ey = enemy.y;

      // 점과 선분 사이의 최단 거리 계산
      const distToBeam = this.distToSegment(ex, ey, px, py, endX, endY);
      if (distToBeam <= hitThreshold) {
        this.enemyManager.damageEnemy(enemy.sprite, damage);
      }
    });
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  upgrade(type) {
    switch (type) {
      case 'gun':
        this.gun.level += 1;
        this.gun.interval = Math.max(220, 550 - (this.gun.level - 1) * 70);
        break;
      case 'crossbow':
        this.crossbow.level += 1;
        this.crossbow.interval = Math.max(500, 1100 - (this.crossbow.level - 1) * 120);
        break;
      case 'laser':
        this.laser.level += 1;
        this.laser.interval = Math.max(800, 1700 - (this.laser.level - 1) * 180);
        break;
      case 'add_orb':
        this.orbitWeapon.addOrb();
        break;
      case 'speed_up':
        this.orbitWeapon.increaseSpeed(0.25);
        break;
      case 'damage_boost':
        this.damageMultiplier += 0.15;
        break;
    }
  }

  update(delta) {
    const dt = delta || 16;

    // 1. 궤도 무기 갱신
    if (this.orbitWeapon) {
      this.orbitWeapon.update(delta);
    }

    // 2. 총 발사 갱신
    if (this.gun.level > 0) {
      this.gun.timer += dt;
      if (this.gun.timer >= this.gun.interval) {
        this.gun.timer = 0;
        this.fireGun();
      }
    }

    // 3. 석궁 발사 갱신
    if (this.crossbow.level > 0) {
      this.crossbow.timer += dt;
      if (this.crossbow.timer >= this.crossbow.interval) {
        this.crossbow.timer = 0;
        this.fireCrossbow();
      }
    }

    // 4. 레이저 발사 갱신
    if (this.laser.level > 0) {
      this.laser.timer += dt;
      if (this.laser.timer >= this.laser.interval) {
        this.laser.timer = 0;
        this.fireLaser();
      }
    }
  }

  // 스테이지 간 보존할 무기 상태 반환
  getState() {
    return {
      orbitCount: this.orbitWeapon.count,
      orbitSpeed: this.orbitWeapon.rotationSpeed,
      orbitDamage: this.orbitWeapon.damage,
      gunLevel: this.gun.level,
      crossbowLevel: this.crossbow.level,
      laserLevel: this.laser.level,
      damageMultiplier: this.damageMultiplier
    };
  }

  // 스테이지 시작 시 이전 무기 상태 복원
  loadState(state) {
    if (!state) return;
    if (state.orbitCount) {
      this.orbitWeapon.count = state.orbitCount;
      this.orbitWeapon.rotationSpeed = state.orbitSpeed || this.orbitWeapon.rotationSpeed;
      this.orbitWeapon.damage = state.orbitDamage || this.orbitWeapon.damage;
      this.orbitWeapon.createOrbs();
    }
    if (state.gunLevel) {
      this.gun.level = state.gunLevel;
      this.gun.interval = Math.max(220, 550 - (this.gun.level - 1) * 70);
    }
    if (state.crossbowLevel) {
      this.crossbow.level = state.crossbowLevel;
      this.crossbow.interval = Math.max(500, 1100 - (this.crossbow.level - 1) * 120);
    }
    if (state.laserLevel) {
      this.laser.level = state.laserLevel;
      this.laser.interval = Math.max(800, 1700 - (this.laser.level - 1) * 180);
    }
    if (state.damageMultiplier) {
      this.damageMultiplier = state.damageMultiplier;
    }
  }

  // 현재 장착된 무기 요약 텍스트
  getActiveWeaponsSummary() {
    const list = [`위성 ${this.orbitWeapon.count}기`];
    if (this.gun.level > 0) list.push(`권총 Lv.${this.gun.level}`);
    if (this.crossbow.level > 0) list.push(`석궁 Lv.${this.crossbow.level}`);
    if (this.laser.level > 0) list.push(`레이저 Lv.${this.laser.level}`);
    return list.join(' · ');
  }
}
