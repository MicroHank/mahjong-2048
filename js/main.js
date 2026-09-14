/**
 * 3D Mahjong 2048 - Main Application Controller
 * Connects 3D Renderer, Board Logic, Sound Synthesizer, and HUD UI.
 */

import { LEVELS, generateNumbersForGrid } from './levels.js';
import { BoardModel } from './board.js';
import { GameRenderer } from './renderer.js';
import { SoundEngine } from './audio.js';
import { InteractionHandler } from './interaction.js';

class Mahjong2048Game {
  constructor() {
    this.currentLevelIndex = 0;
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('mahjong2048_best') || '0', 10);
    this.moves = 0;
    this.combo = 0;
    this.lastMergeTime = 0;
    this.selectedTile = null;
    this.isAnimating = false;
    this.activeHintTiles = null;

    // Power-up counts
    this.undoCount = 3;
    this.hintCount = 3;
    this.shuffleCount = 2;

    // Modules
    this.sound = new SoundEngine();
    this.board = new BoardModel();
    this.renderer = new GameRenderer(document.getElementById('canvas-container'));
    this.interaction = new InteractionHandler(
      this.renderer.renderer.domElement,
      this.renderer,
      (tileId) => this.handleTileClick(tileId)
    );

    this.initDOM();
    this.startLevel(0);
  }

  initDOM() {
    // Score & Header
    this.scoreDisplay = document.getElementById('score-display');
    this.bestScoreDisplay = document.getElementById('best-score-display');
    this.scorePopup = document.getElementById('score-popup');
    this.bestScoreDisplay.textContent = this.bestScore.toLocaleString();
    this.levelNameDisplay = document.getElementById('current-level-name');
    this.remainingTilesDisplay = document.getElementById('remaining-tiles-count');

    // Rule mode button
    this.ruleModeBtn = document.getElementById('rule-mode-btn');
    this.ruleModeIcon = document.getElementById('rule-mode-icon');
    this.ruleModeText = document.getElementById('rule-mode-text');
    this.ruleModeBtn.addEventListener('click', () => this.toggleRuleMode());

    // Audio button
    this.audioBtn = document.getElementById('audio-toggle-btn');
    this.audioBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.audioBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    // Camera preset buttons
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.cam;
        this.renderer.setCameraPreset(type);
      });
    });

    // Toolbar buttons
    this.undoBtn = document.getElementById('undo-btn');
    this.undoCountBadge = document.getElementById('undo-count');
    this.undoBtn.addEventListener('click', () => this.handleUndo());

    this.hintBtn = document.getElementById('hint-btn');
    this.hintCountBadge = document.getElementById('hint-count');
    this.hintBtn.addEventListener('click', () => this.handleHint());

    this.shuffleBtn = document.getElementById('shuffle-btn');
    this.shuffleCountBadge = document.getElementById('shuffle-count');
    this.shuffleBtn.addEventListener('click', () => this.handleShuffle());

    this.restartBtn = document.getElementById('restart-btn');
    this.restartBtn.addEventListener('click', () => this.startLevel(this.currentLevelIndex));

    // Level select modal
    this.levelModal = document.getElementById('level-modal');
    this.levelSelectBtn = document.getElementById('level-select-btn');
    this.closeLevelModalBtn = document.getElementById('close-level-modal');
    this.levelSelectBtn.addEventListener('click', () => this.openLevelModal());
    this.closeLevelModalBtn.addEventListener('click', () => this.levelModal.classList.add('hidden'));

    // Help modal
    this.helpModal = document.getElementById('help-modal');
    this.helpBtn = document.getElementById('help-btn');
    this.closeHelpModalBtn = document.getElementById('close-help-modal');
    this.helpConfirmBtn = document.getElementById('help-confirm-btn');
    this.helpBtn.addEventListener('click', () => this.helpModal.classList.remove('hidden'));
    this.closeHelpModalBtn.addEventListener('click', () => this.helpModal.classList.add('hidden'));
    this.helpConfirmBtn.addEventListener('click', () => this.helpModal.classList.add('hidden'));

    // Victory modal
    this.victoryModal = document.getElementById('victory-modal');
    this.vReplayBtn = document.getElementById('v-replay-btn');
    this.vNextBtn = document.getElementById('v-next-btn');
    this.vReplayBtn.addEventListener('click', () => {
      this.victoryModal.classList.add('hidden');
      this.startLevel(this.currentLevelIndex);
    });
    this.vNextBtn.addEventListener('click', () => {
      this.victoryModal.classList.add('hidden');
      const nextIdx = (this.currentLevelIndex + 1) % LEVELS.length;
      this.startLevel(nextIdx);
    });

    // Deadlock modal
    this.deadlockModal = document.getElementById('deadlock-modal');
    document.getElementById('deadlock-undo-btn').addEventListener('click', () => {
      this.deadlockModal.classList.add('hidden');
      this.handleUndo();
    });
    document.getElementById('deadlock-shuffle-btn').addEventListener('click', () => {
      this.deadlockModal.classList.add('hidden');
      this.handleShuffle(true); // force shuffle if out of charges
    });
    document.getElementById('deadlock-restart-btn').addEventListener('click', () => {
      this.deadlockModal.classList.add('hidden');
      this.startLevel(this.currentLevelIndex);
    });

    // Floating Combo Banner
    this.banner = document.getElementById('floating-banner');
    this.bannerText = document.getElementById('banner-text');

    // 2048 Splash
    this.celebrationSplash = document.getElementById('celebration-splash');

    this.renderLevelModalList();
  }

  renderLevelModalList() {
    const list = document.getElementById('levels-list');
    list.innerHTML = '';
    LEVELS.forEach((lvl, idx) => {
      const card = document.createElement('div');
      card.className = `level-card ${idx === this.currentLevelIndex ? 'active' : ''}`;
      card.innerHTML = `
        <div class="level-icon">${lvl.icon}</div>
        <div class="level-name">${lvl.name}</div>
        <div class="level-meta">${lvl.desc}</div>
      `;
      card.addEventListener('click', () => {
        this.levelModal.classList.add('hidden');
        this.startLevel(idx);
      });
      list.appendChild(card);
    });
  }

  openLevelModal() {
    this.renderLevelModalList();
    this.levelModal.classList.remove('hidden');
  }

  toggleRuleMode() {
    const isCasual = this.board.ruleMode === "casual";
    const newMode = isCasual ? "mahjong" : "casual";
    this.board.setRuleMode(newMode);

    if (newMode === "casual") {
      this.ruleModeIcon.textContent = "🍃";
      this.ruleModeText.textContent = "直覺休閒";
      this.showBanner("切換模式：只要頂部無遮蔽即可選取");
    } else {
      this.ruleModeIcon.textContent = "🀄";
      this.ruleModeText.textContent = "立體麻將";
      this.showBanner("切換模式：頂部無遮蔽 且 邊緣需有空隙");
    }

    // Refresh visuals
    this.board.tiles.forEach(t => this.renderer.updateTileVisuals(t));
    this.sound.playSelect();
  }

  startLevel(index) {
    this.currentLevelIndex = index;
    const level = LEVELS[index];
    this.levelNameDisplay.textContent = `第 ${level.id} 關：${level.name}`;
    
    // Reset round state
    this.score = 0;
    this.moves = 0;
    this.combo = 0;
    this.selectedTile = null;
    this.isAnimating = false;
    this.activeHintTiles = null;
    this.updateScoreUI();

    // Reset power-ups for new stage
    this.undoCount = 5;
    this.hintCount = 5;
    this.shuffleCount = 5;
    this.updatePowerupBadges();

    // Target display
    const targetVal = level.targetValue || 2048;
    const targetStatusEl = document.getElementById('target-2048-status');
    if (targetStatusEl) {
      targetStatusEl.textContent = `目標: 合併至 ${targetVal} 消除`;
    }

    // Generate 3D grid and solvable binary numbers
    const coords = level.generateGrid();
    const numbers = generateNumbersForGrid(coords, level.id, targetVal);

    this.board.loadLevel(coords, numbers);

    // Ensure at least 2 matching pairs exist on selectable tiles at start
    if (this.board.findAvailablePairs().length < 2) {
      this.board.smartShuffle();
    }

    this.renderer.renderBoard(this.board.tiles);
    this.renderer.setCameraPreset('iso');

    this.updateRemainingTilesUI();
    this.showBanner(`關卡開始：${level.name}！目標合成 ${targetVal}！`);
  }

  updateScoreUI(addedPoints = 0) {
    this.scoreDisplay.textContent = this.score.toLocaleString();
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('mahjong2048_best', this.bestScore.toString());
      this.bestScoreDisplay.textContent = this.bestScore.toLocaleString();
    }

    if (addedPoints > 0) {
      this.scorePopup.textContent = `+${addedPoints}`;
      this.scorePopup.classList.remove('animate');
      // trigger reflow
      void this.scorePopup.offsetWidth;
      this.scorePopup.classList.add('animate');
    }
  }

  updateRemainingTilesUI() {
    const count = this.board.getRemainingCount();
    this.remainingTilesDisplay.textContent = count;
  }

  updatePowerupBadges() {
    this.undoCountBadge.textContent = this.undoCount;
    this.hintCountBadge.textContent = this.hintCount;
    this.shuffleCountBadge.textContent = this.shuffleCount;
    this.undoBtn.disabled = (this.undoCount <= 0 && this.board.historyStack.length === 0);
    this.hintBtn.disabled = (this.hintCount <= 0);
    this.shuffleBtn.disabled = (this.shuffleCount <= 0);
  }

  showBanner(text, duration = 1800) {
    this.bannerText.textContent = text;
    this.banner.classList.remove('hidden');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      this.banner.classList.add('hidden');
    }, duration);
  }

  handleTileClick(tileId) {
    if (this.isAnimating) return;

    const clickedTile = this.board.tiles.find(t => t.id === tileId);
    if (!clickedTile) return;

    // Clear hint if present
    if (this.activeHintTiles) {
      this.renderer.clearHint(this.activeHintTiles[0], this.activeHintTiles[1]);
      this.activeHintTiles = null;
    }

    // Check if selectable
    if (!clickedTile.isSelectable) {
      this.sound.playInvalid();
      this.showBanner(this.board.isTopBlocked(clickedTile) ? "⚠️ 正上方被壓著，無法選取！" : "⚠️ 邊緣被緊貼包圍，無法抽取！", 1200);
      return;
    }

    // If no tile selected yet
    if (!this.selectedTile) {
      this.selectedTile = clickedTile;
      clickedTile.isSelected = true;
      this.renderer.updateTileVisuals(clickedTile);
      this.sound.playSelect();
      return;
    }

    // If clicking the same tile again -> deselect
    if (this.selectedTile.id === clickedTile.id) {
      clickedTile.isSelected = false;
      this.renderer.updateTileVisuals(clickedTile);
      this.selectedTile = null;
      this.sound.playDeselect();
      return;
    }

    // If clicking another tile: check match
    const tileA = this.selectedTile;
    const tileB = clickedTile;

    if (tileA.value === tileB.value) {
      // MATCH! Execute Merge
      this.executeMerge(tileA, tileB);
    } else {
      // Different value: switch selection to clicked tile
      tileA.isSelected = false;
      this.renderer.updateTileVisuals(tileA);

      tileB.isSelected = true;
      this.renderer.updateTileVisuals(tileB);
      this.selectedTile = tileB;
      this.sound.playSelect();
    }
  }

  executeMerge(tileA, tileB) {
    this.isAnimating = true;
    this.moves++;

    // Save snapshot for Undo
    this.board.saveSnapshot(this.score);
    this.updatePowerupBadges();

    // Deselect tileA visually before flying
    tileA.isSelected = false;
    this.renderer.updateTileVisuals(tileA);
    this.selectedTile = null;

    // Combo system (merges within 3.5s increase multiplier)
    const now = performance.now();
    if (now - this.lastMergeTime < 3500) {
      this.combo++;
    } else {
      this.combo = 1;
    }
    this.lastMergeTime = now;

    const newValue = tileA.value * 2;
    const points = newValue * this.combo;
    this.score += points;
    this.updateScoreUI(points);

    if (this.combo > 1) {
      this.showBanner(`🔥 連鎖 COMBO x${this.combo}！ +${points} 分`);
    }

    // Run 3D merge animation
    this.renderer.animateMerge(tileA, tileB, () => {
      // TileA is removed in 3D
      this.board.removeTile(tileA.id);
      tileB.value = newValue;

      const level = LEVELS[this.currentLevelIndex];
      const targetVal = level ? (level.targetValue || 2048) : 2048;

      if (newValue >= targetVal) {
        // Target reached!
        this.trigger2048Event(tileB, targetVal);
      } else {
        this.sound.playMerge(newValue);
        this.renderer.updateTileVisuals(tileB);
        this.triggerGravityCascade();
      }
    });
  }

  trigger2048Event(tile, targetVal = 2048) {
    this.sound.play2048();
    const bonus = targetVal * 10;
    this.score += bonus;
    this.updateScoreUI(bonus);

    // Show 2048 Splash banner
    const splashTitle = document.querySelector('.splash-title');
    if (splashTitle) splashTitle.textContent = `${targetVal} UNLOCKED!`;
    this.celebrationSplash.classList.remove('hidden');
    setTimeout(() => {
      this.celebrationSplash.classList.add('hidden');
    }, 1800);

    // Dissolve the tile with fireworks
    this.renderer.dissolveTile(tile.id, () => {
      this.board.removeTile(tile.id);
      this.triggerGravityCascade();
    });
  }

  triggerGravityCascade() {
    // Simulate Gravity
    const drops = this.board.applyGravity();

    if (drops.length > 0) {
      this.sound.playDrop();
      this.renderer.animateGravityDrops(drops, () => {
        this.finishTurn();
      });
    } else {
      this.finishTurn();
    }
  }

  finishTurn() {
    this.board.updateSelectability();
    this.board.tiles.forEach(t => this.renderer.updateTileVisuals(t));
    this.updateRemainingTilesUI();
    this.isAnimating = false;

    // Check Victory
    if (this.board.getRemainingCount() === 0) {
      this.triggerVictory();
      return;
    }

    // Check Deadlock
    const availablePairs = this.board.findAvailablePairs();
    if (availablePairs.length === 0) {
      // Deadlock condition!
      setTimeout(() => {
        if (this.board.getRemainingCount() > 0) {
          this.deadlockModal.classList.remove('hidden');
        }
      }, 500);
    }
  }

  triggerVictory() {
    this.sound.playVictory();
    document.getElementById('v-score').textContent = this.score.toLocaleString();
    document.getElementById('v-max-tile').textContent = this.board.getMaxTileValue();
    document.getElementById('v-moves').textContent = this.moves;

    setTimeout(() => {
      this.victoryModal.classList.remove('hidden');
    }, 600);
  }

  handleUndo() {
    if (this.isAnimating) return;

    const snapshot = this.board.popSnapshot();
    if (!snapshot) {
      this.showBanner("已經回到最開頭，無法再上一步！");
      return;
    }

    if (this.undoCount > 0) {
      this.undoCount--;
    }

    // Restore board
    this.score = snapshot.score;
    this.updateScoreUI();
    this.board.tiles = snapshot.tiles.map(t => ({
      id: t.id,
      x: t.x,
      y: t.y,
      z: t.z,
      value: t.value,
      isSelected: false,
      isSelectable: false,
      mesh: null
    }));

    this.board.updateSelectability();
    this.renderer.renderBoard(this.board.tiles);
    this.selectedTile = null;
    this.updateRemainingTilesUI();
    this.updatePowerupBadges();
    this.sound.playSelect();
    this.showBanner("↩️ 已成功復原上一步");
  }

  handleHint() {
    if (this.isAnimating) return;
    if (this.hintCount <= 0) {
      this.showBanner("💡 提示次數已用盡！");
      return;
    }

    const pairs = this.board.findAvailablePairs();
    if (pairs.length === 0) {
      this.showBanner("⚠️ 目前盤面沒有可選的配對！請使用洗牌！");
      return;
    }

    this.hintCount--;
    this.updatePowerupBadges();

    const [tileA, tileB] = pairs[0];
    this.activeHintTiles = [tileA, tileB];
    this.renderer.highlightHintPair(tileA, tileB);
    this.sound.playHint();
    this.showBanner(`💡 為您標示了一組可合併的 [${tileA.value}] 方塊！`);

    // Auto clear hint after 3.5s
    setTimeout(() => {
      if (this.activeHintTiles) {
        this.renderer.clearHint(this.activeHintTiles[0], this.activeHintTiles[1]);
        this.activeHintTiles = null;
      }
    }, 3500);
  }

  handleShuffle(force = false) {
    if (this.isAnimating) return;
    if (!force && this.shuffleCount <= 0) {
      this.showBanner("🔀 洗牌次數已用盡！");
      return;
    }

    if (!force && this.shuffleCount > 0) {
      this.shuffleCount--;
      this.updatePowerupBadges();
    }

    this.selectedTile = null;
    this.board.smartShuffle();
    this.board.tiles.forEach(t => this.renderer.updateTileVisuals(t));
    this.sound.playShuffle();

    const pairs = this.board.findAvailablePairs();
    if (pairs.length > 0) {
      this.showBanner("🔀 智慧洗牌成功！已為您保證生成可選配對！");
      // Auto highlight new pair for 2.5s
      const [tA, tB] = pairs[0];
      this.activeHintTiles = [tA, tB];
      this.renderer.highlightHintPair(tA, tB);
      setTimeout(() => {
        if (this.activeHintTiles) {
          this.renderer.clearHint(this.activeHintTiles[0], this.activeHintTiles[1]);
          this.activeHintTiles = null;
        }
      }, 2500);
    } else {
      this.showBanner("🔀 方塊已重新配置！");
    }
  }
}

// Start Game on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Mahjong2048Game();
});
