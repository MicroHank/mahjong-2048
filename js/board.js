/**
 * 3D Mahjong 2048 Game Board Model
 */

/**
 * 遊戲平衡規則參數配置 (Game Rule Configuration)
 * 您可以在此隨意修改各項飛越與消除限制條件！
 */
export const GAME_RULES = {
  /**
   * 平層飛越最多可跨過的中間方塊數量限制：
   * 當兩塊方塊在同一高度層（平層，|yA - yB| < 0.4）嘗試合併時，
   * 航線路徑中間跨過（遮擋/橫亙）的中間方塊總數如果「大於」此數值，就判定無法平層飛越！
   * 預設為 1：代表中間最多只能跨過 1 塊，跨過 2 塊或以上就無法飛越！
   * （若想禁止任何平層跨越，可設為 0；若想放寬，可設為 2 或更高）
   */
  MAX_SAME_LAYER_LEAP_TILES: 1,
};

// 掛載至 window 便於在瀏覽器 Console 中即時除錯與熱修改
if (typeof window !== 'undefined') {
  window.GAME_RULES = GAME_RULES;
}

/**
 * Compute the shortest distance from 2D point (px, pz) to line segment (x1, z1) -> (x2, z2)
 */
function distPointToSegment(px, pz, x1, z1, x2, z2) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) {
    return Math.hypot(px - x1, pz - z1);
  }
  let t = ((px - x1) * dx + (pz - z1) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projZ = z1 + t * dz;
  return Math.hypot(px - projX, pz - projZ);
}

export class BoardModel {
  constructor() {
    this.tiles = []; // Array of Tile objects: { id, x, y, z, value, isSelected, isSelectable, mesh }
    this.ruleMode = "casual"; // 'casual' (Mode A: top-only) | 'mahjong' (Mode B: top + edge)
    this.historyStack = [];
    this.nextTileId = 1;
  }

  setRuleMode(mode) {
    this.ruleMode = mode;
    this.updateSelectability();
  }

  loadLevel(coords, numbers, frozenIndices = []) {
    this.tiles = [];
    this.historyStack = [];
    this.nextTileId = 1;

    let numIdx = 0;
    coords.forEach((c, idx) => {
      const isFrozen = !!c.isFrozen || (Array.isArray(frozenIndices) 
        ? frozenIndices.includes(idx)
        : (frozenIndices instanceof Set ? frozenIndices.has(idx) : false));

      const val = numbers[numIdx++] || 2;

      this.tiles.push({
        id: this.nextTileId++,
        x: c.x,
        y: c.y,
        z: c.z,
        value: val,
        isFrozen: isFrozen,
        isSelected: false,
        isSelectable: false,
        mesh: null
      });
    });

    this.updateSelectability();
  }

  /**
   * Helper: check if a tile exists at approximate coordinate
   */
  getTileAt(x, y, z, epsilon = 0.4) {
    return this.tiles.find(t => 
      Math.abs(t.x - x) < epsilon &&
      Math.abs(t.y - y) < epsilon &&
      Math.abs(t.z - z) < epsilon
    );
  }

  /**
   * Check if a tile is blocked from above (+Y)
   */
  isTopBlocked(tile) {
    // A tile is blocked if another tile is directly above it at y + 1
    // with significant horizontal overlap (overlap > 50%)
    return this.tiles.some(other => 
      other.id !== tile.id &&
      other.y > tile.y &&
      Math.abs(other.y - (tile.y + 1)) < 0.4 &&
      Math.abs(other.x - tile.x) < 0.52 &&
      Math.abs(other.z - tile.z) < 0.52
    );
  }

  /**
   * Recompute isSelectable flag for all alive tiles
   * Unblocked from top AND not frozen is selectable
   */
  updateSelectability() {
    this.tiles.forEach(tile => {
      const topBlocked = this.isTopBlocked(tile);
      tile.isSelectable = !topBlocked && !tile.isFrozen;
    });
  }

  /**
   * Break ice on frozen stones adjacent to merge positions posA and posB
   * Returns array of defrosted tile objects
   */
  breakAdjacentIce(posA, posB, radius = 1.6) {
    const defrosted = [];
    this.tiles.forEach(tile => {
      if (!tile.isFrozen) return;

      const distA = Math.hypot(tile.x - posA.x, (tile.y - posA.y) * 1.1, tile.z - posA.z);
      const distB = Math.hypot(tile.x - posB.x, (tile.y - posB.y) * 1.1, tile.z - posB.z);

      if (distA <= radius || distB <= radius) {
        tile.isFrozen = false;
        defrosted.push(tile);
      }
    });

    if (defrosted.length > 0) {
      this.updateSelectability();
    }
    return defrosted;
  }

