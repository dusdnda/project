/**
 * 사운드 매니저 (SoundManager)
 * - 효과음 볼륨: 0.5
 * - BGM 볼륨: 0.3 (반복 재생, assets/audio/bgm.mp3)
 * - 반복 효과음(경험치, 피격 등): 재생 시 피치 미세 변조
 * - 버튼 효과음: 피치 고정
 * - 첫 터치/클릭 시 자동 BGM 재생 및 화면 구석 소리 토글 버튼 지원
 */

class SoundManagerClass {
  constructor() {
    this.isMuted = false;
    this.bgm = null;
    this.bgmStarted = false;
    this.sfxVolume = 0.5;
    this.bgmVolume = 0.3;
  }

  preload(scene) {
    if (!scene.cache.audio.exists('click')) scene.load.audio('click', 'assets/audio/click.wav');
    if (!scene.cache.audio.exists('gem')) scene.load.audio('gem', 'assets/audio/gem.wav');
    if (!scene.cache.audio.exists('levelup')) scene.load.audio('levelup', 'assets/audio/levelup.wav');
    if (!scene.cache.audio.exists('skill')) scene.load.audio('skill', 'assets/audio/skill.wav');
    if (!scene.cache.audio.exists('hit')) scene.load.audio('hit', 'assets/audio/hit.wav');
    if (!scene.cache.audio.exists('boss_alert')) scene.load.audio('boss_alert', 'assets/audio/boss_alert.wav');
    if (!scene.cache.audio.exists('boss_kill')) scene.load.audio('boss_kill', 'assets/audio/boss_kill.wav');
    if (!scene.cache.audio.exists('clear')) scene.load.audio('clear', 'assets/audio/clear.wav');
    if (!scene.cache.audio.exists('gameover')) scene.load.audio('gameover', 'assets/audio/gameover.wav');
    if (!scene.cache.audio.exists('bgm')) scene.load.audio('bgm', 'assets/audio/bgm.mp3');
  }

  initUserInteraction(scene) {
    if (this.bgmStarted) return;

    const startAudio = () => {
      if (scene.sound && scene.sound.context && scene.sound.context.state === 'suspended') {
        scene.sound.context.resume();
      }
      this.playBGM(scene);
    };

    scene.input.once('pointerdown', startAudio);
  }

  playBGM(scene) {
    if (!scene || !scene.sound) return;

    if (!this.bgm) {
      if (!scene.cache.audio.exists('bgm')) return;
      this.bgm = scene.sound.add('bgm', {
        loop: true,
        volume: this.isMuted ? 0 : this.bgmVolume
      });
    }

    if (this.bgm && !this.bgm.isPlaying) {
      this.bgm.play();
      this.bgmStarted = true;
    }
  }

  stopBGM() {
    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop();
      this.bgm = null;
      this.bgmStarted = false;
    }
  }

  toggleMute(scene) {
    this.isMuted = !this.isMuted;
    if (this.bgm) {
      this.bgm.setVolume(this.isMuted ? 0 : this.bgmVolume);
    }
    return this.isMuted;
  }

  playSFX(scene, key, options = {}) {
    if (this.isMuted || !scene || !scene.sound) return;
    if (!scene.cache.audio.exists(key)) return;

    const volume = options.volume !== undefined ? options.volume : this.sfxVolume;
    const detune = options.detune !== undefined ? options.detune : 0;

    try {
      scene.sound.play(key, { volume, detune });
    } catch (e) {
      // AudioContext 예외 안전 처리
    }
  }

  // 1. 버튼 클릭 (피치 고정)
  playClick(scene) {
    this.playSFX(scene, 'click', { detune: 0 });
  }

  // 2. 보석 습득 (피치 미세 변조: -120 ~ 120 cents)
  playGem(scene) {
    const detune = Phaser.Math.Between(-120, 120);
    this.playSFX(scene, 'gem', { detune });
  }

  // 3. 레벨업
  playLevelUp(scene) {
    this.playSFX(scene, 'levelup');
  }

  // 4. 스킬 선택
  playSkill(scene) {
    this.playSFX(scene, 'skill');
  }

  // 5. 플레이어 피격 (피치 미세 변조: -80 ~ 80 cents)
  playHit(scene) {
    const detune = Phaser.Math.Between(-80, 80);
    this.playSFX(scene, 'hit', { detune });
  }

  // 6. 보스 출현 경고
  playBossAlert(scene) {
    this.playSFX(scene, 'boss_alert');
  }

  // 7. 보스 처치
  playBossKill(scene) {
    this.playSFX(scene, 'boss_kill');
  }

  // 8. 스테이지 클리어
  playClear(scene) {
    this.playSFX(scene, 'clear');
  }

  // 9. 게임오버
  playGameOver(scene) {
    this.playSFX(scene, 'gameover');
  }

  // 화면 구석 소리 토글 버튼 생성 헬퍼
  createSoundToggle(scene, x = 445, y = 30) {
    const container = scene.add.container(x, y).setDepth(150);

    const bg = scene.add.circle(0, 0, 18, 0x1f252e, 0.9)
      .setStrokeStyle(1.5, 0x38bdf8)
      .setInteractive({ useHandCursor: true });

    const icon = scene.add.text(0, 0, this.isMuted ? '🔇' : '🔊', {
      fontSize: '15px'
    }).setOrigin(0.5);

    bg.on('pointerdown', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      const muted = this.toggleMute(scene);
      icon.setText(muted ? '🔇' : '🔊');
    });

    container.add([bg, icon]);
    return container;
  }
}

export const SoundManager = new SoundManagerClass();
