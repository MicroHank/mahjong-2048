/**
 * Three.js 3D Visual Engine for 3D Mahjong 2048
 * Handles WebGL rendering, lighting, dynamic canvas textures, tile meshes, and particle effects.
 * Optimized with Demand-driven rendering, Shared Material pools, Particle object pooling,
 * and Mobile-tailored camera framing.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Color Palette for 2048 numbers
const TILE_COLORS = {
  2:    { bg: "#ffffff", text: "#0f172a", border: "#cbd5e1" }, // 純淨陶瓷白
  4:    { bg: "#fef08a", text: "#713f12", border: "#facc15" }, // 亮麗檸檬黃
  8:    { bg: "#f97316", text: "#ffffff", border: "#ea580c" }, // 耀眼陽光橘
  16:   { bg: "#ef4444", text: "#ffffff", border: "#dc2626" }, // 熱情赤烈紅
  32:   { bg: "#ec4899", text: "#ffffff", border: "#db2777" }, // 霓虹艷麗粉
  64:   { bg: "#a855f7", text: "#ffffff", border: "#9333ea" }, // 電光幻彩紫
  128:  { bg: "#6366f1", text: "#ffffff", border: "#4f46e5", glow: true }, // 皇室深邃靛
  256:  { bg: "#3b82f6", text: "#ffffff", border: "#2563eb", glow: true }, // 蔚藍天頂藍
  512:  { bg: "#10b981", text: "#ffffff", border: "#059669", glow: true }, // 翡翠極光綠
  1024: { bg: "#06b6d4", text: "#ffffff", border: "#0891b2", glow: true }, // 賽博青碧藍
  2048: { bg: "#ffd700", text: "#ffffff", border: "#f59e0b", glow: true, legendary: true } // 終極耀眼流光金
};

export class GameRenderer {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Mobile detection
    this.isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

    // Demand-driven rendering state (Huge mobile power saver!)
    this.needsRenderFrames = 90;
    this.activeAnimationCount = 0;

    // Cache of Canvas Textures for numbers: "value_selectable" -> CanvasTexture
    this.textureCache = new Map();
    
    // Top Material Cache: "value_selectable" -> MeshStandardMaterial
    this.topMatCache = new Map();

    // Meshes map: tileId -> THREE.Mesh
    this.tileMeshes = new Map();

    // Active Particles & Reusable Particle Pool (Eliminates GC lag!)
    this.particles = [];
    this.particlePool = [];

    // Active animation trackers & trajectory lines
    this.activeTweens = [];
    this.activeTrajectoryLines = [];

    // Shared Reusable Geometry Pools
    this.tileBoxGeo = new THREE.BoxGeometry(0.88, 0.45, 0.88);
    this.sphereParticleGeo = new THREE.SphereGeometry(0.045, 5, 5);
    this.trailParticleGeo = new THREE.SphereGeometry(0.035, 4, 4);
    this.shockwaveGeo = new THREE.RingGeometry(0.2, 0.38, 24);
    this.tetraGeo = new THREE.TetrahedronGeometry(0.08);

    // Shared Body Materials (Sides & Bottom)
    this.sharedSelectableBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.1,
      transparent: false,
      opacity: 1.0
    });

    this.sharedUnselectableBodyMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.68
    });

    this.sharedFrozenBodyMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.15,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92
    });

    this.initThree();
    this.initLighting();
    this.initBoardEnvironment();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  /**
   * Request frames to be rendered (wakes up demand-driven loop)
   */
  requestRender(frames = 30) {
    this.needsRenderFrames = Math.max(this.needsRenderFrames, frames);
  }

  /**
   * Safely disposes geometry only if it is NOT part of the shared pools
   */
  safeDisposeGeometry(geo) {
    if (!geo) return;
    if (geo !== this.tileBoxGeo &&
        geo !== this.sphereParticleGeo &&
        geo !== this.trailParticleGeo &&
        geo !== this.shockwaveGeo &&
        geo !== this.tetraGeo) {
      geo.dispose();
    }
  }

  initThree() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const isPortrait = height > width;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.032);

    // Camera with portrait adaptive distance
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, isPortrait ? 13 : 11, isPortrait ? 17.5 : 14.5);

    // WebGL Renderer with performance-tailored settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls tailored for mobile touch
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go underground
    this.controls.minDistance = 5;
    this.controls.maxDistance = 28;
    this.controls.target.set(0, 1.2, 0);
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    // Wake up render loop on controls interaction
    this.controls.addEventListener('change', () => {
      this.requestRender(10);
    });

    // Window resize
    window.addEventListener('resize', () => this.onResize());
  }

  initLighting() {
    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xdce7f5, 0.85);
    this.scene.add(ambientLight);

    // Main Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    sunLight.position.set(8, 16, 10);
    sunLight.castShadow = true;
    const shadowRes = this.isMobile ? 1024 : 2048;
    sunLight.shadow.mapSize.width = shadowRes;
    sunLight.shadow.mapSize.height = shadowRes;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 35;
    sunLight.shadow.camera.left = -7;
    sunLight.shadow.camera.right = 7;
    sunLight.shadow.camera.top = 7;
    sunLight.shadow.camera.bottom = -7;
    sunLight.shadow.bias = -0.0008;
    this.scene.add(sunLight);

    // Fill Light from opposite side
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-8, 6, -8);
    this.scene.add(fillLight);

    // Subtle warm center accent
    const centerGlow = new THREE.PointLight(0xf59e0b, 0.4, 15);
    centerGlow.position.set(0, 4, 0);
    this.scene.add(centerGlow);
  }

  initBoardEnvironment() {
    // Grand Pedestal Platform for Dual Heaps
    const pedestalGeo = new THREE.CylinderGeometry(7.2, 7.8, 0.45, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.7,
      metalness: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.23;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);

    // Cyber Grid on the pedestal
    const gridHelper = new THREE.GridHelper(13, 26, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);

    // Glowing rim ring
    const ringGeo = new THREE.RingGeometry(7.15, 7.35, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.scene.add(ring);

    // 3D Selection Beacon (Floating Glowing Diamond & Rotating Cyber Ring)
    const beaconGroup = new THREE.Group();

    // Floating Golden Diamond
    const diamondGeo = new THREE.OctahedronGeometry(0.2, 0);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: 0xffd700
    });
    const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
    diamondMesh.position.y = 0.05;
    beaconGroup.add(diamondMesh);

    // Cyan Cyber Ring
    const haloGeo = new THREE.TorusGeometry(0.38, 0.03, 8, 28);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.9
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    beaconGroup.add(haloMesh);

    beaconGroup.visible = false;
    this.scene.add(beaconGroup);
    this.selectionBeacon = beaconGroup;
  }

  /**
   * Generates or fetches dynamic canvas texture for top of tile
   */
  getTileTopTexture(value, isSelectable, isFrozen = false) {
    const key = `${value}_${isSelectable}_${isFrozen}`;
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const config = TILE_COLORS[value] || { bg: "#ff5722", text: "#ffffff", border: "#e64a19" };

    if (isFrozen) {
      // Ice crystal background gradient
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#c7e6fc');
      grad.addColorStop(0.5, '#7dd3fc');
      grad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Frost white outer border
      ctx.lineWidth = 26;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(16, 16, 480, 480);

      // Inner icy cyan border
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.7)';
      ctx.strokeRect(34, 34, 444, 444);

      // Corner ice crystals
      ctx.fillStyle = '#ffffff';
      const cornerSize = 44;
      ctx.fillRect(20, 20, cornerSize, cornerSize);
      ctx.fillRect(512 - 20 - cornerSize, 20, cornerSize, cornerSize);
      ctx.fillRect(20, 512 - 20 - cornerSize, cornerSize, cornerSize);
      ctx.fillRect(512 - 20 - cornerSize, 512 - 20 - cornerSize, cornerSize, cornerSize);

      // Frost crack lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(60, 80); ctx.lineTo(190, 180); ctx.lineTo(140, 290);
      ctx.moveTo(450, 90); ctx.lineTo(330, 210); ctx.lineTo(390, 340);
      ctx.moveTo(110, 440); ctx.lineTo(240, 360); ctx.lineTo(370, 430);
      ctx.stroke();

      // Number in ice
      const textStr = value.toString();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (textStr.length === 1) ctx.font = '900 240px Outfit, sans-serif';
      else if (textStr.length === 2) ctx.font = '900 200px Outfit, sans-serif';
      else if (textStr.length === 3) ctx.font = '900 165px Outfit, sans-serif';
      else ctx.font = '900 135px Outfit, sans-serif';

      ctx.lineWidth = 14;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(textStr, 256, 285);

      ctx.fillStyle = '#0369a1';
      ctx.fillText(textStr, 256, 285);

      // Top Frost Crystal Emblem ❄️
      ctx.font = 'bold 96px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = 'rgba(14, 165, 233, 0.9)';
      ctx.shadowBlur = 18;
      ctx.fillText("❄️", 256, 125);
      ctx.shadowColor = 'transparent';
    } else {
      // Normal Tile
      ctx.fillStyle = config.bg;
      ctx.fillRect(0, 0, 512, 512);

      ctx.lineWidth = 24;
      ctx.strokeStyle = config.border;
      ctx.strokeRect(16, 16, 480, 480);

      ctx.fillStyle = config.border;
      const cornerSize = 40;
      ctx.fillRect(20, 20, cornerSize, cornerSize);
      ctx.fillRect(512 - 20 - cornerSize, 20, cornerSize, cornerSize);
      ctx.fillRect(20, 512 - 20 - cornerSize, cornerSize, cornerSize);
      ctx.fillRect(512 - 20 - cornerSize, 512 - 20 - cornerSize, cornerSize, cornerSize);

      ctx.fillStyle = config.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textStr = value.toString();
      if (textStr.length === 1) {
        ctx.font = '900 270px Outfit, sans-serif';
      } else if (textStr.length === 2) {
        ctx.font = '900 230px Outfit, sans-serif';
      } else if (textStr.length === 3) {
        ctx.font = '900 185px Outfit, sans-serif';
      } else {
        ctx.font = '900 150px Outfit, sans-serif';
      }

      ctx.lineJoin = 'round';
      if (config.text === '#ffffff') {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = (textStr.length <= 2) ? 14 : 10;
        ctx.strokeText(textStr, 256, 256);
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 12;
        ctx.strokeText(textStr, 256, 256);
      }

      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.fillText(textStr, 256, 256);
      ctx.shadowColor = 'transparent';

      if (!isSelectable) {
        ctx.fillStyle = 'rgba(10, 14, 23, 0.7)';
        ctx.fillRect(0, 0, 512, 512);

        ctx.font = '90px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText("🔒", 256, 256);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Cached Top Face Material
   */
  getTopMaterial(value, isSelectable, isFrozen = false) {
    const key = `${value}_${isSelectable}_${isFrozen}`;
    if (this.topMatCache.has(key)) {
      return this.topMatCache.get(key);
    }
    const texture = this.getTileTopTexture(value, isSelectable, isFrozen);
    const topMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: isFrozen ? 0.15 : 0.3,
      metalness: isFrozen ? 0.25 : 0.05,
      transparent: isFrozen || !isSelectable,
      opacity: isFrozen ? 0.95 : (isSelectable ? 1.0 : 0.75)
    });
    this.topMatCache.set(key, topMat);
    return topMat;
  }

  /**
   * Create 3D Mesh for a tile using pooled shared materials
   */
  createTileMesh(tile) {
    const geo = this.tileBoxGeo;
    let bodyMat;
    if (tile.isFrozen) {
      bodyMat = this.sharedFrozenBodyMat;
    } else if (tile.isSelectable) {
      bodyMat = this.sharedSelectableBodyMat;
    } else {
      bodyMat = this.sharedUnselectableBodyMat;
    }

    const topMat = this.getTopMaterial(tile.value, tile.isSelectable, tile.isFrozen);

    // Materials array for BoxGeometry: [+X, -X, +Y, -Y, +Z, -Z]
    const materials = [
      bodyMat, // right
      bodyMat, // left
      topMat,  // top (Number face)
      bodyMat, // bottom
      bodyMat, // front
      bodyMat  // back
    ];

    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(tile.x, tile.y * 0.46 + 0.225, tile.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { tileId: tile.id };

    return mesh;
  }

  /**
   * Build or rebuild the entire board from tile objects
   */
  renderBoard(tiles) {
    this.cancelAllAnimations();

    // Clean old meshes
    this.tileMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      this.safeDisposeGeometry(mesh.geometry);
    });
    this.tileMeshes.clear();

    // Create new meshes
    tiles.forEach(tile => {
      const mesh = this.createTileMesh(tile);
      this.scene.add(mesh);
      this.tileMeshes.set(tile.id, mesh);
      tile.mesh = mesh;
    });

    if (this.selectionBeacon) {
      this.selectionBeacon.visible = false;
    }

    this.requestRender(60);
  }

  /**
   * Update visual states (colors, textures, selection elevation, glows, ice)
   */
  updateTileVisuals(tile) {
    const mesh = this.tileMeshes.get(tile.id);
    if (!mesh) return;

    let bodyMat;
    let topMat;

    if (tile.isFrozen) {
      bodyMat = this.sharedFrozenBodyMat;
      topMat = this.getTopMaterial(tile.value, false, true);
    } else if (tile.isSelectable) {
      bodyMat = this.sharedSelectableBodyMat;
      topMat = this.getTopMaterial(tile.value, true, false);
    } else {
      bodyMat = this.sharedUnselectableBodyMat;
      topMat = this.getTopMaterial(tile.value, false, false);
    }

    // Target Elevation
    const targetY = tile.y * 0.46 + 0.225 + (tile.isSelected ? 0.38 : 0);
    mesh.position.y = targetY;

    if (tile.isSelected && !tile.isFrozen) {
      // Selected tile gets a dedicated cloned material set to display golden glow
      const selBodyMat = bodyMat.clone();
      const selTopMat = topMat.clone();
      selBodyMat.emissive = new THREE.Color(0xffaa00);
      selBodyMat.emissiveIntensity = 0.85;
      selTopMat.emissive = new THREE.Color(0xffaa00);
      selTopMat.emissiveIntensity = 0.65;

      mesh.material = [selBodyMat, selBodyMat, selTopMat, selBodyMat, selBodyMat, selBodyMat];

      if (this.selectionBeacon) {
        this.selectionBeacon.position.set(mesh.position.x, targetY + 0.62, mesh.position.z);
        this.selectionBeacon.visible = true;
      }
    } else {
      // Restore standard pooled materials
      mesh.material = [bodyMat, bodyMat, topMat, bodyMat, bodyMat, bodyMat];
    }

    // Check if any tile is currently selected to hide beacon if none
    const anySelected = Array.from(this.tileMeshes.keys()).some(id => {
      const m = this.tileMeshes.get(id);
      return m && m.position.y > (tile.y * 0.46 + 0.23);
    });
    if (!anySelected && this.selectionBeacon && !tile.isSelected) {
      this.selectionBeacon.visible = false;
    }

    this.requestRender(40);
  }

  /**
   * Tactile shake animation when hitting an impassable wall or trapped tile
   */
  animateShake(tile) {
    const mesh = this.tileMeshes.get(tile.id);
    if (!mesh) return;

    const startX = mesh.position.x;
    const offsets = [-0.035, 0.035, -0.025, 0.02, 0];
    let step = 0;

    const shakeInterval = setInterval(() => {
      if (step < offsets.length) {
        mesh.position.x = startX + offsets[step];
        this.requestRender(4);
        step++;
      } else {
        mesh.position.x = startX;
        clearInterval(shakeInterval);
        this.requestRender(4);
      }
    }, 28);
  }

  /**
   * Blocked Route Animation (Laser obstruction warning line + blocker shake & red flash)
   */
  animateBlockedRoute(tileA, tileB, blockerTile, onComplete) {
    const meshA = this.tileMeshes.get(tileA.id);
    const meshB = this.tileMeshes.get(tileB.id);
    const actualBlocker = (blockerTile && blockerTile.id) 
      ? blockerTile 
      : (blockerTile && blockerTile.blocker ? blockerTile.blocker : null);
    const blockerMesh = actualBlocker ? this.tileMeshes.get(actualBlocker.id) : null;

    if (!meshA || !meshB) {
      if (onComplete) onComplete();
      return;
    }

    this.activeAnimationCount++;

    // 1. Shake Tile A and Tile B
    this.animateShake(tileA);
    this.animateShake(tileB);

    // 2. Draw Red Obstruction Warning Line
    const startPos = meshA.position.clone();
    startPos.y += 0.25;
    const endPos = meshB.position.clone();
    endPos.y += 0.25;

    let midPos;
    if (blockerMesh) {
      midPos = blockerMesh.position.clone();
      midPos.y += 0.3;
    } else {
      midPos = startPos.clone().add(endPos).multiplyScalar(0.5);
      midPos.y += 0.8;
    }

    const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);
    const points = curve.getPoints(this.isMobile ? 20 : 30);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xff1744, // Neon Crimson Red
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    const warningLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(warningLine);

    // 3. Red Sparks at the obstruction point
    const sparkCenter = blockerMesh ? blockerMesh.position.clone() : midPos;
    const sparkCount = this.isMobile ? 12 : 20;
    const redColors = [0xff1744, 0xff5252, 0xff9100, 0xffd600];

    for (let i = 0; i < sparkCount; i++) {
      const colorHex = redColors[Math.floor(Math.random() * redColors.length)];
      const pObj = this.getPooledParticle(this.tetraGeo, colorHex);
      const s = 0.65 + Math.random() * 0.6;
      pObj.mesh.scale.set(s, s, s);
      pObj.mesh.position.copy(sparkCenter);
      pObj.mesh.position.y += 0.2;

      const theta = Math.random() * Math.PI * 2;
      const speed = 0.04 + Math.random() * 0.08;
      const vx = Math.cos(theta) * speed;
      const vy = 0.04 + Math.random() * 0.07;
      const vz = Math.sin(theta) * speed;

      this.particles.push({
        mesh: pObj.mesh,
        mat: pObj.mat,
        vx, vy, vz,
        life: 1.0,
        decay: 0.045 + Math.random() * 0.025
      });
    }

    // 4. Highlight & Shake blocker tile
    let originalBlockerMats = null;
    if (blockerMesh && Array.isArray(blockerMesh.material)) {
      originalBlockerMats = blockerMesh.material;
      const redMat = (blockerMesh.material[0] || this.sharedSelectableBodyMat).clone();
      redMat.emissive = new THREE.Color(0xff1744);
      redMat.emissiveIntensity = 0.9;
      const redTopMat = (blockerMesh.material[2] || this.getTopMaterial(actualBlocker.value, true)).clone();
      redTopMat.emissive = new THREE.Color(0xff1744);
      redTopMat.emissiveIntensity = 0.8;
      blockerMesh.material = [redMat, redMat, redTopMat, redMat, redMat, redMat];

      if (actualBlocker) {
        this.animateShake(actualBlocker);
      }
    }

    this.requestRender(45);

    // Auto cleanup after warning flash
    setTimeout(() => {
      this.scene.remove(warningLine);
      lineGeo.dispose();
      lineMat.dispose();

      if (blockerMesh && originalBlockerMats) {
        this.updateTileVisuals(blockerTile);
      }

      this.activeAnimationCount = Math.max(0, this.activeAnimationCount - 1);
      this.requestRender(10);
      if (onComplete) onComplete();
    }, 550);
  }

  /**
   * Animate Ice Shatter / Break Effect for defrosted tile
   */
  animateIceShatter(tile, onComplete) {
    const mesh = this.tileMeshes.get(tile.id);
    if (!mesh) {
      if (onComplete) onComplete();
      return;
    }

    const pos = mesh.position.clone();
    const count = this.isMobile ? 18 : 28;
    const iceColors = [0xffffff, 0xe0f2fe, 0xbae6fd, 0x38bdf8, 0x7dd3fc];

    for (let i = 0; i < count; i++) {
      const colorHex = iceColors[Math.floor(Math.random() * iceColors.length)];
      const pObj = this.getPooledParticle(this.tetraGeo, colorHex);
      const s = 0.8 + Math.random() * 0.8;
      pObj.mesh.scale.set(s, s, s);
      pObj.mesh.position.copy(pos);
      pObj.mesh.position.y += 0.15;

      // Burst upwards and outwards
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.55;
      const speed = 0.06 + Math.random() * 0.11;
      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.cos(phi) * speed + 0.05;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      this.particles.push({
        mesh: pObj.mesh,
        mat: pObj.mat,
        vx, vy, vz,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.02
      });
    }

    // Immediately update visuals to unfrozen state and bounce
    this.updateTileVisuals(tile);
    this.animatePop(mesh);

    this.requestRender(50);
    if (onComplete) onComplete();
  }

  /**
   * Highlight hint pair with pulsating cyan glow
   */
  highlightHintPair(tileA, tileB) {
    [tileA, tileB].forEach(t => {
      if (!t) return;
      const mesh = this.tileMeshes.get(t.id);
      if (mesh) {
        const hintMat = (mesh.material[0] || this.sharedSelectableBodyMat).clone();
        const hintTopMat = (mesh.material[2] || this.getTopMaterial(t.value, true)).clone();
        hintMat.emissive = new THREE.Color(0x06b6d4);
        hintMat.emissiveIntensity = 0.75;
        hintTopMat.emissive = new THREE.Color(0x06b6d4);
        hintTopMat.emissiveIntensity = 0.65;
        mesh.material = [hintMat, hintMat, hintTopMat, hintMat, hintMat, hintMat];
      }
    });
    this.requestRender(60);
  }

  /**
   * Clear hint highlight
   */
  clearHint(tileA, tileB) {
    [tileA, tileB].forEach(t => {
      if (t) this.updateTileVisuals(t);
    });
    this.requestRender(20);
  }

  /**
   * Animate tile A flying into tile B with 3D Trajectory Route Line and Impact FX!
   */
  animateMerge(tileA, tileB, onComplete) {
    const meshA = this.tileMeshes.get(tileA.id);
    const meshB = this.tileMeshes.get(tileB.id);

    if (!meshA || !meshB) {
      if (onComplete) onComplete();
      return;
    }

    // Hide selection beacon immediately
    if (this.selectionBeacon) {
      this.selectionBeacon.visible = false;
    }

    const startPos = meshA.position.clone();
    const endPos = meshB.position.clone();
    const dist = startPos.distanceTo(endPos);

    // Calculate dynamic arc peak based on distance
    const midPos = startPos.clone().add(endPos).multiplyScalar(0.5);
    midPos.y = Math.max(startPos.y, endPos.y) + Math.min(2.8, 1.0 + dist * 0.22);

    // Create 3D Luminous Trajectory Route Line (光弧能量路線)
    const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);
    const points = curve.getPoints(this.isMobile ? 24 : 36);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f7ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    const trajectoryLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(trajectoryLine);
    this.activeTrajectoryLines.push(trajectoryLine);

    const duration = Math.min(420, Math.max(260, dist * 50));
    const startTime = performance.now();
    this.activeAnimationCount++;

    let isCancelled = false;
    const cancelFn = () => {
      isCancelled = true;
      this.scene.remove(trajectoryLine);
      lineGeo.dispose();
      lineMat.dispose();
    };
    this.activeTweens.push(cancelFn);

    const tween = (now) => {
      if (isCancelled) {
        this.activeAnimationCount = Math.max(0, this.activeAnimationCount - 1);
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      const curPos = curve.getPoint(ease);
      meshA.position.copy(curPos);
      meshA.rotation.y = ease * Math.PI * 1.5;
      meshA.scale.setScalar(1 - progress * 0.25);

      // Emit trail sparks along flight path
      if (Math.random() < 0.6) {
        this.createTrailParticle(curPos, tileA.value);
      }

      this.requestRender(5);

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
        this.activeAnimationCount = Math.max(0, this.activeAnimationCount - 1);
        const idx = this.activeTweens.indexOf(cancelFn);
        if (idx !== -1) this.activeTweens.splice(idx, 1);

        // Remove trajectory route line
        this.scene.remove(trajectoryLine);
        const lineIdx = this.activeTrajectoryLines.indexOf(trajectoryLine);
        if (lineIdx !== -1) this.activeTrajectoryLines.splice(lineIdx, 1);
        lineGeo.dispose();
        lineMat.dispose();

        // 1. Shockwave Ring
        this.createShockwave(endPos, tileB.value);

        // 2. Spark Explosion
        this.createMergeParticles(endPos, tileB.value);

        // 3. Pop bounce on Tile B
        this.animatePop(meshB);

        // Remove meshA from scene
        this.scene.remove(meshA);
        this.safeDisposeGeometry(meshA.geometry);
        this.tileMeshes.delete(tileA.id);

        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(tween);
  }

  /**
   * Animate bouncy pop scale for newly upgraded block
   */
  animatePop(mesh) {
    if (!mesh) return;
    const startTime = performance.now();
    const duration = 240;
    this.activeAnimationCount++;

    const tween = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      let s = 1.0;
      if (progress < 0.5) {
        s = 1.0 + (progress / 0.5) * 0.35;
      } else {
        s = 1.35 - ((progress - 0.5) / 0.5) * 0.35;
      }
      mesh.scale.set(s, s, s);
      this.requestRender(3);

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
        mesh.scale.set(1, 1, 1);
        this.activeAnimationCount = Math.max(0, this.activeAnimationCount - 1);
      }
    };
    requestAnimationFrame(tween);
  }

  /**
   * Animate multiple falling tiles due to gravity
   */
  animateGravityDrops(drops, onComplete) {
    if (!drops || drops.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const duration = 260;
    const startTime = performance.now();
    this.activeAnimationCount++;

    const dropStates = drops.map(d => {
      const mesh = this.tileMeshes.get(d.tile.id);
      return {
        mesh,
        startY: d.fromY * 0.46 + 0.225,
        targetY: d.toY * 0.46 + 0.225
      };
    }).filter(d => d.mesh);

    let isCancelled = false;
    const cancelFn = () => { isCancelled = true; };
    this.activeTweens.push(cancelFn);

    const tween = (now) => {
      if (isCancelled) {
        this.activeAnimationCount = Math.max(0, this.activeAnimationCount - 1);
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = (progress < 1) ? Math.pow(progress, 2) : 1;

      dropStates.forEach(d => {
        d.mesh.position.y = d.startY + (d.targetY - d.startY) * ease;
      });

      this.requestRender(4);

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
        this.activeAnimationCount = Math.max(0, this.activeAnimationCount - 1);
        const idx = this.activeTweens.indexOf(cancelFn);
        if (idx !== -1) this.activeTweens.splice(idx, 1);

        dropStates.forEach(d => {
          d.mesh.position.y = d.targetY;
        });
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(tween);
  }

  /**
   * Particle retrieval from Object Pool (recycles meshes to avoid GC stutter)
   */
  getPooledParticle(geo, colorHex) {
    let pObj = this.particlePool.pop();
    if (!pObj) {
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      const mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh);
      pObj = { mesh, mat };
    } else {
      pObj.mesh.geometry = geo;
      pObj.mat.color.setHex(colorHex);
      pObj.mesh.visible = true;
    }
    return pObj;
  }

  /**
   * Trail sparks along the parabolic merge trajectory
   */
  createTrailParticle(pos, value) {
    const config = TILE_COLORS[value] || { bg: "#00f7ff" };
    const colorHex = parseInt(config.bg.replace("#", "0x"), 16);
    const pObj = this.getPooledParticle(this.trailParticleGeo, colorHex);

    pObj.mesh.position.copy(pos);
    pObj.mesh.position.x += (Math.random() - 0.5) * 0.12;
    pObj.mesh.position.y += (Math.random() - 0.5) * 0.12;
    pObj.mesh.position.z += (Math.random() - 0.5) * 0.12;
    pObj.mesh.scale.set(1, 1, 1);

    this.particles.push({
      mesh: pObj.mesh,
      mat: pObj.mat,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      vz: (Math.random() - 0.5) * 0.02,
      life: 0.6,
      decay: 0.06
    });

    this.requestRender(20);
  }

  /**
   * Expanding glowing shockwave ring on merge impact
   */
  createShockwave(pos, value) {
    const geo = this.shockwaveGeo;
    const config = TILE_COLORS[value] || { bg: "#00f7ff" };
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.bg),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(pos);
    ring.position.y += 0.04;
    this.scene.add(ring);

    const startTime = performance.now();
    const duration = 360;
    this.activeAnimationCount++;

    const tween = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const scale = 1 + progress * 3.4;
      ring.scale.set(scale, scale, 1);
      ring.material.opacity = 0.95 * (1 - Math.pow(progress, 2));

      this.requestRender(4);

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
        this.activeAnimationCount = Math.max(0, this.activeAnimationCount - 1);
        this.scene.remove(ring);
        this.safeDisposeGeometry(geo);
        mat.dispose();
      }
    };
    requestAnimationFrame(tween);
  }

  /**
   * Particle burst effect for merges
   */
  createMergeParticles(pos, value) {
    const count = this.isMobile ? 14 : 24;
    const config = TILE_COLORS[value] || { bg: "#f59e0b" };
    const colorHex = parseInt(config.bg.replace("#", "0x"), 16);

    for (let i = 0; i < count; i++) {
      const pObj = this.getPooledParticle(this.sphereParticleGeo, colorHex);
      const s = 0.75 + Math.random() * 0.7;
      pObj.mesh.scale.set(s, s, s);
      pObj.mesh.position.copy(pos);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.05 + Math.random() * 0.09;
      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = (Math.cos(phi) * 0.5 + 0.5) * speed + 0.04;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      this.particles.push({
        mesh: pObj.mesh,
        mat: pObj.mat,
        vx, vy, vz,
        life: 1.0,
        decay: 0.035 + Math.random() * 0.025
      });
    }

    this.requestRender(35);
  }

  /**
   * 2048 Legendary Supernova Explosion
   */
  create2048Explosion(pos) {
    const count = this.isMobile ? 32 : 60;
    const colors = [0xffd700, 0xff5722, 0xe056fd, 0x00c7b7, 0xffffff];

    for (let i = 0; i < count; i++) {
      const colorHex = colors[Math.floor(Math.random() * colors.length)];
      const pObj = this.getPooledParticle(this.tetraGeo, colorHex);
      const s = 0.75 + Math.random() * 0.7;
      pObj.mesh.scale.set(s, s, s);
      pObj.mesh.position.copy(pos);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.08 + Math.random() * 0.14;
      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.cos(phi) * speed + 0.06;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      this.particles.push({
        mesh: pObj.mesh,
        mat: pObj.mat,
        vx, vy, vz,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.015
      });
    }

    this.requestRender(60);
  }

  /**
   * Remove a tile with explosion
   */
  dissolveTile(tileId, onComplete) {
    const mesh = this.tileMeshes.get(tileId);
    if (!mesh) {
      if (onComplete) onComplete();
      return;
    }

    this.create2048Explosion(mesh.position);
    this.scene.remove(mesh);
    this.safeDisposeGeometry(mesh.geometry);
    this.tileMeshes.delete(tileId);

    if (onComplete) onComplete();
    this.requestRender(60);
  }

  /**
   * Camera Presets: 'iso', 'top', 'front', 'reset' with mobile portrait adaptivity
   */
  setCameraPreset(type) {
    const isPortrait = window.innerHeight > window.innerWidth;
    const target = this.controls.target;
    switch(type) {
      case 'top':
        this.camera.position.set(0, isPortrait ? 19.5 : 17, 0.01);
        break;
      case 'front':
        this.camera.position.set(0, 4.5, isPortrait ? 17.5 : 15);
        break;
      case 'iso':
      case 'reset':
      default:
        this.camera.position.set(0, isPortrait ? 13 : 11, isPortrait ? 17.5 : 14.5);
        break;
    }
    this.camera.lookAt(target);
    this.controls.update();
    this.requestRender(60);
  }

  /**
   * Raycast tile at screen coordinate (x, y normalized [-1, 1])
   */
  raycastTile(normX, normY) {
    this.mouse.x = normX;
    this.mouse.y = normY;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const meshes = Array.from(this.tileMeshes.values());
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      return hitMesh.userData.tileId || null;
    }
    return null;
  }

  onResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || width < 768;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.requestRender(30);
  }

  /**
   * Cancel and cleanup any running animations and temporary effects
   */
  cancelAllAnimations() {
    this.activeTweens.forEach(fn => {
      try { fn(); } catch {}
    });
    this.activeTweens = [];
    this.activeAnimationCount = 0;

    this.activeTrajectoryLines.forEach(line => {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    this.activeTrajectoryLines = [];

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.visible = false;
      this.particlePool.push({ mesh: p.mesh, mat: p.mat });
    }
    this.particles = [];
    this.requestRender(10);
  }

  /**
   * Update active particles and recycle dead ones to pool
   */
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.mesh.position.z += p.vz;
      p.vy -= 0.003;
      p.life -= p.decay;
      p.mesh.scale.setScalar(Math.max(p.life, 0.01));

      if (p.life <= 0) {
        p.mesh.visible = false;
        this.particlePool.push({ mesh: p.mesh, mat: p.mat });
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Demand-driven Main Render Loop
   * Renders only when dirty, during animations, or while camera is moving.
   */
  animate() {
    requestAnimationFrame(this.animate);

    // controls.update() returns true when camera position/rotation changes
    const controlsMoved = this.controls.update();
    if (controlsMoved) {
      this.needsRenderFrames = Math.max(this.needsRenderFrames, 8);
    }

    const hasActiveParticles = this.particles.length > 0;
    const hasActiveTweens = this.activeAnimationCount > 0;
    const isBeaconActive = this.selectionBeacon && this.selectionBeacon.visible;

    // Check if render frame is necessary
    if (controlsMoved || hasActiveParticles || hasActiveTweens || isBeaconActive || this.needsRenderFrames > 0) {
      if (this.needsRenderFrames > 0) {
        this.needsRenderFrames--;
      }

      // Animate 3D Selection Beacon
      if (isBeaconActive) {
        this.selectionBeacon.rotation.y += 0.045;
        if (this.selectionBeacon.children[0]) {
          this.selectionBeacon.children[0].rotation.y -= 0.06;
        }
      }

      // Update active particles
      if (hasActiveParticles) {
        this.updateParticles();
      }

      this.renderer.render(this.scene, this.camera);
    }
  }
}
