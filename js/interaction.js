/**
 * User Input & Pointer Interaction Handler
 * Distinguishes between 3D camera drag/rotation vs tile selection click/touch.
 * Includes Multi-Touch gesture isolation (prevents accidental tile clicks during pinch-zoom)
 * and Background Double-Tap detection for auto camera-reset.
 */

export class InteractionHandler {
  constructor(domElement, renderer, onTileClick, onEmptyDoubleTap = null) {
    this.domElement = domElement;
    this.renderer = renderer;
    this.onTileClick = onTileClick;
    this.onEmptyDoubleTap = onEmptyDoubleTap;

    // Multi-touch tracking
    this.activePointers = new Map();
    this.isMultiTouch = false;

    // Double tap tracking for empty space
    this.lastEmptyTapTime = 0;
    this.lastEmptyTapPos = { x: 0, y: 0 };

    // Performance optimizations: cached DOM rect & hover throttling
    this.cachedRect = null;
    this.lastHoverTime = 0;
    this.currentCursor = 'default';

    this.onResize = () => { this.cachedRect = null; };
    window.addEventListener('resize', this.onResize, { passive: true });

    this.initEvents();
  }

  getRect() {
    if (!this.cachedRect) {
      this.cachedRect = this.domElement.getBoundingClientRect();
    }
    return this.cachedRect;
  }

  initEvents() {
    this.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
    this.domElement.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.domElement.addEventListener('pointercancel', (e) => this.onPointerCancel(e));
    this.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
    this.domElement.addEventListener('pointerleave', () => {
      this.cachedRect = null;
      if (this.currentCursor !== 'default') {
        this.currentCursor = 'default';
        this.domElement.style.cursor = 'default';
      }
    });
  }

  onPointerDown(e) {
    // Guarantee updated coordinates on pointer down
    this.cachedRect = this.domElement.getBoundingClientRect();

    // Wake up demand-driven renderer immediately
    if (this.renderer && this.renderer.requestRender) {
      this.renderer.requestRender(60); // request at least 60 frames for smooth drag start
    }

    this.activePointers.set(e.pointerId, {
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      startTime: performance.now(),
      pointerType: e.pointerType,
      hasDragged: false
    });

    if (this.activePointers.size > 1) {
      this.isMultiTouch = true;
    }
  }

  onPointerMove(e) {
    const ptr = this.activePointers.get(e.pointerId);
    if (ptr) {
      ptr.currentX = e.clientX;
      ptr.currentY = e.clientY;
      const dx = e.clientX - ptr.startX;
      const dy = e.clientY - ptr.startY;
      const threshold = (ptr.pointerType === 'touch') ? 14 : 6;
      if (Math.sqrt(dx * dx + dy * dy) > threshold) {
        ptr.hasDragged = true;
      }
      if (this.renderer && this.renderer.requestRender) {
        this.renderer.requestRender(2);
      }
    }

    // Hover cursor for desktop mouse only (throttle raycast to ~45ms, ignore touch events)
    if (e.pointerType === 'mouse' && this.activePointers.size === 0) {
      const now = performance.now();
      if (now - this.lastHoverTime > 45) {
        this.lastHoverTime = now;
        const rect = this.getRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const tileId = this.renderer.raycastTile(normX, normY);
        const nextCursor = (tileId !== null) ? 'pointer' : 'default';
        if (this.currentCursor !== nextCursor) {
          this.currentCursor = nextCursor;
          this.domElement.style.cursor = nextCursor;
        }
      }
    }
  }

  onPointerUp(e) {
    const ptr = this.activePointers.get(e.pointerId);
    const wasMultiTouch = this.isMultiTouch;

    this.activePointers.delete(e.pointerId);

    // Reset multi-touch state once all fingers are lifted
    if (this.activePointers.size === 0) {
      this.isMultiTouch = false;
    }

    // If this gesture sequence involved pinch-to-zoom / multi-touch, IGNORE click!
    if (wasMultiTouch) {
      return;
    }

    if (!ptr) return;

    const dx = e.clientX - ptr.startX;
    const dy = e.clientY - ptr.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = performance.now() - ptr.startTime;

    const threshold = (ptr.pointerType === 'touch') ? 14 : 7;

    // Fast, deliberate tap
    if (dist < threshold && duration < 400 && !ptr.hasDragged) {
      const rect = this.getRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const tileId = this.renderer.raycastTile(normX, normY);

      if (tileId !== null) {
        if (this.onTileClick) {
          this.onTileClick(tileId);
        }
      } else {
        // Empty space tapped -> Check double-tap to reset camera
        const now = performance.now();
        const tapDist = Math.sqrt(
          Math.pow(e.clientX - this.lastEmptyTapPos.x, 2) +
          Math.pow(e.clientY - this.lastEmptyTapPos.y, 2)
        );

        if (now - this.lastEmptyTapTime < 320 && tapDist < 30) {
          if (this.onEmptyDoubleTap) {
            this.onEmptyDoubleTap();
          }
          this.lastEmptyTapTime = 0;
        } else {
          this.lastEmptyTapTime = now;
          this.lastEmptyTapPos = { x: e.clientX, y: e.clientY };
        }
      }
    }
  }

  onPointerCancel(e) {
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size === 0) {
      this.isMultiTouch = false;
    }
  }
}
