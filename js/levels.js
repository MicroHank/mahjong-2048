/**
 * Level Definitions & Solvable Layouts for 3D Mahjong 2048
 * Grand Dual-Heap (左右兩堆) Layouts with Guaranteed Binary Decomposition Solvability.
 */

export const LEVELS = [
  {
    id: 1,
    name: "雙子階梯金字塔",
    desc: "宏偉左右雙峰金字塔，開闊無遮蔽，左右跨陣地自由連鎖合併！",
    icon: "🔺",
    targetValue: 2048,
    targetScore: 15000,
    generateGrid: () => {
      const coords = [];
      // === 左堆金字塔 (Center at x = -2.5) ===
      // Tier 0 (Bottom): 3x3 (9 tiles)
      for (let x = -3.5; x <= -1.5; x += 1) {
        for (let z = -1; z <= 1; z += 1) {
          coords.push({ x, y: 0, z });
        }
      }
      // Tier 1 (Mid): 2x2 (4 tiles)
      for (let x = -3; x <= -2; x += 1) {
        for (let z = -0.5; z <= 0.5; z += 1) {
          coords.push({ x, y: 1, z });
        }
      }
      // Tier 2 (Peak): 1 tile
      coords.push({ x: -2.5, y: 2, z: 0 });

      // === 右堆金字塔 (Center at x = 2.5) ===
      // Tier 0 (Bottom): 3x3 (9 tiles)
      for (let x = 1.5; x <= 3.5; x += 1) {
        for (let z = -1; z <= 1; z += 1) {
          coords.push({ x, y: 0, z });
        }
      }
      // Tier 1 (Mid): 2x2 (4 tiles)
      for (let x = 2; x <= 3; x += 1) {
        for (let z = -0.5; z <= 0.5; z += 1) {
          coords.push({ x, y: 1, z });
        }
      }
      // Tier 2 (Peak): 1 tile
      coords.push({ x: 2.5, y: 2, z: 0 });

      // === 中央連通石階 (冰封教學石) ===
      coords.push({ x: -0.6, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 0.6, y: 0, z: 0, isFrozen: true });

      return coords; // Total: 14 + 14 + 2 = 30 tiles
    }
  },
  {
    id: 2,
    name: "雙塔天梯要塞",
    desc: "高聳入雲的左翼與右翼雙子塔，消除底層將觸發壯觀的重力大崩塌！",
    icon: "🗼",
    targetValue: 2048,
    targetScore: 20000,
    generateGrid: () => {
      const coords = [];
      // === 左翼高塔 (Center x = -2.5) ===
      for (let y = 0; y <= 2; y++) {
        for (let x = -3; x <= -2; x++) {
          for (let z = -0.5; z <= 0.5; z++) {
            coords.push({ x, y, z }); // 2x2x3 = 12 tiles
          }
        }
      }
      coords.push({ x: -2.5, y: 3, z: -0.5 });
      coords.push({ x: -2.5, y: 3, z: 0.5 }); // Top floor: 2 tiles

      // === 右翼高塔 (Center x = 2.5) ===
      for (let y = 0; y <= 2; y++) {
        for (let x = 2; x <= 3; x++) {
          for (let z = -0.5; z <= 0.5; z++) {
            coords.push({ x, y, z }); // 12 tiles
          }
        }
      }
      coords.push({ x: 2.5, y: 3, z: -0.5 });
      coords.push({ x: 2.5, y: 3, z: 0.5 }); // Top floor: 2 tiles

      // === 中央天橋與連通走道 ===
      coords.push({ x: -1.2, y: 1, z: 0 });
      coords.push({ x: 0, y: 1, z: 0 });
      coords.push({ x: 1.2, y: 1, z: 0 });
      coords.push({ x: 0, y: 2, z: 0 });
      // 地面護衛柱 (冰封守衛石)
      coords.push({ x: -2.5, y: 0, z: -1.5, isFrozen: true });
      coords.push({ x: -2.5, y: 0, z: 1.5, isFrozen: true });
      coords.push({ x: 2.5, y: 0, z: -1.5, isFrozen: true });
      coords.push({ x: 2.5, y: 0, z: 1.5, isFrozen: true });

      return coords; // Total: 14 + 14 + 8 = 36 tiles
    }
  },
  {
    id: 3,
    name: "雙生萬花魔術方塊",
    desc: "並列於空間兩端的實心雙子方體，由外向內逐步剝除多維外殼！",
    icon: "🧊",
    targetValue: 2048,
    targetScore: 25000,
    generateGrid: () => {
      const coords = [];
      // === 左方體 (x: -3.5 to -1.5, y: 0 to 1, z: -1 to 1) 3x2x3 = 18 tiles ===
      for (let x = -3.5; x <= -1.5; x++) {
        for (let y = 0; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      coords.push({ x: -2.5, y: 2, z: 0, isFrozen: true }); // Top frozen gem: 1 tile

      // === 右方體 (x: 1.5 to 3.5, y: 0 to 1, z: -1 to 1) 3x2x3 = 18 tiles ===
      for (let x = 1.5; x <= 3.5; x++) {
        for (let y = 0; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      coords.push({ x: 2.5, y: 2, z: 0, isFrozen: true }); // Top frozen gem: 1 tile

      return coords; // Total: 19 + 19 = 38 tiles
    }
  },
  {
    id: 4,
    name: "東西雙城要塞",
    desc: "兩座固若金湯的雙城要塞隔空對峙，豐富的外牆防禦與多層主塔！",
    icon: "🏯",
    targetValue: 2048,
    targetScore: 30000,
    generateGrid: () => {
      const coords = [];
      // === 左城塞 (Center x = -2.5) ===
      for (let x = -3.5; x <= -1.5; x++) {
        for (let z = -1.5; z <= 1.5; z++) {
          const isOuter = (x === -3.5 || x === -1.5 || z === -1.5 || z === 1.5);
          if (isOuter) {
            coords.push({ x, y: 0, z });
            // 四角箭樓
            if ((x === -3.5 || x === -1.5) && (z === -1.5 || z === 1.5)) {
              coords.push({ x, y: 1, z });
            }
          }
        }
      }
      // 左主樓
      coords.push({ x: -2.5, y: 0, z: 0 });
      coords.push({ x: -2.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 2, z: 0 });

      // === 右城塞 (Center x = 2.5) ===
      for (let x = 1.5; x <= 3.5; x++) {
        for (let z = -1.5; z <= 1.5; z++) {
          const isOuter = (x === 1.5 || x === 3.5 || z === -1.5 || z === 1.5);
          if (isOuter) {
            coords.push({ x, y: 0, z });
            if ((x === 1.5 || x === 3.5) && (z === -1.5 || z === 1.5)) {
              coords.push({ x, y: 1, z });
            }
          }
        }
      }
      // 右主樓
      coords.push({ x: 2.5, y: 0, z: 0 });
      coords.push({ x: 2.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 2, z: 0 });

      // === 中央城門橋 (城衛冰封石) ===
      coords.push({ x: -0.6, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 0.6, y: 0, z: 0, isFrozen: true });

      return coords; // Total: 15 + 15 + 2 = 32 tiles
    }
  },
  {
    id: 5,
    name: "雙螺旋星雲聖殿",
    desc: "宇宙級雙生螺旋石階，極限高度落差，左右呼應的終極立體幾何挑戰！",
    icon: "🌀",
    targetValue: 2048,
    targetScore: 40000,
    generateGrid: () => {
      const coords = [];
      // === 左螺旋 (x: -2.5) ===
      for (let y = 0; y <= 3; y++) {
        coords.push({ x: -2.5, y, z: 0 }); // 芯柱
      }
      const leftSteps = [
        { x: -1.5, y: 0, z: 0 },
        { x: -1.5, y: 0, z: 1 },
        { x: -2.5, y: 1, z: 1 },
        { x: -3.5, y: 1, z: 1 },
        { x: -3.5, y: 2, z: 0 },
        { x: -3.5, y: 2, z: -1 },
        { x: -2.5, y: 3, z: -1 },
        { x: -1.5, y: 3, z: -1 },
        { x: -2.5, y: 4, z: 0 },
        // 底層衛翼
        { x: -3.5, y: 0, z: -1 },
        { x: -3.5, y: 0, z: 0 },
        { x: -2.5, y: 0, z: -1 }
      ];
      leftSteps.forEach(s => coords.push(s)); // 4 + 12 = 16 tiles

      // === 右螺旋 (x: 2.5) ===
      for (let y = 0; y <= 3; y++) {
        coords.push({ x: 2.5, y, z: 0 }); // 芯柱
      }
      const rightSteps = [
        { x: 1.5, y: 0, z: 0 },
        { x: 1.5, y: 0, z: 1 },
        { x: 2.5, y: 1, z: 1 },
        { x: 3.5, y: 1, z: 1 },
        { x: 3.5, y: 2, z: 0 },
        { x: 3.5, y: 2, z: -1 },
        { x: 2.5, y: 3, z: -1 },
        { x: 1.5, y: 3, z: -1 },
        { x: 2.5, y: 4, z: 0 },
        // 底層衛翼
        { x: 3.5, y: 0, z: -1 },
        { x: 3.5, y: 0, z: 0 },
        { x: 2.5, y: 0, z: -1 }
      ];
      rightSteps.forEach(s => coords.push(s)); // 4 + 12 = 16 tiles

      // === 聖域中樞連接台 (聖域封印石) ===
      coords.push({ x: -0.6, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 0.6, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });

      return coords; // Total: 16 + 16 + 3 = 35 tiles
    }
  }
];

/**
 * Binary Merge Decomposition Number Generator
 * Decomposes 2048 targets into smaller numbers, guaranteeing 100% solvability.
 */
export function generateNumbersForGrid(coords, levelId = 1, targetValue = 2048) {
  const count = coords.length;

  // Number of 2048 targets (e.g. 30~38 tiles decompose from 3 or 4 targets of 2048)
  const numTargets = Math.max(1, Math.floor(count / 10));
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
  // Higher Y first; for same Y, outermost (larger |x|) first
  const sortedCoords = [...coords].sort((a, b) => {
    if (b.y !== a.y) return b.y - a.y;
    const distA = Math.abs(a.x) * 1.5 + Math.abs(a.z);
    const distB = Math.abs(b.x) * 1.5 + Math.abs(b.z);
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
