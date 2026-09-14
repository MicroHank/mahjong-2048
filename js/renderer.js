/**
 * Three.js 3D Visual Engine for 3D Mahjong 2048
 * Handles WebGL rendering, lighting, dynamic canvas textures, tile meshes, and particle effects.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Color Palette for 2048 numbers
const TILE_COLORS = {
  2:    { bg: "#f4ede4", text: "#685b52", border: "#e0d3c6" },
  4:    { bg: "#ede0c8", text: "#685b52", border: "#decbaf" },
  8:    { bg: "#f2b179", text: "#ffffff", border: "#e89f61" },
  16:   { bg: "#f59563", text: "#ffffff", border: "#e87c44" },
  32:   { bg: "#f67c5f", text: "#ffffff", border: "#e55f3f" },
  64:   { bg: "#f65e3b", text: "#ffffff", border: "#d9421e" },
  128:  { bg: "#edcf72", text: "#ffffff", border: "#d4b350", glow: true },
  256:  { bg: "#edcc61", text: "#ffffff", border: "#cca83b", glow: true },
  512:  { bg: "#4cd964", text: "#ffffff", border: "#34b84b", glow: true },
  1024: { bg: "#00c7b7", text: "#ffffff", border: "#00a194", glow: true },
  2048: { bg: "#ffd700", text: "#ffffff", border: "#ff9900", glow: true, legendary: true }
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

    // Cache of Canvas Textures for numbers: "value_selectable" -> CanvasTexture
    this.textureCache = new Map();
    
    // Meshes map: tileId -> THREE.Mesh
    this.tileMeshes = new Map();

    // Particle pool
    this.particles = [];

    // Animation tickers
    this.activeTweens = [];

    this.initThree();
    this.initLighting();
    this.initBoardEnvironment();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.04);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 8, 11);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go underground
    this.controls.minDistance = 4;
    this.controls.maxDistance = 22;
    this.controls.target.set(0, 1.2, 0);

    // Window resize
    window.addEventListener('resize', () => this.onResize());
  }

  initLighting() {
    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xdce7f5, 0.85);
    this.scene.add(ambientLight);

    // Main Directional Sun Light (Casts soft shadows)
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    sunLight.position.set(8, 16, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
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
    // Pedestal Platform
    const pedestalGeo = new THREE.CylinderGeometry(5.2, 5.8, 0.4, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.7,
      metalness: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.22;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);

    // Cyber Grid on the pedestal
    const gridHelper = new THREE.GridHelper(9, 18, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);

    // Glowing rim ring
    const ringGeo = new THREE.RingGeometry(5.15, 5.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.scene.add(ring);
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
    
    // Choose font size based on digits
    const textStr = value.toString();
    if (textStr.length <= 2) {
      ctx.font = 'bold 190px Outfit, sans-serif';
    } else if (textStr.length === 3) {
      ctx.font = 'bold 150px Outfit, sans-serif';
    } else {
      ctx.font = 'bold 125px Outfit, sans-serif';
    }

    // Drop shadow for text
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;
    ctx.fillText(textStr, 256, 256);
    ctx.shadowColor = 'transparent';

    // Sub-title label on bottom of tile
    ctx.font = '600 36px "Noto Sans TC", sans-serif';
    ctx.fillStyle = config.text;
    ctx.globalAlpha = 0.65;
    ctx.fillText("MAHJONG", 256, 430);
    ctx.globalAlpha = 1.0;

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
    // Tile dimensions: Width = 0.88, Height = 0.45, Depth = 0.88
    const geo = new THREE.BoxGeometry(0.88, 0.45, 0.88);

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
      mesh.geometry.dispose();
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

    // Handle Selection State: Lift up slightly and emit warm golden glow
    const targetY = tile.y * 0.46 + 0.225 + (tile.isSelected ? 0.22 : 0);
    mesh.position.y = targetY;

    if (tile.isSelected) {
      mesh.material.forEach(mat => {
        mat.emissive = new THREE.Color(0xf59e0b);
        mat.emissiveIntensity = 0.35;
      });
    } else {
      mesh.material.forEach(mat => {
        mat.emissive = new THREE.Color(0x000000);
        mat.emissiveIntensity = 0;
      });
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
          mat.emissiveIntensity = 0.6;
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
   * Animate tile A flying into tile B and merging!
   */
  animateMerge(tileA, tileB, onComplete) {
    const meshA = this.tileMeshes.get(tileA.id);
    const meshB = this.tileMeshes.get(tileB.id);

    if (!meshA || !meshB) {
      if (onComplete) onComplete();
      return;
    }

    const startPos = meshA.position.clone();
    const endPos = meshB.position.clone();
    const duration = 280; // ms
    const startTime = performance.now();

    const tween = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      // Arc interpolation: lift in mid-air
      meshA.position.lerpVectors(startPos, endPos, ease);
      meshA.position.y += Math.sin(progress * Math.PI) * 0.4;
      meshA.scale.setScalar(1 - progress * 0.3);

      if (progress < 1) {
        requestAnimationFrame(tween);
      } else {
        // Arrived! Pop scale meshB
        this.animatePop(meshB);
        this.createMergeParticles(endPos, tileB.value);

        // Remove meshA
        this.scene.remove(meshA);
        meshA.geometry.dispose();
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
   * Particle burst effect for merges
   */
  createMergeParticles(pos, value) {
    const count = 22;
    const config = TILE_COLORS[value] || { bg: "#f59e0b" };
    const color = new THREE.Color(config.bg);

    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.03, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: color });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.04 + Math.random() * 0.07;
      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = (Math.cos(phi) * 0.5 + 0.5) * speed + 0.03;
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
    const count = 75;
    const colors = [0xffd700, 0xff5722, 0xe056fd, 0x00c7b7, 0xffffff];

    for (let i = 0; i < count; i++) {
      const geo = new THREE.TetrahedronGeometry(0.06 + Math.random() * 0.06);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({ color });
      const p = new THREE.Mesh(geo, mat);
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
    mesh.geometry.dispose();
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
        this.camera.position.set(0, 14, 0.01);
        break;
      case 'front':
        this.camera.position.set(0, 3, 13);
        break;
      case 'iso':
      case 'reset':
      default:
        this.camera.position.set(8, 9, 10);
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
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
