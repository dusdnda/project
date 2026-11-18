import { Enemy } from './Enemy.js';
import { SoundManager } from '../audio/SoundManager.js';

export class EnemyManager {
  constructor(scene, player, stageConfig, onEnemyKilled, onStageClear) {
    this.scene = scene;
    this.player = player;
    this.stageConfig = stageConfig;
    this.onEnemyKilled = onEnemyKilled;
    this.onStageClear = onStageClear;

    this.enemies = [];
    this.group = scene.physics.add.group();

    this.spawnTimer = 0;
    this.spawnInterval = stageConfig.spawnInterval || 1200;
    this.elapsedGameTime = 0;

    this.bossSpawned = false;
    this.bossesAlive = 0;
    this.isStageCleared = false;
  }

  getRandomSpawnPos() {
    const { width, height } = this.scene.scale;
    const margin = 40;
    let x, y;

    const side = Phaser.Math.Between(0, 3);
    switch (side) {
      case 0:
        x = Phaser.Math.Between(0, width);
        y = -margin;
        break;
      case 1:
        x = Phaser.Math.Between(0, width);
        y = height + margin;
        break;
      case 2:
        x = -margin;
        y = Phaser.Math.Between(0, height);
        break;
      case 3:
        x = width + margin;
        y = Phaser.Math.Between(0, height);
        break;
    }
    return { x, y };
  }

  spawnEnemy() {
    const { x, y } = this.getRandomSpawnPos();

    let hp = this.stageConfig.enemyHp || 35;
    let speed = this.stageConfig.enemySpeed || 76;
    let damage = this.stageConfig.enemyDamage || 10;

    // 스테이지 중반(20초 후) 약간의 웨이브 강화
    if (this.elapsedGameTime >= 20) {
      hp = Math.floor(hp * 1.25);
      speed = Math.floor(speed * 1.1);
      damage = Math.floor(damage * 1.2);
    }

    const enemy = new Enemy(this.scene, x, y, { hp, speed, damage });
    this.enemies.push(enemy);
    this.group.add(enemy.sprite);
  }

  spawnBosses() {
    this.bossSpawned = true;
    const { width, height } = this.scene.scale;

    // 사운드: 보스 출현 경보
    SoundManager.playBossAlert(this.scene);

    // 경고 텍스트 연출
    const bossList = this.stageConfig.bosses || [];
    const warningText = bossList.length > 1
      ? `⚠️ ${this.stageConfig.name} 보스 ${bossList.length}체 습격! ⚠️`
      : `⚠️ ${bossList[0]?.name || '보스 몬스터'} 등장! ⚠️`;

    const warning = this.scene.add.text(width / 2, 210, warningText, {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#ef4444',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(90);

    this.scene.tweens.add({
      targets: warning,
      alpha: 0,
      yoyo: true,
      repeat: 3,
      duration: 250,
      onComplete: () => warning.destroy()
    });

    this.bossesAlive = bossList.length;

    // 보스 개체들 스폰
    bossList.forEach((bossData) => {
      let bx = width / 2;
      let by = -50;

      if (bossData.spawnPos === 'bottom') {
        bx = width / 2;
        by = height + 50;
      } else if (bossData.spawnPos === 'left') {
        bx = -50;
        by = height / 2;
      } else if (bossData.spawnPos === 'right') {
        bx = width + 50;
        by = height / 2;
      } else {
        bx = width / 2 + (bossData.offsetX || 0);
        by = -50;
      }

      const boss = new Enemy(this.scene, bx, by, {
        isBoss: true,
        name: bossData.name,
        hp: bossData.hp,
        speed: bossData.speed,
        radius: bossData.radius,
        color: bossData.color,
        damage: bossData.damage,
        splitOnDeath: bossData.splitOnDeath || false,
        isFinal: bossData.isFinal || false
      });

      this.enemies.push(boss);
      this.group.add(boss.sprite);
    });
  }

  damageEnemy(enemySprite, amount) {
    const enemy = enemySprite.enemyInstance;
    if (!enemy) return;

    const deathX = enemy.x;
    const deathY = enemy.y;
    const isBoss = enemy.isBoss;
    const splitOnDeath = enemy.splitOnDeath;

    const isKilled = enemy.takeDamage(amount);
    if (isKilled) {
      this.enemies = this.enemies.filter(e => e !== enemy);
      this.group.remove(enemySprite, true, true);

      if (this.onEnemyKilled) {
        this.onEnemyKilled(deathX, deathY, isBoss);
      }

      if (isBoss) {
        SoundManager.playBossKill(this.scene);

        // 5스테이지 보스 분열 기믹
        if (splitOnDeath) {
          this.spawnMiniBosses(deathX, deathY);
        } else {
          this.bossesAlive -= 1;
        }

        // 모든 보스 격파 시 스테이지 클리어
        if (this.bossesAlive <= 0 && !this.isStageCleared) {
          this.isStageCleared = true;
          if (this.onStageClear) {
            this.onStageClear();
          }
        }
      }
    }
  }

  spawnMiniBosses(x, y) {
    // 2마리로 분열
    const offsets = [-35, 35];
    offsets.forEach(offset => {
      const mini = new Enemy(this.scene, x + offset, y, {
        isBoss: true,
        name: '분열 바이러스체',
        hp: 150,
        speed: 70,
        radius: 19,
        color: 0xc084fc,
        damage: 16,
        splitOnDeath: false
      });
      this.enemies.push(mini);
      this.group.add(mini.sprite);
    });
    // 원래 1마리 소멸 후 2마리 추가이므로 결과적으로 +1
    this.bossesAlive += 1;
  }

  stopAll() {
    this.enemies.forEach(enemy => {
      enemy.stop();
    });
  }

  update(delta, totalElapsedTime) {
    this.elapsedGameTime = totalElapsedTime || 0;

    // 보스 출현 시점 체크
    if (this.elapsedGameTime >= this.stageConfig.bossTime && !this.bossSpawned) {
      this.spawnBosses();
    }

    // 시간에 따른 스폰 간격 조정
    if (this.elapsedGameTime >= 20) {
      this.spawnInterval = Math.max(500, (this.stageConfig.spawnInterval || 1200) * 0.7);
    }

    this.spawnTimer += (delta || 16);
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    const px = this.player.x;
    const py = this.player.y;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.sprite || !enemy.sprite.active) {
        this.enemies.splice(i, 1);
        continue;
      }
      enemy.update(px, py, delta);
    }
  }
}
