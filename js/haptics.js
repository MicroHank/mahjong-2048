/**
 * Mobile Haptics Engine (Web Vibration API)
 * Provides tactile feedback for taps, matches, combos, and milestone celebrations.
 */
export class HapticsEngine {
  constructor() {
    this.enabled = true;
    this.hasSupport = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  setEnabled(val) {
    this.enabled = !!val;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this.tap();
    return this.enabled;
  }

  vibrate(pattern) {
    if (!this.enabled || !this.hasSupport) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors on unsupported or security-restricted contexts
    }
  }

  /**
   * Crisp micro-haptic on tile selection
   */
  tap() {
    this.vibrate(10);
  }

  /**
   * Subtle tick on tile deselection
   */
  deselect() {
    this.vibrate(6);
  }

  /**
   * Haptic vibration scaling with tile tier
   * @param {number} value Merged tile value (4, 8, 16, ..., 2048)
   */
  merge(value) {
    if (value >= 1024) {
      this.vibrate([25, 30, 45]);
    } else if (value >= 128) {
      this.vibrate([18, 25, 25]);
    } else {
      this.vibrate(16);
    }
  }

  /**
   * Rapid double-pulse for combo chains
   */
  combo(comboCount = 1) {
    const intensity = Math.min(comboCount * 8, 40);
    this.vibrate([intensity, 20, intensity + 10]);
  }

  /**
   * Epic celebratory pulse for achieving 2048
   */
  supernova() {
    this.vibrate([40, 40, 50, 40, 80, 50, 120]);
  }

  /**
   * Warning double-buzz for blocked/invalid selections or deadlock
   */
  warning() {
    this.vibrate([20, 50, 20]);
  }

  /**
   * Tap on frozen ice stone
   */
  iceHit() {
    this.vibrate(18);
  }

  /**
   * Triple rapid crisp vibration for ice breaking
   */
  iceShatter() {
    this.vibrate([15, 25, 20]);
  }

  /**
   * Level completion fanfare vibration
   */
  victory() {
    this.vibrate([30, 40, 30, 40, 60, 50, 80]);
  }
}
