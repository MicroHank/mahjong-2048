/**
 * User Input & Pointer Interaction Handler
 * Distinguishes between 3D camera drag/rotation vs tile selection click/touch.
 */

export class InteractionHandler {
  constructor(domElement, renderer, onTileClick) {
    this.domElement = domElement;
    this.renderer = renderer;
    this.onTileClick = onTileClick;

    this.pointerDownPos = { x: 0, y: 0 };
    this.pointerDownTime = 0;
    this.isPointerDown = false;
    this.dragThreshold = 8; // pixels

    this.initEvents();
  }

  initEvents() {
    this.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: true });
    this.domElement.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.domElement.addEventListener('pointercancel', () => { this.isPointerDown = false; });
    this.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
  }

  onPointerDown(e) {
    this.isPointerDown = true;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.pointerDownTime = performance.now();
  }

  onPointerUp(e) {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = performance.now() - this.pointerDownTime;

    // Mobile touch has slightly larger fingertip contact area
    const threshold = (e.pointerType === 'touch') ? 16 : 8;

    // If moved very little and tapped quickly, it's a deliberate click!
    if (dist < threshold && duration < 500) {
      const rect = this.domElement.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const tileId = this.renderer.raycastTile(normX, normY);
      if (tileId !== null && this.onTileClick) {
        this.onTileClick(tileId);
      }
    }
  }

  onPointerMove(e) {
    // Update cursor style when hovering over selectable tiles on desktop
    if (e.pointerType === 'mouse') {
      const rect = this.domElement.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const tileId = this.renderer.raycastTile(normX, normY);
      if (tileId !== null) {
        this.domElement.style.cursor = 'pointer';
      } else {
        this.domElement.style.cursor = 'default';
      }
    }
  }
}
