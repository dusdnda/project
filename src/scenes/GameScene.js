import { Player } from '../entities/Player.js';
import { WeaponManager } from '../entities/WeaponManager.js';
import { EnemyManager } from '../entities/EnemyManager.js';
import { GemManager } from '../entities/GemManager.js';
import { HUD } from '../ui/HUD.js';
import { LevelUpPopup } from '../ui/LevelUpPopup.js';
import { getStageConfig } from '../config/StageConfig.js';
import { SoundManager } from '../audio/SoundManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.stageNumber = data.stage || 1;
    this.savedPlayerState = data.playerState || null;
    this.totalKills = data.totalKills || 0;
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
    this.isPaused = false;
    this.isGameOver = false;
    this.elapsedTime = 0;
    this.killCount = this.totalKills;
    this.pendingSkillPoints = 0;

    const { width, height } = this.scale;
    this.stageConfig = getStageConfig(this.stageNumber);

    // 0. 사운드 시스템 및 BGM 초기화, 소리 토글 버튼
    SoundManager.initUserInteraction(this);
    SoundManager.playBGM(this);
    SoundManager.createSoundToggle(this, width - 25, 34);

    // 1. 전장 배경 이미지
    if (this.textures.exists('background') && this.textures.get('background').key !== '__MISSING') {
      this.add.image(width / 2, height / 2, 'background')
        .setDisplaySize(width, height)
        .setDepth(-10);
    }

    // 2. HUD 생성 (현재 스테이지 정보 전달)
    this.hud = new HUD(this, this.stageNumber, this.stageConfig.name);

    // 3. 플레이어 생성
    this.player = new Player(this, width / 2, height / 2, () => this.handleGameOver());

    // 4. 경험치 보석 관리자
    this.gemManager = new GemManager(this, this.player, (exp) => {
      this.player.addExp(exp, (newLevel) => this.onPlayerLevelUp(newLevel));
    });

    // 5. 적 관리자 (스테이지별 보스 및 웨이브 제어)
    this.enemyManager = new EnemyManager(
      this,
      this.player,
      this.stageConfig,
      (x, y, isBoss) => {
        this.killCount += 1;
        this.gemManager.spawnGem(x, y, isBoss ? 50 : 10);
      },
      () => this.handleStageClear()
    );

    // 6. 다중 무기 관리자 (위성 무기, 권총, 석궁, 레이저)
    this.weaponManager = new WeaponManager(this, this.player, this.enemyManager);

    // 스테이지 간 상태 복원 (무기들, 레벨, 속도 등 유지)
    if (this.savedPlayerState) {
      this.player.level = this.savedPlayerState.level;
      this.player.exp = this.savedPlayerState.exp;
      this.player.nextLevelExp = this.savedPlayerState.nextLevelExp;
      this.player.maxHp = this.savedPlayerState.maxHp;
      this.player.hp = this.savedPlayerState.hp;
      this.player.speed = this.savedPlayerState.speed;

      if (this.savedPlayerState.weapons) {
        this.weaponManager.loadState(this.savedPlayerState.weapons);
      }
    }

    // 7. 레벨업 팝업 생성
    this.levelUpPopup = new LevelUpPopup(this, (skillId) => this.applySkill(skillId));

    // 8. 충돌 (플레이어 <-> 적 : 접촉 피해)
    this.physics.add.overlap(
      this.player.sprite,
      this.enemyManager.group,
      (playerSprite, enemySprite) => {
        if (!this.isPaused && !this.isGameOver) {
          const enemy = enemySprite.enemyInstance;
          if (enemy) {
            this.player.takeDamage(enemy.damage);
          }
        }
      }
    );

    // 9. 충돌 (플레이어 <-> 경험치 젬)
    this.physics.add.overlap(
      this.player.sprite,
      this.gemManager.group,
      (playerSprite, gemSprite) => {
        if (!this.isPaused && !this.isGameOver) {
          this.gemManager.collectGem(gemSprite);
        }
      }
    );
  }

  getPlayerState(healBonus = false) {
    const hp = healBonus
      ? Math.min(this.player.maxHp, this.player.hp + Math.floor(this.player.maxHp * 0.5))
      : this.player.hp;

    return {
      level: this.player.level,
      exp: this.player.exp,
      nextLevelExp: this.player.nextLevelExp,
      hp: hp,
      maxHp: this.player.maxHp,
      speed: this.player.speed,
      weapons: this.weaponManager.getState(),
      weaponsSummary: this.weaponManager.getActiveWeaponsSummary()
    };
  }

  onPlayerLevelUp(newLevel) {
    if (newLevel === 2) {
      this.pendingSkillPoints = 1;
    } else if (newLevel === 3) {
      this.pendingSkillPoints = 3;
      this.startLevelUpSelection();
    } else if (newLevel > 3) {
      this.pendingSkillPoints = (this.pendingSkillPoints || 0) + 1;
      this.startLevelUpSelection();
    }
  }

  startLevelUpSelection() {
    if (this.isGameOver) return;
    this.isPaused = true;
    this.physics.pause();
    if (this.player) this.player.stop();
    if (this.enemyManager) this.enemyManager.stopAll();
    this.levelUpPopup.show(this.player.level, this.pendingSkillPoints, this.weaponManager.getState());
  }

  applySkill(skillId) {
    if (skillId === 'player_speed') {
      this.player.upgradeSpeed(0.2);
    } else if (skillId === 'heal') {
      this.player.heal(40);
    } else {
      this.weaponManager.upgrade(skillId);
    }

    this.pendingSkillPoints -= 1;

    if (this.pendingSkillPoints > 0) {
      this.time.delayedCall(100, () => {
        if (!this.isGameOver) {
          this.levelUpPopup.show(this.player.level, this.pendingSkillPoints, this.weaponManager.getState());
        }
      });
    } else {
      this.physics.resume();
      if (this.player) {
        this.player.invulnerableTime = 600;
      }
      this.isPaused = false;
    }
  }

  getFormattedTime() {
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    SoundManager.playGameOver(this);

    const finalTime = this.getFormattedTime();
    const finalKills = this.killCount;

    this.time.delayedCall(800, () => {
      this.scene.start('ResultScene', {
        result: 'lose',
        stage: this.stageNumber,
        stageName: this.stageConfig.name,
        survivalTime: finalTime,
        kills: finalKills,
        totalKills: this.killCount,
        playerState: this.getPlayerState(false)
      });
    });
  }

  handleStageClear() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    SoundManager.playClear(this);

    const finalTime = this.getFormattedTime();
    const finalKills = this.killCount;
    const isFinal = this.stageNumber >= 10;

    this.time.delayedCall(1200, () => {
      this.scene.start('ResultScene', {
        result: 'win',
        stage: this.stageNumber,
        stageName: this.stageConfig.name,
        isFinalStage: isFinal,
        survivalTime: finalTime,
        kills: finalKills,
        totalKills: this.killCount,
        playerState: this.getPlayerState(true)
      });
    });
  }

  update(time, delta) {
    if (this.isPaused || this.isGameOver) return;

    this.elapsedTime += (delta || 16) / 1000;

    if (this.player) {
      this.player.update(delta);
    }
    if (this.weaponManager) {
      this.weaponManager.update(delta);
    }
    if (this.enemyManager) {
      this.enemyManager.update(delta, this.elapsedTime);
    }
    if (this.gemManager) {
      this.gemManager.update();
    }
    if (this.hud) {
      this.hud.update(this.player, this.elapsedTime, this.killCount);
    }
  }
}