  /**
   * Snapshot current state for Undo
   */
  saveSnapshot(score) {
    const state = {
      score,
      tiles: this.tiles.map(t => ({
        id: t.id,
        x: t.x,
        y: t.y,
        z: t.z,
        value: t.value,
        isFrozen: !!t.isFrozen
      }))
    };
    this.historyStack.push(state);
    if (this.historyStack.length > 10) {
      this.historyStack.shift();
    }
  }

  /**
   * Revert to previous snapshot
   */
  popSnapshot() {
    return this.historyStack.pop() || null;
  }

  /**
   * Simulate gravity: tiles fall down only when there is no support underneath.
   * Prevents any two tiles from ever colliding or overlapping in 3D space.
   * Returns list of drops: [{ tile, fromY, toY, dropDistance }]
   */
  applyGravity() {
    const drops = [];

    // Sort all tiles ascending by Y (bottom up)
    const sortedTiles = [...this.tiles].sort((a, b) => a.y - b.y);

    sortedTiles.forEach(tile => {
      let targetY = tile.y;

      for (let testY = 0; testY < tile.y; testY++) {
        // 1. Collision Check: Is testY already occupied or obstructed by ANY other tile?
        const hasCollision = this.tiles.some(other =>
          other.id !== tile.id &&
          Math.abs(other.y - testY) < 0.4 &&
          Math.abs(other.x - tile.x) < 0.75 &&
          Math.abs(other.z - tile.z) < 0.75
        );

        if (hasCollision) {
          // Cannot drop to testY because it collides with another tile
          continue;
        }

        // 2. Support Check: Can the tile rest at testY?
        if (testY === 0) {
          // Floor / ground pedestal supports all tiles at y=0
          targetY = 0;
          break;
        } else {
          // At height testY > 0, there MUST be at least one supporting tile at testY - 1 underneath it
          const hasSupportBelow = this.tiles.some(other =>
            other.id !== tile.id &&
            Math.abs(other.y - (testY - 1)) < 0.4 &&
            Math.abs(other.x - tile.x) < 0.75 &&
            Math.abs(other.z - tile.z) < 0.75
          );

          if (hasSupportBelow) {
            targetY = testY;
            break;
          }
        }
      }

      if (targetY < tile.y) {
        drops.push({
          tile,
          fromY: tile.y,
          toY: targetY,
          dropDistance: tile.y - targetY
        });
        tile.y = targetY;
      }
    });

    this.updateSelectability();
    return drops;
  }

  /**
   * Check if trajectory path between tileA and tileB is obstructed.
   * 1. Flat Layer Leap (Same Elevation, |yA - yB| < 0.4):
   *    - Counts intermediate tiles crossed along the flight corridor.
   *    - If crossed count > GAME_RULES.MAX_SAME_LAYER_LEAP_TILES, flat leap is blocked!
   *    - Also blocked if any intermediate obstacle is strictly higher than the layer (mountain peak).
   * 2. Multi-Elevation Leap (Different Elevation):
   *    - Unobstructed along high parabolic arc unless an intermediate peak higher than both tiles stands in between.
   * 
   * Returns obstruction object { type, blocker, count, max } if blocked, or null if clear.
   */
  isPathBlocked3D(tileA, tileB) {
    const dx = tileB.x - tileA.x;
    const dz = tileB.z - tileA.z;
    const lenSq2D = dx * dx + dz * dz;

    // Immediately adjacent tiles or same horizontal spot are never blocked
    if (lenSq2D < 0.64) return null;

    const isSameLayer = Math.abs(tileA.y - tileB.y) < 0.4;
    const maxElev = Math.max(tileA.y, tileB.y);

    const intermediateFlatTiles = [];
    let higherPeakBlocker = null;

    for (const t of this.tiles) {
      if (t.id === tileA.id || t.id === tileB.id) continue;

      // Project onto 2D flight segment (middle 15% ~ 85%)
      const t2D = ((t.x - tileA.x) * dx + (t.z - tileA.z) * dz) / lenSq2D;
      if (t2D < 0.15 || t2D > 0.85) continue;

      const projX = tileA.x + t2D * dx;
      const projZ = tileA.z + t2D * dz;
      const dist2D = Math.hypot(t.x - projX, t.z - projZ);

      // Falls within flight corridor width
      if (dist2D < 0.48) {
        // Condition 1: Intermediate tile is strictly higher than both endpoints
        if (t.y > maxElev) {
          higherPeakBlocker = t;
        }

        // Condition 2: Intermediate tile on the flat flight path (at or above this elevation)
        if (isSameLayer && t.y >= tileA.y - 0.3) {
          intermediateFlatTiles.push(t);
        }
      }
    }

    // Rule A: Peak obstruction (applies to both flat and multi-elevation leaps)
    if (higherPeakBlocker) {
      return {
        type: 'PEAK_OBSTRUCTION',
        blocker: higherPeakBlocker
      };
    }

    // Rule B: Flat leap count limit (applies when on the same height level)
    if (isSameLayer) {
      const crossedCount = intermediateFlatTiles.length;
      if (crossedCount > GAME_RULES.MAX_SAME_LAYER_LEAP_TILES) {
        return {
          type: 'MAX_LEAP_EXCEEDED',
          blocker: intermediateFlatTiles[0],
          count: crossedCount,
          max: GAME_RULES.MAX_SAME_LAYER_LEAP_TILES
        };
      }
    }

    return null;
  }

