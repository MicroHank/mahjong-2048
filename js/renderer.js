/**
 * Three.js 3D Visual Engine for 3D Mahjong 2048
 * Handles WebGL rendering, lighting, dynamic canvas textures, tile meshes, and particle effects.
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

    // Cache of Canvas Textures for numbers: "value_selectable" -> CanvasTexture
    this.textureCache = new Map();
    
    // Meshes map: tileId -> THREE.Mesh
    this.tileMeshes = new Map();

    // Particle pool
    this.particles = [];

    // Animation tickers
    this.activeTweens = [];

    // Shared Reusable Geometry Pools (Eliminates GC stutter on mobile!)
    this.tileBoxGeo = new THREE.BoxGeometry(0.88, 0.45, 0.88);
    this.sphereParticleGeo = new THREE.SphereGeometry(0.045, 5, 5);
    this.trailParticleGeo = new THREE.SphereGeometry(0.035, 4, 4);
    this.shockwaveGeo = new THREE.RingGeometry(0.2, 0.38, 24);
    this.tetraGeo = new THREE.TetrahedronGeometry(0.08);

    this.initThree();
    this.initLighting();
    this.initBoardEnvironment();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
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

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.035);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 11, 14.5);

    // WebGL Renderer with performance-tailored settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile, // Disable MSAA on mobile for huge fill-rate boost
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(width, height);
    // Clamp DPR to 1.5 on mobile to avoid 3x retina fill-rate throttling
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
    this.controls.maxDistance = 24;
    this.controls.target.set(0, 1.2, 0);
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

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
    // Grand Pedestal Platform for Dual Heaps (左右兩堆大平台)
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
  getTileTopTexture(value, isSelectable) {
    const key = `${value}_${isSelectable}`;
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const config = TILE_COLORS[value] || { bg: "#ff5722", text: "#ffffff", border: "#e64a19" };

    // Fill background
    ctx.fillStyle = config.bg;
    ctx.fillRect(0, 0, 512, 512);

    // Inner beveled border
    ctx.lineWidth = 24;
    ctx.strokeStyle = config.border;
    ctx.strokeRect(16, 16, 480, 480);

    // Corner decorative accents (Mahjong aesthetic)
    ctx.fillStyle = config.border;
    const cornerSize = 40;
    ctx.fillRect(20, 20, cornerSize, cornerSize);
    ctx.fillRect(512 - 20 - cornerSize, 20, cornerSize, cornerSize);
    ctx.fillRect(20, 512 - 20 - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(512 - 20 - cornerSize, 512 - 20 - cornerSize, cornerSize, cornerSize);

    // Draw Value Number
    ctx.fillStyle = config.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Choose font size based on digits (Significantly larger & bolder)
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

    // High contrast outline stroke around numbers
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

    // Main text fill with subtle drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    ctx.fillText(textStr, 256, 256);
    ctx.shadowColor = 'transparent';

    // If blocked / inactive: overlay darker veil + padlock icon
    if (!isSelectable) {
      ctx.fillStyle = 'rgba(10, 14, 23, 0.65)';
      ctx.fillRect(0, 0, 512, 512);

      // Draw subtle Lock symbol
      ctx.font = '90px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText("🔒", 256, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Create 3D Mesh for a tile
   */
  createTileMesh(tile) {
    // Shared tile geometry to avoid thousands of allocations
    const geo = this.tileBoxGeo;

    const topTexture = this.getTileTopTexture(tile.value, tile.isSelectable);

    // Body material (sides & bottom: ivory porcelain with gentle specular)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: tile.isSelectable ? 0xf8fafc : 0x94a3b8,
      roughness: 0.35,
      metalness: 0.1,
      transparent: !tile.isSelectable,
      opacity: tile.isSelectable ? 1.0 : 0.7
    });

    // Top face material (+Y index is 2 in BoxGeometry material array)
    const topMat = new THREE.MeshStandardMaterial({
      map: topTexture,
      roughness: 0.3,
      metalness: 0.05,
      transparent: !tile.isSelectable,
      opacity: tile.isSelectable ? 1.0 : 0.75
    });

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
    // Clean old meshes
    this.tileMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      this.safeDisposeGeometry(mesh.geometry);
      mesh.material.forEach(m => m.dispose());
    });
    this.tileMeshes.clear();

    // Create new meshes
    tiles.forEach(tile => {
      const mesh = this.createTileMesh(tile);
      this.scene.add(mesh);
      this.tileMeshes.set(tile.id, mesh);
      tile.mesh = mesh;
    });
  }

  /**
   * Update visual states (colors, textures, selection elevation, glows)
   */
  /**
   * Update visual states (colors, textures, selection elevation, glows)
   */
  updateTileVisuals(tile) {
    const mesh = this.tileMeshes.get(tile.id);
    if (!mesh) return;

    // Update Top face texture
    const newTopTexture = this.getTileTopTexture(tile.value, tile.isSelectable);
    mesh.material[2].map = newTopTexture;
    mesh.material[2].needsUpdate = true;

    // Transparency & body color
    const isSel = tile.isSelectable;
    mesh.material.forEach((mat, idx) => {
      mat.transparent = !isSel;
      mat.opacity = isSel ? 1.0 : 0.68;
      if (idx !== 2) {
        mat.color.setHex(isSel ? 0xf8fafc : 0x64748b);
      }
    });

    // Handle Selection State: Lift up distinctly (+0.38) and emit brilliant golden glow
    const targetY = tile.y * 0.46 + 0.225 + (tile.isSelected ? 0.38 : 0);
    mesh.position.y = targetY;

    if (tile.isSelected) {
      mesh.material.forEach(mat => {
        mat.emissive = new THREE.Color(0xffaa00);
        mat.emissiveIntensity = 0.85;
      });
      if (this.selectionBeacon) {
        this.selectionBeacon.position.set(mesh.position.x, targetY + 0.62, mesh.position.z);
        this.selectionBeacon.visible = true;
      }
    } else {
      mesh.material.forEach(mat => {
        mat.emissive = new THREE.Color(0x000000);
        mat.emissiveIntensity = 0;
      });
    }

    // Check if any tile is currently selected to hide beacon if none
    const anySelected = Array.from(this.tileMeshes.keys()).some(id => {
      const m = this.tileMeshes.get(id);
      return m && m.material[0] && m.material[0].emissiveIntensity > 0.5;
    });
    if (!anySelected && this.selectionBeacon) {
      this.selectionBeacon.visible = false;
    }
  }

  /**
   * Highlight hint pair with pulsating cyan glow
   */
  highlightHintPair(tileA, tileB) {
    [tileA, tileB].forEach(t => {
      const mesh = this.tileMeshes.get(t.id);
      if (mesh) {
        mesh.material.forEach(mat => {
          mat.emissive = new THREE.Color(0x06b6d4);
          mat.emissiveIntensity = 0.75;
        });
      }
    });
  }

  /**
   * Clear hint highlight
   */
  clearHint(tileA, tileB) {
    [tileA, tileB].forEach(t => {
      if (t) this.updateTileVisuals(t);
    });
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
    const points = curve.getPoints(40);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f7ff, // Glowing cyan neon
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    const trajectoryLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(trajectoryLine);

    const duration = Math.min(420, Math.max(260, dist * 50)); // Scaled by distance
    const startTime = performance.now();

    const tween = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      // Follow the 3D parabolic trajectory route
      const curPos = curve.getPoint(ease);
      meshA.position.copy(curPos);
      meshA.rotation.y = ease * Math.PI * 1.5; // Dynamic spin
      meshA.scale.setScalar(1 - progress * 0.25);

      // Emit trail sparks along the flight path
      if (Math.random() < 0.6) {
        this.createTrailParticle(curPos, tileA.value);
      }

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
        // Arrived at tile B!
        // Remove trajectory route line
        this.scene.remove(trajectoryLine);
        lineGeo.dispose();
        lineMat.dispose();

        // 1. Trigger Expanding Ground Shockwave Ring
        this.createShockwave(endPos, tileB.value);

        // 2. Trigger Spark Explosion Particles
        this.createMergeParticles(endPos, tileB.value);

        // 3. Pop & Squash scale bounce on Tile B
        this.animatePop(meshB);

        // Remove meshA from scene
        this.scene.remove(meshA);
        this.safeDisposeGeometry(meshA.geometry);
        meshA.material.forEach(m => m.dispose());
        this.tileMeshes.delete(tileA.id);

        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(tween);
  }

  /**
   * Animate a bouncy pop scale for newly upgraded block
   */
  animatePop(mesh) {
    const startTime = performance.now();
    const duration = 240;

    const tween = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Bounce scale: 1.0 -> 1.35 -> 1.0
      let s = 1.0;
      if (progress < 0.5) {
        s = 1.0 + (progress / 0.5) * 0.35;
      } else {
        s = 1.35 - ((progress - 0.5) / 0.5) * 0.35;
      }
      mesh.scale.set(s, s, s);

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
        mesh.scale.set(1, 1, 1);
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

    const duration = 260; // ms
    const startTime = performance.now();

    const dropStates = drops.map(d => {
      const mesh = this.tileMeshes.get(d.tile.id);
      return {
        mesh,
        startY: d.fromY * 0.46 + 0.225,
        targetY: d.toY * 0.46 + 0.225
      };
    }).filter(d => d.mesh);

    const tween = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Bounce-out ease for gravity
      let ease = progress;
      if (progress < 1) {
        ease = Math.pow(progress, 2); // Acceleration
      }

      dropStates.forEach(d => {
        d.mesh.position.y = d.startY + (d.targetY - d.startY) * ease;
      });

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
        dropStates.forEach(d => {
          d.mesh.position.y = d.targetY;
        });
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(tween);
  }

  /**
   * Trail sparks along the parabolic merge trajectory
   */
  createTrailParticle(pos, value) {
    const geo = this.trailParticleGeo;
    const config = TILE_COLORS[value] || { bg: "#00f7ff" };
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(config.bg) });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(pos);
    p.position.x += (Math.random() - 0.5) * 0.12;
    p.position.y += (Math.random() - 0.5) * 0.12;
    p.position.z += (Math.random() - 0.5) * 0.12;

    this.scene.add(p);
    this.particles.push({
      mesh: p,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      vz: (Math.random() - 0.5) * 0.02,
      life: 0.6,
      decay: 0.06
    });
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

    const tween = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const scale = 1 + progress * 3.4;
      ring.scale.set(scale, scale, 1);
      ring.material.opacity = 0.95 * (1 - Math.pow(progress, 2));

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
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
    const count = this.isMobile ? 16 : 28;
    const config = TILE_COLORS[value] || { bg: "#f59e0b" };
    const color = new THREE.Color(config.bg);

    for (let i = 0; i < count; i++) {
      const geo = this.sphereParticleGeo;
      const mat = new THREE.MeshBasicMaterial({ color: color });
      const p = new THREE.Mesh(geo, mat);
      const s = 0.75 + Math.random() * 0.7;
      p.scale.set(s, s, s);
      p.position.copy(pos);

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.05 + Math.random() * 0.09;
      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = (Math.cos(phi) * 0.5 + 0.5) * speed + 0.04;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      this.scene.add(p);
      this.particles.push({
        mesh: p,
        vx, vy, vz,
        life: 1.0,
        decay: 0.035 + Math.random() * 0.025
      });
    }
  }

  /**
   * 2048 Legendary Supernova Explosion
   */
  create2048Explosion(pos) {
    const count = this.isMobile ? 36 : 70;
    const colors = [0xffd700, 0xff5722, 0xe056fd, 0x00c7b7, 0xffffff];

    for (let i = 0; i < count; i++) {
      const geo = this.tetraGeo;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({ color });
      const p = new THREE.Mesh(geo, mat);
      const s = 0.75 + Math.random() * 0.7;
      p.scale.set(s, s, s);
      p.position.copy(pos);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.08 + Math.random() * 0.14;
      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.cos(phi) * speed + 0.06;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      this.scene.add(p);
      this.particles.push({
        mesh: p,
        vx, vy, vz,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.015
      });
    }
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
    mesh.material.forEach(m => m.dispose());
    this.tileMeshes.delete(tileId);

    if (onComplete) onComplete();
  }

  /**
   * Camera Presets: 'iso', 'top', 'front', 'reset'
   */
  setCameraPreset(type) {
    const target = this.controls.target;
    switch(type) {
      case 'top':
        this.camera.position.set(0, 17, 0.01);
        break;
      case 'front':
        this.camera.position.set(0, 4.5, 15);
        break;
      case 'iso':
      case 'reset':
      default:
        this.camera.position.set(0, 11, 14.5);
        break;
    }
    this.camera.lookAt(target);
    this.controls.update();
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
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Main Render Tick
   */
  animate() {
    requestAnimationFrame(this.animate);

    // Update Controls
    this.controls.update();

    // Animate 3D Selection Beacon
    if (this.selectionBeacon && this.selectionBeacon.visible) {
      this.selectionBeacon.rotation.y += 0.045;
      if (this.selectionBeacon.children[0]) {
        this.selectionBeacon.children[0].rotation.y -= 0.06;
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.mesh.position.z += p.vz;
      p.vy -= 0.003; // Gravity
      p.life -= p.decay;
      p.mesh.scale.setScalar(Math.max(p.life, 0.01));

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.safeDisposeGeometry(p.mesh.geometry);
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
