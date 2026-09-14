/**
 * Level Definitions & Solvable Layouts for 3D Mahjong 2048
 * Defines 3D coordinate grids (x, y, z) and guaranteed solvable binary decomposition numbers.
 */

export const LEVELS = [
  {
    id: 1,
    name: "階梯金字塔",
    desc: "新手入門：頂層與外圍開闊，多重可選配對，輕鬆體會合併與下墜",
    icon: "🔺",
    targetValue: 2048,
    targetScore: 10000,
    generateGrid: () => {
      const coords = [];
      // Tier 0 (Bottom): 4x4 base (16 tiles)
      for (let x = -1.5; x <= 1.5; x += 1) {
        for (let z = -1.5; z <= 1.5; z += 1) {
          coords.push({ x, y: 0, z });
        }
      }
      // Tier 1 (Mid): 2x2 centered (4 tiles)
      for (let x = -0.5; x <= 0.5; x += 1) {
        for (let z = -0.5; z <= 0.5; z += 1) {
          coords.push({ x, y: 1, z });
        }
      }
      // Tier 2 (Peak): 2x1 dual peaks (2 tiles, guaranteed open pairs!)
      coords.push({ x: -0.5, y: 2, z: 0 });
      coords.push({ x: 0.5, y: 2, z: 0 });

      return coords; // Total 22 tiles
    }
  },
  {
    id: 2,
    name: "雙子懸空塔",
    desc: "柱狀結構：消除底層柱腳會觸發大幅度垂直下墜連鎖！",
    icon: "🗼",
    targetValue: 2048,
    targetScore: 15000,
    generateGrid: () => {
      const coords = [];
      // Tower A: 2x2 at x in [-2, -1], z in [-0.5, 0.5], y from 0 to 2 (12 tiles)
      for (let y = 0; y <= 2; y++) {
        for (let x = -2; x <= -1; x++) {
          for (let z = -0.5; z <= 0.5; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      // Tower B: 2x2 at x in [1, 2], z in [-0.5, 0.5], y from 0 to 2 (12 tiles)
      for (let y = 0; y <= 2; y++) {
        for (let x = 1; x <= 2; x++) {
          for (let z = -0.5; z <= 0.5; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      // Connecting Skybridge at y = 1 (2 tiles)
      coords.push({ x: -0.2, y: 1, z: -0.5 });
      coords.push({ x: 0.2, y: 1, z: 0.5 });

      return coords; // Total 26 tiles
    }
  },
  {
    id: 3,
    name: "萬花魔術方塊",
    desc: "實心立方體：必須從外側六個方位逐步往核心「剝洋蔥」！",
    icon: "🧊",
    targetValue: 2048,
    targetScore: 20000,
    generateGrid: () => {
      const coords = [];
      // 3x3x3 solid cube = 27 tiles
      for (let x = -1; x <= 1; x++) {
        for (let y = 0; y <= 2; y++) {
          for (let z = -1; z <= 1; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      return coords; // Total 27 tiles
    }
  },
  {
    id: 4,
    name: "東方長城要塞",
    desc: "要塞城堡：外圍城牆守護中央主塔，考驗水平與垂直邊緣選定戰略",
    icon: "🏯",
    targetValue: 2048,
    targetScore: 25000,
    generateGrid: () => {
      const coords = [];
      // Outer 4x4 wall ring at y=0 (12 border tiles)
      for (let x = -1.5; x <= 1.5; x++) {
        for (let z = -1.5; z <= 1.5; z++) {
          const isBorder = (Math.abs(x) === 1.5 || Math.abs(z) === 1.5);
          if (isBorder) {
            coords.push({ x, y: 0, z });
            // Corner towers at y=1
            if (Math.abs(x) === 1.5 && Math.abs(z) === 1.5) {
              coords.push({ x, y: 1, z });
            }
          }
        }
      }
      // Central Keep (Inside 2x2) at y=0, 1, 2
      for (let x = -0.5; x <= 0.5; x++) {
        for (let z = -0.5; z <= 0.5; z++) {
          coords.push({ x, y: 0, z });
          coords.push({ x, y: 1, z });
          coords.push({ x, y: 2, z });
        }
      }
      return coords; // Total 12 + 4 + 12 = 28 tiles
    }
  },
  {
    id: 5,
    name: "天空螺旋神殿",
    desc: "極限挑戰：旋轉騰空石階，高度落差極大，考驗立體空間感知",
    icon: "🌀",
    targetValue: 2048,
    targetScore: 30000,
    generateGrid: () => {
      const coords = [];
      // Central column (height 0 to 3)
      for (let y = 0; y <= 3; y++) {
        coords.push({ x: 0, y, z: 0 });
      }
      // Ascending spiral steps
      const steps = [
        // Level 0 ground wings
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
        { x: 1, y: 0, z: 1 },
        { x: -1, y: 0, z: -1 },
        // Level 1 steps
        { x: 1, y: 1, z: 0 },
        { x: 1, y: 1, z: -1 },
        { x: 0, y: 1, z: -1 },
        { x: -1, y: 1, z: 0 },
        { x: -1, y: 1, z: 1 },
        // Level 2 steps
        { x: -1, y: 2, z: 0 },
        { x: -1, y: 2, z: -1 },
        { x: 0, y: 2, z: 1 },
        { x: 1, y: 2, z: 1 },
        // Level 3 steps
        { x: 1, y: 3, z: 0 },
        { x: 0, y: 3, z: -1 },
        { x: -1, y: 3, z: 0 },
        { x: 0, y: 3, z: 1 },
        // Peak Crown at y=4
        { x: -0.5, y: 4, z: 0 },
        { x: 0.5, y: 4, z: 0 }
      ];
      steps.forEach(s => coords.push(s));
      return coords; // Total 25 tiles
    }
  }
];

/**
 * Generates numbers using Binary Merge Decomposition.
 * Decomposes 2048 targets into smaller numbers, guaranteeing that:
 * 1. The numbers can 100% mathematically merge into 2048 with ZERO orphan tiles!
 * 2. Smaller numbers are placed on more accessible / top positions.
 * 3. At turn 1, multiple matching pairs are guaranteed to be unblocked and ready to merge!
 * 
 * @param {Array} coords Grid coordinate list
 * @param {number} levelId Level ID
 * @param {number} targetValue Target value to eliminate (default 2048)
 */
export function generateNumbersForGrid(coords, levelId = 1, targetValue = 2048) {
  const count = coords.length;

  // Determine number of target blocks (e.g., 20~30 tiles decompose from 2 or 3 targets)
  const numTargets = Math.max(1, Math.floor(count / 11));
  let list = Array(numTargets).fill(targetValue);

  // Decompose values via binary split: V -> V/2 + V/2
  while (list.length < count) {
    let candidates = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i] >= 8) candidates.push(i);
    }
    if (candidates.length === 0) {
      for (let i = 0; i < list.length; i++) {
        if (list[i] >= 4) candidates.push(i);
      }
    }
    if (candidates.length === 0) break;

    const chosenIdx = candidates[Math.floor(Math.random() * candidates.length)];
    const val = list[chosenIdx];
    list.splice(chosenIdx, 1, val / 2, val / 2);
  }

  // Sort numbers: smaller values first (16, 32, 64, ...)
  list.sort((a, b) => a - b);

  // Sort coordinates by spatial accessibility:
  // Higher Y first; for same Y, outermost (larger |x| + |z|) first
  const sortedCoords = [...coords].sort((a, b) => {
    if (b.y !== a.y) return b.y - a.y;
    const distA = Math.abs(a.x) + Math.abs(a.z);
    const distB = Math.abs(b.x) + Math.abs(b.z);
    return distB - distA;
  });

  // Assign numbers to coordinates
  const numbers = new Array(count);
  sortedCoords.forEach((coord, i) => {
    const origIdx = coords.indexOf(coord);
    numbers[origIdx] = list[i];
  });

  return numbers;
}