  /**
   * Backward-compatible alias
   */
  isPathBlockedByHigherTiles(tileA, tileB) {
    return this.isPathBlocked3D(tileA, tileB);
  }

  /**
   * Find available matching pairs among selectable tiles
   */
  findAvailablePairs() {
    const selectable = this.tiles.filter(t => t.isSelectable);
    const pairs = [];

    for (let i = 0; i < selectable.length; i++) {
      for (let j = i + 1; j < selectable.length; j++) {
        if (selectable[i].value === selectable[j].value) {
          // Verify 3D line of sight is clear
          if (this.isPathBlocked3D(selectable[i], selectable[j])) {
            continue; // Path blocked by 3D ridge or obstacle!
          }
          pairs.push([selectable[i], selectable[j]]);
        }
      }
    }
    return pairs;
  }

  /**
   * Smart Shuffle: Shuffles values among remaining tiles and GUARANTEES
   * that at least 1-2 matching pairs are placed on currently selectable tiles!
   */
  smartShuffle() {
    this.updateSelectability();
    const selectableTiles = this.tiles.filter(t => t.isSelectable);
    const values = this.tiles.map(t => t.value);

    // Count value frequencies
    const counts = new Map();
    values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));

    // Values with at least 2 occurrences
    const pairCandidates = [];
    counts.forEach((cnt, val) => {
      if (cnt >= 2) pairCandidates.push(val);
    });

    if (pairCandidates.length > 0 && selectableTiles.length >= 2) {
      const maxPairsCanPlace = Math.min(
        pairCandidates.length,
        Math.floor(selectableTiles.length / 2)
      );
      const pairsToPlace = Math.min(2, maxPairsCanPlace);

      // Shuffle selectable slots
      const selSlots = [...selectableTiles];
      for (let i = selSlots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selSlots[i], selSlots[j]] = [selSlots[j], selSlots[i]];
      }

      // Shuffle pair candidates
      for (let i = pairCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairCandidates[i], pairCandidates[j]] = [pairCandidates[j], pairCandidates[i]];
      }

      const assignedTiles = new Map();
      let slotIdx = 0;

      for (let p = 0; p < pairsToPlace; p++) {
        const val = pairCandidates[p];
        assignedTiles.set(selSlots[slotIdx++].id, val);
        assignedTiles.set(selSlots[slotIdx++].id, val);
        const i1 = values.indexOf(val);
        values.splice(i1, 1);
        const i2 = values.indexOf(val);
        values.splice(i2, 1);
      }

      // Shuffle remaining values
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }

      let remainingValIdx = 0;
      this.tiles.forEach(t => {
        if (assignedTiles.has(t.id)) {
          t.value = assignedTiles.get(t.id);
        } else {
          t.value = values[remainingValIdx++];
        }
        t.isSelected = false;
      });
    } else {
      // Standard random shuffle fallback
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }
      this.tiles.forEach((t, idx) => {
        t.value = values[idx];
        t.isSelected = false;
      });
    }

    this.updateSelectability();
  }

  shuffle() {
    this.smartShuffle();
  }

  removeTile(tileId) {
    const idx = this.tiles.findIndex(t => t.id === tileId);
    if (idx !== -1) {
      this.tiles.splice(idx, 1);
    }
  }

  getRemainingCount() {
    return this.tiles.length;
  }

  getMaxTileValue() {
    if (this.tiles.length === 0) return 0;
    return Math.max(...this.tiles.map(t => t.value));
  }
}
