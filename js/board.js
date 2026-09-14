/**
 * 3D Mahjong 2048 Game Board Model
 * Manages 3D grid, occlusion rules, gravity cascade, and match logic.
 */

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

  loadLevel(coords, numbers) {
    this.tiles = [];
    this.historyStack = [];
    this.nextTileId = 1;

    coords.forEach((c, idx) => {
      this.tiles.push({
        id: this.nextTileId++,
        x: c.x,
        y: c.y,
        z: c.z,
        value: numbers[idx] || 2,
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
   * Check edge freedom (Mahjong Solitaire rule)
   * Free if at least one horizontal axis has an unblocked side
   */
  isEdgeBlocked(tile) {
    if (this.ruleMode === "casual") {
      return false; // Mode A: only top matters
    }

    // Mode B: Mahjong Solitaire 3D freedom
    // Check Left/Right (X axis) and Front/Back (Z axis)
    const hasLeft = this.tiles.some(t => 
      t.id !== tile.id && 
      Math.abs(t.y - tile.y) < 0.4 &&
      Math.abs(t.z - tile.z) < 0.7 &&
      (tile.x - t.x) > 0.4 && (tile.x - t.x) < 1.3
    );

    const hasRight = this.tiles.some(t => 
      t.id !== tile.id && 
      Math.abs(t.y - tile.y) < 0.4 &&
      Math.abs(t.z - tile.z) < 0.7 &&
      (t.x - tile.x) > 0.4 && (t.x - tile.x) < 1.3
    );

    const hasFront = this.tiles.some(t => 
      t.id !== tile.id && 
      Math.abs(t.y - tile.y) < 0.4 &&
      Math.abs(t.x - tile.x) < 0.7 &&
      (t.z - tile.z) > 0.4 && (t.z - tile.z) < 1.3
    );

    const hasBack = this.tiles.some(t => 
      t.id !== tile.id && 
      Math.abs(t.y - tile.y) < 0.4 &&
      Math.abs(t.x - tile.x) < 0.7 &&
      (tile.z - t.z) > 0.4 && (tile.z - t.z) < 1.3
    );

    // If both left and right are blocked AND both front and back are blocked,
    // then the tile is trapped inside!
    const isXBlocked = hasLeft && hasRight;
    const isZBlocked = hasFront && hasBack;

    return isXBlocked && isZBlocked;
  }

  /**
   * Recompute isSelectable flag for all alive tiles
   * Casual Mode: Unblocked from top is selectable
   */
  updateSelectability() {
    this.tiles.forEach(tile => {
      tile.isSelectable = !this.isTopBlocked(tile);
    });
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
        value: t.value
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
   * Simulate gravity: tiles fall down into empty slots directly below them
   * Returns list of drops: [{ tile, fromY, toY, dropDistance }]
   */
  applyGravity() {
    const drops = [];

    // Group tiles by (x, z) column
    const columns = new Map();
    this.tiles.forEach(t => {
      const key = `${Math.round(t.x * 10) / 10},${Math.round(t.z * 10) / 10}`;
      if (!columns.has(key)) columns.set(key, []);
      columns.get(key).push(t);
    });

    // For each column, sort tiles ascending by Y and drop to lowest available slot
    columns.forEach(colTiles => {
      colTiles.sort((a, b) => a.y - b.y);

      // Check each tile from bottom up
      colTiles.forEach((tile, index) => {
        let lowestY = tile.y;

        // Check slots below tile.y
        for (let targetY = 0; targetY < tile.y; targetY++) {
          // Is targetY occupied by another tile in this column?
          const occupied = colTiles.some(other => other !== tile && Math.abs(other.y - targetY) < 0.4);
          if (!occupied) {
            lowestY = targetY;
            break;
          }
        }

        if (lowestY < tile.y) {
          drops.push({
            tile,
            fromY: tile.y,
            toY: lowestY,
            dropDistance: tile.y - lowestY
          });
          tile.y = lowestY;
        }
      });
    });

    this.updateSelectability();
    return drops;
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
