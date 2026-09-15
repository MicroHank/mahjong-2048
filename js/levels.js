/**
 * Level Definitions & Solvable Layouts for 3D Mahjong 2048
 * Grand 20-Stage Campaign with Solvable Binary Decomposition.
 */

export const LEVELS = [
  // --- 1. 雙金字塔 ---
  {
    id: 1,
    name: "雙金字塔",
    desc: "左右對稱的階梯狀金字塔，頂部平緩，適合熟悉基礎消除。",
    icon: "🔺",
    targetValue: 2048,
    targetScore: 15000,
    generateGrid: () => {
      const coords = [];
      // 左堆 (x: -2.5)
      for (let x = -3.5; x <= -1.5; x += 1) {
        for (let z = -1; z <= 1; z += 1) {
          coords.push({ x, y: 0, z });
        }
      }
      for (let x = -3; x <= -2; x += 1) {
        for (let z = -0.5; z <= 0.5; z += 1) {
          coords.push({ x, y: 1, z });
        }
      }
      coords.push({ x: -2.5, y: 2, z: 0 });

      // 右堆 (x: 2.5)
      for (let x = 1.5; x <= 3.5; x += 1) {
        for (let z = -1; z <= 1; z += 1) {
          coords.push({ x, y: 0, z });
        }
      }
      for (let x = 2; x <= 3; x += 1) {
        for (let z = -0.5; z <= 0.5; z += 1) {
          coords.push({ x, y: 1, z });
        }
      }
      coords.push({ x: 2.5, y: 2, z: 0 });

      // 連通石階 (冰封教學石)
      coords.push({ x: -0.6, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 0.6, y: 0, z: 0, isFrozen: true });
      return coords; // 30 tiles
    }
  },

  // --- 2. 對稱雙塔 ---
  {
    id: 2,
    name: "對稱雙塔",
    desc: "左右兩座高塔，消除下方方塊時上方方塊會自然下落。",
    icon: "🗼",
    targetValue: 2048,
    targetScore: 20000,
    generateGrid: () => {
      const coords = [];
      // 左塔
      for (let y = 0; y <= 2; y++) {
        for (let x = -3; x <= -2; x++) {
          for (let z = -0.5; z <= 0.5; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      coords.push({ x: -2.5, y: 3, z: -0.5 });
      coords.push({ x: -2.5, y: 3, z: 0.5 });

      // 右塔
      for (let y = 0; y <= 2; y++) {
        for (let x = 2; x <= 3; x++) {
          for (let z = -0.5; z <= 0.5; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      coords.push({ x: 2.5, y: 3, z: -0.5 });
      coords.push({ x: 2.5, y: 3, z: 0.5 });

      // 天橋 & 衛柱
      coords.push({ x: -1.0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 1.0, y: 0, z: 0 });
      coords.push({ x: 0, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 0, z: -1.5, isFrozen: true });
      coords.push({ x: -2.5, y: 0, z: 1.5, isFrozen: true });
      coords.push({ x: 2.5, y: 0, z: -1.5, isFrozen: true });
      coords.push({ x: 2.5, y: 0, z: 1.5, isFrozen: true });
      return coords; // 36 tiles
    }
  },

  // --- 3. 雙立方塊 ---
  {
    id: 3,
    name: "雙立方塊",
    desc: "左右兩組實心方塊結構，需由外層逐步向內拆解。",
    icon: "🧊",
    targetValue: 2048,
    targetScore: 25000,
    generateGrid: () => {
      const coords = [];
      for (let x = -3.5; x <= -1.5; x++) {
        for (let y = 0; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      coords.push({ x: -2.5, y: 2, z: 0, isFrozen: true });

      for (let x = 1.5; x <= 3.5; x++) {
        for (let y = 0; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            coords.push({ x, y, z });
          }
        }
      }
      coords.push({ x: 2.5, y: 2, z: 0, isFrozen: true });
      return coords; // 38 tiles
    }
  },

  // --- 4. 雙城堡 ---
  {
    id: 4,
    name: "雙城堡",
    desc: "由外牆與主塔組成的對稱城堡造型，結構層次較多。",
    icon: "🏯",
    targetValue: 2048,
    targetScore: 30000,
    generateGrid: () => {
      const coords = [];
      // 左城塞
      for (let x = -3.5; x <= -1.5; x++) {
        for (let z = -1.5; z <= 1.5; z++) {
          const isOuter = (x === -3.5 || x === -1.5 || z === -1.5 || z === 1.5);
          if (isOuter) {
            coords.push({ x, y: 0, z });
            if ((x === -3.5 || x === -1.5) && (z === -1.5 || z === 1.5)) {
              coords.push({ x, y: 1, z });
            }
          }
        }
      }
      coords.push({ x: -2.5, y: 0, z: 0 });
      coords.push({ x: -2.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 2, z: 0 });

      // 右城塞
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
      coords.push({ x: 2.5, y: 0, z: 0 });
      coords.push({ x: 2.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 2, z: 0 });

      // 中央城門橋
      coords.push({ x: -0.6, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 0.6, y: 0, z: 0, isFrozen: true });
      return coords; // 36 tiles
    }
  },

  // --- 5. 雙螺旋階梯 ---
  {
    id: 5,
    name: "雙螺旋階梯",
    desc: "兩側盤旋上升的螺旋階梯，高低落差較大。",
    icon: "🌀",
    targetValue: 2048,
    targetScore: 35000,
    generateGrid: () => {
      const coords = [];
      for (let y = 0; y <= 3; y++) coords.push({ x: -2.5, y, z: 0 });
      const leftSteps = [
        { x: -1.5, y: 0, z: 0 }, { x: -1.5, y: 0, z: 1 },
        { x: -2.5, y: 1, z: 1 }, { x: -3.5, y: 1, z: 1 },
        { x: -3.5, y: 2, z: 0 }, { x: -3.5, y: 2, z: -1 },
        { x: -2.5, y: 3, z: -1 }, { x: -1.5, y: 3, z: -1 },
        { x: -2.5, y: 4, z: 0 },
        { x: -3.5, y: 0, z: -1 }, { x: -3.5, y: 0, z: 0 }, { x: -2.5, y: 0, z: -1 }
      ];
      leftSteps.forEach(s => coords.push(s));

      for (let y = 0; y <= 3; y++) coords.push({ x: 2.5, y, z: 0 });
      const rightSteps = [
        { x: 1.5, y: 0, z: 0 }, { x: 1.5, y: 0, z: 1 },
        { x: 2.5, y: 1, z: 1 }, { x: 3.5, y: 1, z: 1 },
        { x: 3.5, y: 2, z: 0 }, { x: 3.5, y: 2, z: -1 },
        { x: 2.5, y: 3, z: -1 }, { x: 1.5, y: 3, z: -1 },
        { x: 2.5, y: 4, z: 0 },
        { x: 3.5, y: 0, z: -1 }, { x: 3.5, y: 0, z: 0 }, { x: 2.5, y: 0, z: -1 }
      ];
      rightSteps.forEach(s => coords.push(s));

      coords.push({ x: -0.6, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 0.6, y: 0, z: 0, isFrozen: true });
      return coords; // 34 tiles
    }
  },

    // --- 6. 長城垛口 ---
  {
    id: 6,
    name: "長城垛口",
    desc: "模擬城牆與烽火台的高低起伏，需注意飛行通道阻擋。",
    icon: "🧱",
    targetValue: 2048,
    targetScore: 36000,
    generateGrid: () => {
      const coords = [];
      for (let x = -3.5; x <= -1.5; x += 1) {
        coords.push({ x, y: 0, z: -1 });
        coords.push({ x, y: 0, z: 0 });
        coords.push({ x, y: 0, z: 1 });
      }
      coords.push({ x: -3.5, y: 1, z: -1 });
      coords.push({ x: -3.5, y: 1, z: 1 });
      coords.push({ x: -2.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 2, z: 0 });
      coords.push({ x: -1.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 0, z: -2, isFrozen: true });
      coords.push({ x: -2.5, y: 0, z: 2, isFrozen: true });

      for (let x = 1.5; x <= 3.5; x += 1) {
        coords.push({ x, y: 0, z: -1 });
        coords.push({ x, y: 0, z: 0 });
        coords.push({ x, y: 0, z: 1 });
      }
      coords.push({ x: 3.5, y: 1, z: -1 });
      coords.push({ x: 3.5, y: 1, z: 1 });
      coords.push({ x: 2.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 2, z: 0 });
      coords.push({ x: 1.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 0, z: -2, isFrozen: true });
      coords.push({ x: 2.5, y: 0, z: 2, isFrozen: true });

      coords.push({ x: 0, y: 0, z: -0.5 });
      coords.push({ x: 0, y: 0, z: 0.5 });
      return coords; // 32 tiles
    }
  },

  // --- 7. 對坐石獅 ---
  {
    id: 7,
    name: "對坐石獅",
    desc: "左右對稱的石獅造形，包含底座四爪與較高的頭部方塊。",
    icon: "🦁",
    targetValue: 2048,
    targetScore: 38000,
    generateGrid: () => {
      const coords = [];
      // 左守護獸 (x: -2.5)
      // 前後爪底座 y=0
      for (let z = -1.5; z <= 1.5; z += 1) {
        coords.push({ x: -3, y: 0, z });
        coords.push({ x: -2, y: 0, z });
      }
      // 獸身 y=1
      coords.push({ x: -2.5, y: 1, z: -0.5 });
      coords.push({ x: -2.5, y: 1, z: 0.5 });
      coords.push({ x: -2.5, y: 1, z: 1.5 }); // 尾脊
      // 獸首 y=2 & y=3
      coords.push({ x: -2.5, y: 2, z: -1 });
      coords.push({ x: -2.5, y: 3, z: -1 });
      // 護爪冰封石
      coords.push({ x: -1.0, y: 0, z: -1.5, isFrozen: true });

      // 右守護獸 (x: 2.5)
      for (let z = -1.5; z <= 1.5; z += 1) {
        coords.push({ x: 2, y: 0, z });
        coords.push({ x: 3, y: 0, z });
      }
      coords.push({ x: 2.5, y: 1, z: -0.5 });
      coords.push({ x: 2.5, y: 1, z: 0.5 });
      coords.push({ x: 2.5, y: 1, z: 1.5 });
      coords.push({ x: 2.5, y: 2, z: -1 });
      coords.push({ x: 2.5, y: 3, z: -1 });
      coords.push({ x: 1.0, y: 0, z: -1.5, isFrozen: true });

      // 綠洲聖泉中台
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      return coords; // 32 tiles
    }
  },

    // --- 8. 雙闕樓閣 ---
  {
    id: 8,
    name: "雙闕樓閣",
    desc: "仿古典建築的雙層樓閣，立柱與屋檐高低交錯。",
    icon: "⛩️",
    targetValue: 2048,
    targetScore: 40000,
    generateGrid: () => {
      const coords = [];
      coords.push({ x: -3.5, y: 0, z: -1 });
      coords.push({ x: -3.5, y: 0, z: 1 });
      coords.push({ x: -1.5, y: 0, z: -1 });
      coords.push({ x: -1.5, y: 0, z: 1 });
      coords.push({ x: -2.5, y: 1, z: -1 });
      coords.push({ x: -2.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 1, z: 1 });
      coords.push({ x: -3.5, y: 1, z: 0 });
      coords.push({ x: -1.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 2, z: -0.5 });
      coords.push({ x: -2.5, y: 2, z: 0.5 });
      coords.push({ x: -2.5, y: 3, z: 0 });
      coords.push({ x: -2.5, y: 0, z: 0, isFrozen: true });

      coords.push({ x: 1.5, y: 0, z: -1 });
      coords.push({ x: 1.5, y: 0, z: 1 });
      coords.push({ x: 3.5, y: 0, z: -1 });
      coords.push({ x: 3.5, y: 0, z: 1 });
      coords.push({ x: 2.5, y: 1, z: -1 });
      coords.push({ x: 2.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 1, z: 1 });
      coords.push({ x: 1.5, y: 1, z: 0 });
      coords.push({ x: 3.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 2, z: -0.5 });
      coords.push({ x: 2.5, y: 2, z: 0.5 });
      coords.push({ x: 2.5, y: 3, z: 0 });
      coords.push({ x: 2.5, y: 0, z: 0, isFrozen: true });

      coords.push({ x: 0, y: 0, z: -1 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 30 tiles
    }
  },

  // --- 9. 八角石陣 ---
  {
    id: 9,
    name: "八角石陣",
    desc: "呈八角形環狀排列的多層石柱，需由外圈向內推進。",
    icon: "☯️",
    targetValue: 2048,
    targetScore: 42000,
    generateGrid: () => {
      const coords = [];
      // 左八卦 (Center x = -2.5)
      // 外八門 y=0 (環形)
      coords.push({ x: -3.5, y: 0, z: -1.5 });
      coords.push({ x: -2.5, y: 0, z: -1.5 });
      coords.push({ x: -1.5, y: 0, z: -1.5 });
      coords.push({ x: -3.5, y: 0, z: 0 });
      coords.push({ x: -1.5, y: 0, z: 0 });
      coords.push({ x: -3.5, y: 0, z: 1.5 });
      coords.push({ x: -2.5, y: 0, z: 1.5 });
      coords.push({ x: -1.5, y: 0, z: 1.5 });
      // 內四象 y=1
      coords.push({ x: -3, y: 1, z: -0.5 });
      coords.push({ x: -2, y: 1, z: -0.5 });
      coords.push({ x: -3, y: 1, z: 0.5 });
      coords.push({ x: -2, y: 1, z: 0.5 });
      // 太極中極 y=2
      coords.push({ x: -2.5, y: 2, z: 0 });
      // 陣眼冰封
      coords.push({ x: -2.5, y: 0, z: 0, isFrozen: true });

      // 右八卦 (Center x = 2.5)
      coords.push({ x: 1.5, y: 0, z: -1.5 });
      coords.push({ x: 2.5, y: 0, z: -1.5 });
      coords.push({ x: 3.5, y: 0, z: -1.5 });
      coords.push({ x: 1.5, y: 0, z: 0 });
      coords.push({ x: 3.5, y: 0, z: 0 });
      coords.push({ x: 1.5, y: 0, z: 1.5 });
      coords.push({ x: 2.5, y: 0, z: 1.5 });
      coords.push({ x: 3.5, y: 0, z: 1.5 });
      coords.push({ x: 2, y: 1, z: -0.5 });
      coords.push({ x: 3, y: 1, z: -0.5 });
      coords.push({ x: 2, y: 1, z: 0.5 });
      coords.push({ x: 3, y: 1, z: 0.5 });
      coords.push({ x: 2.5, y: 2, z: 0 });
      coords.push({ x: 2.5, y: 0, z: 0, isFrozen: true });

      // 陰陽太極雙橋
      coords.push({ x: 0, y: 0, z: -0.8 });
      coords.push({ x: 0, y: 0, z: 0.8 });
      return coords; // 30 tiles
    }
  },

  // --- 10. 圓頂宮殿 ---
  {
    id: 10,
    name: "圓頂宮殿",
    desc: "四角立柱環繞中央圓頂的對稱宮殿結構。",
    icon: "🕌",
    targetValue: 2048,
    targetScore: 45000,
    generateGrid: () => {
      const coords = [];
      // 左殿 (Center x = -2.5)
      // 四角尖塔 y=0,1,2
      const corners = [[-3.5, -1], [-3.5, 1], [-1.5, -1], [-1.5, 1]];
      corners.forEach(([cx, cz]) => {
        coords.push({ x: cx, y: 0, z: cz });
        coords.push({ x: cx, y: 1, z: cz });
      });
      // 中央主台 y=0,1,2,3
      coords.push({ x: -2.5, y: 0, z: 0 });
      coords.push({ x: -2.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 2, z: 0 });
      coords.push({ x: -2.5, y: 3, z: 0 }); // 穹頂尖

      // 右殿 (Center x = 2.5)
      const rCorners = [[1.5, -1], [1.5, 1], [3.5, -1], [3.5, 1]];
      rCorners.forEach(([cx, cz]) => {
        coords.push({ x: cx, y: 0, z: cz });
        coords.push({ x: cx, y: 1, z: cz });
      });
      coords.push({ x: 2.5, y: 0, z: 0 });
      coords.push({ x: 2.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 2, z: 0 });
      coords.push({ x: 2.5, y: 3, z: 0 });

      // 蓮花水鏡橋 (冰封蓮石)
      coords.push({ x: -1.0, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 1.0, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 0, y: 0, z: -1.0 });
      coords.push({ x: 0, y: 0, z: 1.0 });
      return coords; // 28 tiles
    }
  },

  // --- 11. 階梯祭壇 ---
  {
    id: 11,
    name: "階梯祭壇",
    desc: "階梯狀台階與中央高台結構，需逐步拆解高處方塊。",
    icon: "🐍",
    targetValue: 2048,
    targetScore: 48000,
    generateGrid: () => {
      const coords = [];
      // 左金字塔 (x: -2.5)
      for (let x = -3.5; x <= -1.5; x++) {
        for (let z = -1.5; z <= 0.5; z++) {
          coords.push({ x, y: 0, z });
        }
      }
      for (let x = -3; x <= -2; x++) {
        coords.push({ x, y: 1, z: -1 });
        coords.push({ x, y: 1, z: 0 });
      }
      coords.push({ x: -2.5, y: 2, z: -0.5 }); // 祭壇
      coords.push({ x: -2.5, y: 0, z: 1.5, isFrozen: true }); // 蛇尾

      // 右金字塔 (x: 2.5)
      for (let x = 1.5; x <= 3.5; x++) {
        for (let z = -1.5; z <= 0.5; z++) {
          coords.push({ x, y: 0, z });
        }
      }
      for (let x = 2; x <= 3; x++) {
        coords.push({ x, y: 1, z: -1 });
        coords.push({ x, y: 1, z: 0 });
      }
      coords.push({ x: 2.5, y: 2, z: -0.5 });
      coords.push({ x: 2.5, y: 0, z: 1.5, isFrozen: true });

      // 中央太陽石晷
      coords.push({ x: 0, y: 0, z: -0.5 });
      coords.push({ x: 0, y: 1, z: -0.5 });
      coords.push({ x: 0, y: 0, z: 0.5, isFrozen: true });
      coords.push({ x: 0, y: 1, z: 0.5, isFrozen: true });
      return coords; // 34 tiles
    }
  },

  // --- 12. 雙殿長橋 ---
  {
    id: 12,
    name: "雙殿長橋",
    desc: "左右兩座殿堂由中央長橋相連，需進行長距離跨區合併。",
    icon: "🌌",
    targetValue: 2048,
    targetScore: 50000,
    generateGrid: () => {
      const coords = [];
      // 左殿 (Center x = -3)
      for (let x = -4; x <= -2; x++) {
        for (let z = -1; z <= 1; z++) {
          coords.push({ x, y: 0, z });
        }
      }
      coords.push({ x: -3, y: 1, z: -0.5 });
      coords.push({ x: -3, y: 1, z: 0.5 });
      coords.push({ x: -3, y: 2, z: 0 });

      // 右殿 (Center x = 3)
      for (let x = 2; x <= 4; x++) {
        for (let z = -1; z <= 1; z++) {
          coords.push({ x, y: 0, z });
        }
      }
      coords.push({ x: 3, y: 1, z: -0.5 });
      coords.push({ x: 3, y: 1, z: 0.5 });
      coords.push({ x: 3, y: 2, z: 0 });

      // 七星連珠天橋
      coords.push({ x: -1, y: 0, z: 0 });
      coords.push({ x: -1, y: 1, z: 0, isFrozen: true });
      coords.push({ x: 0, y: 0, z: -1 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: 0 });
      coords.push({ x: 1, y: 0, z: 0 });
      coords.push({ x: 1, y: 1, z: 0, isFrozen: true });
      return coords; // 32 tiles
    }
  },

  // --- 13. 三王冠 ---
  {
    id: 13,
    name: "三王冠",
    desc: "左、中、右三頂獨立立體王冠，可自由跨越鄰近王冠進行多路徑合併。",
    icon: "👑",
    targetValue: 2048,
    targetScore: 52000,
    generateGrid: () => {
      const coords = [];
      const crownCenters = [-3.2, 0, 3.2];
      crownCenters.forEach(cx => {
        const base = [
          [-0.9, -0.7], [0.9, -0.7], [-0.9, 0.7], [0.9, 0.7], [0, -1.0], [0, 1.0]
        ];
        base.forEach(([dx, dz]) => coords.push({ x: cx + dx, y: 0, z: dz }));
        coords.push({ x: cx - 0.5, y: 1, z: 0 });
        coords.push({ x: cx + 0.5, y: 1, z: 0 });
        coords.push({ x: cx, y: 1, z: 0 });
        coords.push({ x: cx, y: 2, z: 0 });
      });
      coords.push({ x: -1.6, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 1.6, y: 0, z: 0, isFrozen: true });
      return coords; // 32 tiles (3 heaps)
    }
  },

  // --- 14. 四角軍陣 ---
  {
    id: 14,
    name: "四角軍陣",
    desc: "分佈於四個象限的獨立方陣，支援相鄰與對角跨陣地自由飛躍。",
    icon: "⚔️",
    targetValue: 2048,
    targetScore: 55000,
    generateGrid: () => {
      const coords = [];
      const corners = [
        { cx: -2.5, cz: -1.5 },
        { cx: 2.5, cz: -1.5 },
        { cx: -2.5, cz: 1.5 },
        { cx: 2.5, cz: 1.5 }
      ];
      corners.forEach(c => {
        for (let x = -0.5; x <= 0.5; x++) {
          for (let z = -1; z <= 1; z++) {
            coords.push({ x: c.cx + x, y: 0, z: c.cz + z });
          }
        }
        coords.push({ x: c.cx, y: 1, z: c.cz - 0.5 });
        coords.push({ x: c.cx, y: 1, z: c.cz + 0.5 });
      }); // 4 * 8 = 32 tiles
      coords.push({ x: -0.8, y: 0, z: 0 });
      coords.push({ x: 0.8, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: -0.8, isFrozen: true });
      coords.push({ x: 0, y: 0, z: 0.8, isFrozen: true });
      coords.push({ x: 0, y: 1, z: 0 });
      coords.push({ x: 0, y: 0, z: 0 });
      return coords; // 38 tiles (4 heaps + center)
    }
  },

  // --- 15. 展開雙翼 ---
  {
    id: 15,
    name: "展開雙翼",
    desc: "由左右飛翼與中央核心平台構成，方塊可由兩側向中央或外緣對稱聚合。",
    icon: "🪽",
    targetValue: 2048,
    targetScore: 58000,
    generateGrid: () => {
      const coords = [];
      // Left Wing
      coords.push({ x: -1.8, y: 0, z: -1 });
      coords.push({ x: -1.8, y: 0, z: 0 });
      coords.push({ x: -1.8, y: 0, z: 1 });
      coords.push({ x: -2.8, y: 0, z: -1.5 });
      coords.push({ x: -2.8, y: 1, z: -0.5 });
      coords.push({ x: -2.8, y: 1, z: 0.5 });
      coords.push({ x: -2.8, y: 2, z: 0 });
      coords.push({ x: -2.8, y: 0, z: 1.5 });
      coords.push({ x: -3.8, y: 1, z: -1 });
      coords.push({ x: -3.8, y: 2, z: 0 });
      coords.push({ x: -3.8, y: 3, z: 0 });
      coords.push({ x: -3.8, y: 1, z: 1 });

      // Right Wing
      coords.push({ x: 1.8, y: 0, z: -1 });
      coords.push({ x: 1.8, y: 0, z: 0 });
      coords.push({ x: 1.8, y: 0, z: 1 });
      coords.push({ x: 2.8, y: 0, z: -1.5 });
      coords.push({ x: 2.8, y: 1, z: -0.5 });
      coords.push({ x: 2.8, y: 1, z: 0.5 });
      coords.push({ x: 2.8, y: 2, z: 0 });
      coords.push({ x: 2.8, y: 0, z: 1.5 });
      coords.push({ x: 3.8, y: 1, z: -1 });
      coords.push({ x: 3.8, y: 2, z: 0 });
      coords.push({ x: 3.8, y: 3, z: 0 });
      coords.push({ x: 3.8, y: 1, z: 1 });

      // Central Platform (3rd Heap)
      coords.push({ x: -0.6, y: 0, z: -0.8 });
      coords.push({ x: 0.6, y: 0, z: -0.8 });
      coords.push({ x: -0.6, y: 0, z: 0.8 });
      coords.push({ x: 0.6, y: 0, z: 0.8 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 1, z: -0.5 });
      coords.push({ x: 0, y: 1, z: 0.5 });
      coords.push({ x: 0, y: 2, z: 0 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 33 tiles (3 heaps)
    }
  },

  // --- 16. 四方巨石柱 ---
  {
    id: 16,
    name: "四方巨石柱",
    desc: "分立於東南西北四個方位的獨立石門群，環繞中央石環展開四向推進。",
    icon: "🗿",
    targetValue: 2048,
    targetScore: 60000,
    generateGrid: () => {
      const coords = [];
      const monoliths = [
        { cx: 0, cz: -2.6 },
        { cx: 0, cz: 2.6 },
        { cx: -2.8, cz: 0 },
        { cx: 2.8, cz: 0 }
      ];
      monoliths.forEach(m => {
        if (m.cx === 0) {
          coords.push({ x: -0.6, y: 0, z: m.cz });
          coords.push({ x: 0.6, y: 0, z: m.cz });
          coords.push({ x: -0.6, y: 1, z: m.cz });
          coords.push({ x: 0.6, y: 1, z: m.cz });
          coords.push({ x: 0, y: 1, z: m.cz });
          coords.push({ x: 0, y: 2, z: m.cz });
        } else {
          coords.push({ x: m.cx, y: 0, z: -0.6 });
          coords.push({ x: m.cx, y: 0, z: 0.6 });
          coords.push({ x: m.cx, y: 1, z: -0.6 });
          coords.push({ x: m.cx, y: 1, z: 0.6 });
          coords.push({ x: m.cx, y: 1, z: 0 });
          coords.push({ x: m.cx, y: 2, z: 0 });
        }
      }); // 4 * 6 = 24
      // Center stone ring
      coords.push({ x: -0.6, y: 0, z: -0.6 });
      coords.push({ x: 0.6, y: 0, z: -0.6 });
      coords.push({ x: -0.6, y: 0, z: 0.6 });
      coords.push({ x: 0.6, y: 0, z: 0.6 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 30 tiles (4 heaps + center)
    }
  },

  // --- 17. 四子天際樓 ---
  {
    id: 17,
    name: "四子天際樓",
    desc: "矗立於四角的四棟階梯式高樓，具備多層露台並由中央天橋相互連通。",
    icon: "🏙️",
    targetValue: 2048,
    targetScore: 65000,
    generateGrid: () => {
      const coords = [];
      const corners = [
        { cx: -2.5, cz: -1.5 },
        { cx: 2.5, cz: -1.5 },
        { cx: -2.5, cz: 1.5 },
        { cx: 2.5, cz: 1.5 }
      ];
      corners.forEach(c => {
        for (let x = -0.5; x <= 0.5; x++) {
          for (let z = -0.5; z <= 0.5; z++) {
            coords.push({ x: c.cx + x, y: 0, z: c.cz + z });
          }
        }
        coords.push({ x: c.cx - 0.5, y: 1, z: c.cz });
        coords.push({ x: c.cx + 0.5, y: 1, z: c.cz });
        coords.push({ x: c.cx, y: 2, z: c.cz });
        coords.push({ x: c.cx, y: 3, z: c.cz });
      }); // 4 * 8 = 32
      // Central skywalk cross
      coords.push({ x: -1.2, y: 0, z: 0 });
      coords.push({ x: 1.2, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: -0.8 });
      coords.push({ x: 0, y: 0, z: 0.8 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 38 tiles (4 heaps + skywalk)
    }
  },

  // --- 18. 四象太極陣 ---
  {
    id: 18,
    name: "四象太極陣",
    desc: "四角象限各自盤踞獨立卦位石陣，環繞中央太極核心，可多向靈活破陣。",
    icon: "🪐",
    targetValue: 2048,
    targetScore: 70000,
    generateGrid: () => {
      const coords = [];
      const quadCorners = [
        { cx: -2.5, cz: -1.4, sgnZ: -1 },
        { cx: 2.5, cz: -1.4, sgnZ: -1 },
        { cx: -2.5, cz: 1.4, sgnZ: 1 },
        { cx: 2.5, cz: 1.4, sgnZ: 1 }
      ];
      quadCorners.forEach(q => {
        coords.push({ x: q.cx - 0.5, y: 0, z: q.cz - 0.5 });
        coords.push({ x: q.cx + 0.5, y: 0, z: q.cz - 0.5 });
        coords.push({ x: q.cx + 0.5, y: 0, z: q.cz + 0.5 });
        coords.push({ x: q.cx - 0.5, y: 0, z: q.cz + 0.5 });
        coords.push({ x: q.cx, y: 1, z: q.cz - 0.3 * q.sgnZ });
        coords.push({ x: q.cx, y: 1, z: q.cz + 0.3 * q.sgnZ });
        coords.push({ x: q.cx, y: 2, z: q.cz });
      }); // 4 * 7 = 28
      // Central Taiji
      coords.push({ x: -0.8, y: 0, z: 0 });
      coords.push({ x: 0.8, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: -0.8 });
      coords.push({ x: 0, y: 0, z: 0.8 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: -0.4, y: 1, z: 0 });
      coords.push({ x: 0.4, y: 1, z: 0, isFrozen: true });
      coords.push({ x: 0, y: 2, z: 0 });
      return coords; // 36 tiles (5 heaps)
    }
  },

  // --- 19. 衛城三殿 ---
  {
    id: 19,
    name: "衛城三殿",
    desc: "左殿、右殿與中央主神殿三足鼎立，古典列柱與三角山牆錯落有致。",
    icon: "🏛️",
    targetValue: 2048,
    targetScore: 75000,
    generateGrid: () => {
      const coords = [];
      // Left Temple (cx = -3.2)
      coords.push({ x: -3.8, y: 0, z: -1 });
      coords.push({ x: -2.6, y: 0, z: -1 });
      coords.push({ x: -3.8, y: 0, z: 1 });
      coords.push({ x: -2.6, y: 0, z: 1 });
      coords.push({ x: -3.2, y: 1, z: -0.6 });
      coords.push({ x: -3.2, y: 1, z: 0.6 });
      coords.push({ x: -3.2, y: 2, z: 0 });

      // Right Temple (cx = 3.2)
      coords.push({ x: 2.6, y: 0, z: -1 });
      coords.push({ x: 3.8, y: 0, z: -1 });
      coords.push({ x: 2.6, y: 0, z: 1 });
      coords.push({ x: 3.8, y: 0, z: 1 });
      coords.push({ x: 3.2, y: 1, z: -0.6 });
      coords.push({ x: 3.2, y: 1, z: 0.6 });
      coords.push({ x: 3.2, y: 2, z: 0 });

      // Central High Temple (cx = 0)
      coords.push({ x: -1, y: 0, z: -1 });
      coords.push({ x: 1, y: 0, z: -1 });
      coords.push({ x: -1, y: 0, z: 0 });
      coords.push({ x: 1, y: 0, z: 0 });
      coords.push({ x: -1, y: 0, z: 1 });
      coords.push({ x: 1, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: -0.8 });
      coords.push({ x: 0, y: 1, z: 0.8 });
      coords.push({ x: 0, y: 1, z: 0 });
      coords.push({ x: 0, y: 2, z: 0 });

      // Sacred processional walkway
      coords.push({ x: -2, y: 0, z: 0 });
      coords.push({ x: 2, y: 0, z: 0 });
      coords.push({ x: -2, y: 0, z: -0.8, isFrozen: true });
      coords.push({ x: 2, y: 0, z: 0.8, isFrozen: true });

      return coords; // 28 tiles (3 heaps)
    }
  },

  // --- 20. 四體巡航艦隊 ---
  {
    id: 20,
    name: "四體巡航艦隊",
    desc: "四艘巡航艦分列四方，環繞中央長程飛行甲板，提供多路徑的跨艦隊協同消除。",
    icon: "🚀",
    targetValue: 2048,
    targetScore: 88888,
    generateGrid: () => {
      const coords = [];
      const hulls = [
        { cx: -2.5, cz: -1.2 },
        { cx: 2.5, cz: -1.2 },
        { cx: -2.5, cz: 1.2 },
        { cx: 2.5, cz: 1.2 }
      ];
      hulls.forEach(h => {
        for (let x = h.cx - 0.5; x <= h.cx + 0.5; x++) {
          for (let z = h.cz - 0.5; z <= h.cz + 0.5; z++) {
            coords.push({ x, y: 0, z });
          }
        }
        coords.push({ x: h.cx - 0.5, y: 1, z: h.cz });
        coords.push({ x: h.cx + 0.5, y: 1, z: h.cz });
        coords.push({ x: h.cx, y: 2, z: h.cz });
      }); // 4 * 7 = 28 tiles

      // Central runway deck
      for (let z = -1.5; z <= 1.5; z += 1) {
        coords.push({ x: -0.5, y: 0, z });
        coords.push({ x: 0.5, y: 0, z });
      } // 8 tiles
      coords.push({ x: 0, y: 1, z: -0.5 });
      coords.push({ x: 0, y: 1, z: 0.5 }); // 2 tiles

      // Perimeter buoys (distance 1.0 from runway, easily defrosted!)
      coords.push({ x: -1.5, y: 0, z: 0, isFrozen: true });
      coords.push({ x: 1.5, y: 0, z: 0, isFrozen: true });

      return coords; // 40 tiles (5 heaps: 4 hulls + central deck)
    }
  }
];

/**
 * Smart Multi-Heap Spatial Number Generator
 * Uses spatial clustering to group tiles into K independent heaps,
 * then symmetrically pairs numbers across complementary heaps from the top layer down.
 * Guarantees multiple accessible merge paths and eliminates single-path deadlocks.
 */
export function generateNumbersForGrid(coords, levelId = 1, targetValue = 2048) {
  const count = coords.length;
  const numTargets = Math.max(1, Math.floor(count / 10));
  let list = Array(numTargets).fill(targetValue);

  while (list.length < count) {
    let cand = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i] >= 8) cand.push(i);
    }
    if (cand.length === 0) {
      for (let i = 0; i < list.length; i++) {
        if (list[i] >= 4) cand.push(i);
      }
    }
    if (cand.length === 0) break;
    const idx = cand[Math.floor(Math.random() * cand.length)];
    const val = list[idx];
    list.splice(idx, 1, val / 2, val / 2);
  }
  list.sort((a, b) => a - b);

  // Cluster coordinates into spatial heaps based on (x, z)
  const heaps = [];
  coords.forEach((c, idx) => {
    let assigned = false;
    for (const h of heaps) {
      const dist = Math.hypot(c.x - h.cx, c.z - h.cz);
      if (dist < 1.75) {
        h.tiles.push({ coord: c, idx });
        h.cx = (h.cx * (h.tiles.length - 1) + c.x) / h.tiles.length;
        h.cz = (h.cz * (h.tiles.length - 1) + c.z) / h.tiles.length;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      heaps.push({ cx: c.x, cz: c.z, tiles: [{ coord: c, idx }] });
    }
  });

  // Sort tiles in each heap from top (high Y) to bottom
  heaps.forEach(h => {
    h.tiles.sort((a, b) => b.coord.y - a.coord.y);
  });

  const numbers = new Array(count);
  for (let i = 0; i < list.length; i += 2) {
    const valA = list[i];
    const valB = list[i + 1] || list[i];

    // Order heaps by highest remaining tile Y
    heaps.sort((h1, h2) => {
      const y1 = h1.tiles.length > 0 ? h1.tiles[0].coord.y : -1;
      const y2 = h2.tiles.length > 0 ? h2.tiles[0].coord.y : -1;
      return y2 - y1;
    });

    const hA = heaps.find(h => h.tiles.length > 0);
    const tA = hA ? hA.tiles.shift() : null;

    const hB = heaps.find(h => h !== hA && h.tiles.length > 0) || heaps.find(h => h.tiles.length > 0);
    const tB = hB ? hB.tiles.shift() : null;

    if (tA) numbers[tA.idx] = valA;
    if (tB) numbers[tB.idx] = valB;
  }

  for (let i = 0; i < count; i++) {
    if (!numbers[i]) numbers[i] = list[i] || 16;
  }

  return numbers;
}
