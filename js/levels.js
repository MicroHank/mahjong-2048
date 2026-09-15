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

  // --- 13. 雙王冠 ---
  {
    id: 13,
    name: "雙王冠",
    desc: "呈多角形起伏的王冠造型，外圍邊緣高低錯落。",
    icon: "👑",
    targetValue: 2048,
    targetScore: 52000,
    generateGrid: () => {
      const coords = [];
      // 左王冠 (Center x = -2.5)
      const oct = [
        [-3.5, -1], [-2.5, -1.5], [-1.5, -1],
        [-3.5, 0], [-1.5, 0],
        [-3.5, 1], [-2.5, 1.5], [-1.5, 1]
      ];
      oct.forEach(([cx, cz]) => coords.push({ x: cx, y: 0, z: cz }));
      coords.push({ x: -3.5, y: 1, z: -1 });
      coords.push({ x: -1.5, y: 1, z: -1 });
      coords.push({ x: -3.5, y: 1, z: 1 });
      coords.push({ x: -1.5, y: 1, z: 1 });
      coords.push({ x: -2.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 2, z: 0, isFrozen: true });

      // 右王冠 (Center x = 2.5)
      const rOct = [
        [1.5, -1], [2.5, -1.5], [3.5, -1],
        [1.5, 0], [3.5, 0],
        [1.5, 1], [2.5, 1.5], [3.5, 1]
      ];
      rOct.forEach(([cx, cz]) => coords.push({ x: cx, y: 0, z: cz }));
      coords.push({ x: 1.5, y: 1, z: -1 });
      coords.push({ x: 3.5, y: 1, z: -1 });
      coords.push({ x: 1.5, y: 1, z: 1 });
      coords.push({ x: 3.5, y: 1, z: 1 });
      coords.push({ x: 2.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 2, z: 0, isFrozen: true });

      // 權杖雙鎖
      coords.push({ x: -0.6, y: 0, z: 0 });
      coords.push({ x: 0.6, y: 0, z: 0 });
      return coords; // 32 tiles
    }
  },

    // --- 14. 對稱方陣 ---
  {
    id: 14,
    name: "對稱方陣",
    desc: "密集排列的多層方陣，方塊數量多且底座緊湊。",
    icon: "⚔️",
    targetValue: 2048,
    targetScore: 55000,
    generateGrid: () => {
      const coords = [];
      for (let x = -3.5; x <= -1.5; x += 1) {
        for (let z = -1.5; z <= 1.5; z += 1) {
          coords.push({ x, y: 0, z });
        }
      }
      coords.push({ x: -3, y: 1, z: -0.5 });
      coords.push({ x: -3, y: 1, z: 0.5 });
      coords.push({ x: -2, y: 1, z: -0.5 });
      coords.push({ x: -2, y: 1, z: 0.5 });
      coords.push({ x: -2.5, y: 2, z: 0 });

      for (let x = 1.5; x <= 3.5; x += 1) {
        for (let z = -1.5; z <= 1.5; z += 1) {
          coords.push({ x, y: 0, z });
        }
      }
      coords.push({ x: 2, y: 1, z: -0.5 });
      coords.push({ x: 2, y: 1, z: 0.5 });
      coords.push({ x: 3, y: 1, z: -0.5 });
      coords.push({ x: 3, y: 1, z: 0.5 });
      coords.push({ x: 2.5, y: 2, z: 0 });

      // 連通步階與戰鼓衛石
      coords.push({ x: 0, y: 0, z: -1.5 });
      coords.push({ x: 0, y: 0, z: -0.5, isFrozen: true });
      coords.push({ x: 0, y: 0, z: 0.5, isFrozen: true });
      coords.push({ x: 0, y: 0, z: 1.5 });
      return coords; // 38 tiles
    }
  },

    // --- 15. 展開雙翼 ---
  {
    id: 15,
    name: "展開雙翼",
    desc: "左右向外展開的翼狀造型，外側梯級逐層抬升。",
    icon: "🪽",
    targetValue: 2048,
    targetScore: 58000,
    generateGrid: () => {
      const coords = [];
      coords.push({ x: -1.5, y: 0, z: -1 });
      coords.push({ x: -1.5, y: 0, z: 0 });
      coords.push({ x: -1.5, y: 0, z: 1 });
      coords.push({ x: -2.5, y: 0, z: -1.5 });
      coords.push({ x: -2.5, y: 1, z: -0.5 });
      coords.push({ x: -2.5, y: 1, z: 0.5 });
      coords.push({ x: -2.5, y: 2, z: 0 });
      coords.push({ x: -2.5, y: 0, z: 1.5 });
      coords.push({ x: -3.5, y: 1, z: -1 });
      coords.push({ x: -3.5, y: 2, z: 0 });
      coords.push({ x: -3.5, y: 3, z: 0 });
      coords.push({ x: -3.5, y: 1, z: 1 });
      coords.push({ x: -2.5, y: 0, z: 0, isFrozen: true });

      coords.push({ x: 1.5, y: 0, z: -1 });
      coords.push({ x: 1.5, y: 0, z: 0 });
      coords.push({ x: 1.5, y: 0, z: 1 });
      coords.push({ x: 2.5, y: 0, z: -1.5 });
      coords.push({ x: 2.5, y: 1, z: -0.5 });
      coords.push({ x: 2.5, y: 1, z: 0.5 });
      coords.push({ x: 2.5, y: 2, z: 0 });
      coords.push({ x: 2.5, y: 0, z: 1.5 });
      coords.push({ x: 3.5, y: 1, z: -1 });
      coords.push({ x: 3.5, y: 2, z: 0 });
      coords.push({ x: 3.5, y: 3, z: 0 });
      coords.push({ x: 3.5, y: 1, z: 1 });
      coords.push({ x: 2.5, y: 0, z: 0, isFrozen: true });

      // 鳳凰涅槃心核
      coords.push({ x: 0, y: 0, z: -1 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 30 tiles
    }
  },

  // --- 16. 環形石柱 ---
  {
    id: 16,
    name: "環形石柱",
    desc: "立柱與橫梁交錯的環形結構，需先清除外側通道。",
    icon: "🗿",
    targetValue: 2048,
    targetScore: 60000,
    generateGrid: () => {
      const coords = [];
      coords.push({ x: -3.5, y: 0, z: -1 });
      coords.push({ x: -3.5, y: 0, z: 1 });
      coords.push({ x: -1.5, y: 0, z: -1 });
      coords.push({ x: -1.5, y: 0, z: 1 });
      coords.push({ x: -3.5, y: 1, z: 0 });
      coords.push({ x: -1.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 1, z: -1 });
      coords.push({ x: -2.5, y: 1, z: 1 });
      coords.push({ x: -2.5, y: 0, z: 0 });
      coords.push({ x: -2.5, y: 1, z: 0 });
      coords.push({ x: -2.5, y: 2, z: 0 });
      coords.push({ x: -3.5, y: 0, z: 0, isFrozen: true });

      coords.push({ x: 1.5, y: 0, z: -1 });
      coords.push({ x: 1.5, y: 0, z: 1 });
      coords.push({ x: 3.5, y: 0, z: -1 });
      coords.push({ x: 3.5, y: 0, z: 1 });
      coords.push({ x: 1.5, y: 1, z: 0 });
      coords.push({ x: 3.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 1, z: -1 });
      coords.push({ x: 2.5, y: 1, z: 1 });
      coords.push({ x: 2.5, y: 0, z: 0 });
      coords.push({ x: 2.5, y: 1, z: 0 });
      coords.push({ x: 2.5, y: 2, z: 0 });
      coords.push({ x: 3.5, y: 0, z: 0, isFrozen: true });

      coords.push({ x: 0, y: 0, z: -1 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 28 tiles
    }
  },

  // --- 17. 階梯大廈 ---
  {
    id: 17,
    name: "階梯大廈",
    desc: "多層退縮的對稱大樓，具備多層露台與連廊結構。",
    icon: "🏙️",
    targetValue: 2048,
    targetScore: 65000,
    generateGrid: () => {
      const coords = [];
      for (let x = -3.5; x <= -1.5; x++) {
        for (let z = -1; z <= 1; z++) {
          coords.push({ x, y: 0, z });
        }
      }
      coords.push({ x: -3, y: 1, z: -0.5 });
      coords.push({ x: -3, y: 1, z: 0.5 });
      coords.push({ x: -2, y: 1, z: -0.5 });
      coords.push({ x: -2, y: 1, z: 0.5 });
      coords.push({ x: -2.5, y: 2, z: -0.5 });
      coords.push({ x: -2.5, y: 2, z: 0.5 });
      coords.push({ x: -2.5, y: 3, z: 0 });
      coords.push({ x: -2.5, y: 1, z: 1.5, isFrozen: true });

      for (let x = 1.5; x <= 3.5; x++) {
        for (let z = -1; z <= 1; z++) {
          coords.push({ x, y: 0, z });
        }
      }
      coords.push({ x: 2, y: 1, z: -0.5 });
      coords.push({ x: 2, y: 1, z: 0.5 });
      coords.push({ x: 3, y: 1, z: -0.5 });
      coords.push({ x: 3, y: 1, z: 0.5 });
      coords.push({ x: 2.5, y: 2, z: -0.5 });
      coords.push({ x: 2.5, y: 2, z: 0.5 });
      coords.push({ x: 2.5, y: 3, z: 0 });
      coords.push({ x: 2.5, y: 1, z: 1.5, isFrozen: true });

      coords.push({ x: 0, y: 0, z: -1 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 38 tiles
    }
  },

    // --- 18. 太極石陣 ---
  {
    id: 18,
    name: "太極石陣",
    desc: "兩側呈曲線排列的對稱石陣，需兼顧兩端平衡推進。",
    icon: "🪐",
    targetValue: 2048,
    targetScore: 70000,
    generateGrid: () => {
      const coords = [];
      for (let z = -1.5; z <= 1.5; z++) {
        coords.push({ x: -3.5, y: 0, z });
        coords.push({ x: -2.5, y: 0, z, isFrozen: (z === -0.5) });
        coords.push({ x: -1.5, y: 0, z });
      }
      coords.push({ x: -3, y: 1, z: -1 });
      coords.push({ x: -3, y: 1, z: 0 });
      coords.push({ x: -2, y: 1, z: 0 });
      coords.push({ x: -2, y: 1, z: 1 });
      coords.push({ x: -2.5, y: 2, z: -0.5 });
      coords.push({ x: -2.5, y: 3, z: -0.5 });

      for (let z = -1.5; z <= 1.5; z++) {
        coords.push({ x: 1.5, y: 0, z });
        coords.push({ x: 2.5, y: 0, z, isFrozen: (z === 0.5) });
        coords.push({ x: 3.5, y: 0, z });
      }
      coords.push({ x: 2, y: 1, z: -1 });
      coords.push({ x: 2, y: 1, z: 0 });
      coords.push({ x: 3, y: 1, z: 0 });
      coords.push({ x: 3, y: 1, z: 1 });
      coords.push({ x: 2.5, y: 2, z: 0.5 });
      coords.push({ x: 2.5, y: 3, z: 0.5 });

      coords.push({ x: 0, y: 0, z: -1 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 40 tiles
    }
  },

  // --- 19. 柱廊神殿 ---
  {
    id: 19,
    name: "柱廊神殿",
    desc: "具備多根立柱與三角屋頂的古典殿堂，上方方塊較為集中。",
    icon: "🏛️",
    targetValue: 2048,
    targetScore: 75000,
    generateGrid: () => {
      const coords = [];
      // 左神殿 (Center x = -2.5)
      for (let x = -3.5; x <= -1.5; x += 1) {
        coords.push({ x, y: 0, z: -1 });
        coords.push({ x, y: 0, z: 1 });
      }
      coords.push({ x: -2.5, y: 0, z: 0 });
      for (let x = -3.5; x <= -1.5; x += 1) {
        coords.push({ x, y: 1, z: -1 });
        coords.push({ x, y: 1, z: 1 });
      }
      coords.push({ x: -2.5, y: 1, z: 0 });
      coords.push({ x: -3, y: 2, z: 0 });
      coords.push({ x: -2, y: 2, z: 0 });
      coords.push({ x: -2.5, y: 3, z: 0 });
      coords.push({ x: -3.5, y: 0, z: 0, isFrozen: true });

      // 右神殿 (Center x = 2.5)
      for (let x = 1.5; x <= 3.5; x += 1) {
        coords.push({ x, y: 0, z: -1 });
        coords.push({ x, y: 0, z: 1 });
      }
      coords.push({ x: 2.5, y: 0, z: 0 });
      for (let x = 1.5; x <= 3.5; x += 1) {
        coords.push({ x, y: 1, z: -1 });
        coords.push({ x, y: 1, z: 1 });
      }
      coords.push({ x: 2.5, y: 1, z: 0 });
      coords.push({ x: 2, y: 2, z: 0 });
      coords.push({ x: 3, y: 2, z: 0 });
      coords.push({ x: 2.5, y: 3, z: 0 });
      coords.push({ x: 3.5, y: 0, z: 0, isFrozen: true });

      // 眾神聖道
      coords.push({ x: 0, y: 0, z: -1 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 40 tiles
    }
  },

    // --- 20. 雙體巡航船 ---
  {
    id: 20,
    name: "雙體巡航船",
    desc: "大型雙體船型造型，方塊總數最多，為全系列最終關卡。",
    icon: "🚀",
    targetValue: 2048,
    targetScore: 88888,
    generateGrid: () => {
      const coords = [];
      for (let x = -3.5; x <= -1.5; x++) {
        for (let z = -1.5; z <= 1.5; z++) {
          const isFz = (x === -2.5 && z === -1.5);
          coords.push({ x, y: 0, z, ...(isFz ? { isFrozen: true } : {}) });
        }
      }
      for (let x = -3; x <= -2; x++) {
        coords.push({ x, y: 1, z: -1 });
        coords.push({ x, y: 1, z: 0 });
      }
      coords.push({ x: -2.5, y: 2, z: -0.5 });
      coords.push({ x: -2.5, y: 3, z: -0.5 });

      for (let x = 1.5; x <= 3.5; x++) {
        for (let z = -1.5; z <= 1.5; z++) {
          const isFz = (x === 2.5 && z === -1.5);
          coords.push({ x, y: 0, z, ...(isFz ? { isFrozen: true } : {}) });
        }
      }
      for (let x = 2; x <= 3; x++) {
        coords.push({ x, y: 1, z: -1 });
        coords.push({ x, y: 1, z: 0 });
      }
      coords.push({ x: 2.5, y: 2, z: -0.5 });
      coords.push({ x: 2.5, y: 3, z: -0.5 });

      coords.push({ x: 0, y: 0, z: -1 });
      coords.push({ x: 0, y: 0, z: 0 });
      coords.push({ x: 0, y: 0, z: 1 });
      coords.push({ x: 0, y: 1, z: 0, isFrozen: true });
      return coords; // 40 tiles
    }
  }
];

/**
 * Smart Symmetric Pairing Binary Number Generator
 * Guarantees that binary merge trees are symmetrically distributed across wings,
 * ensuring levels are 100% winnable purely through player skill without requiring shuffle.
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

  // Group coordinates by left, right wings and center
  const leftCoords = coords.filter(c => c.x < -0.3).sort((a, b) => {
    if (b.y !== a.y) return b.y - a.y;
    return Math.abs(b.x) - Math.abs(a.x);
  });
  const rightCoords = coords.filter(c => c.x > 0.3).sort((a, b) => {
    if (b.y !== a.y) return b.y - a.y;
    return Math.abs(b.x) - Math.abs(a.x);
  });
  const centerCoords = coords.filter(c => Math.abs(c.x) <= 0.3).sort((a, b) => b.y - a.y);

  const numbers = new Array(count);
  for (let i = 0; i < list.length; i += 2) {
    const valA = list[i];
    const valB = list[i + 1] || list[i];

    if (leftCoords.length > 0 && rightCoords.length > 0) {
      const cL = leftCoords.shift();
      const cR = rightCoords.shift();
      numbers[coords.indexOf(cL)] = valA;
      numbers[coords.indexOf(cR)] = valB;
    } else {
      const remain = leftCoords.length > 0 ? leftCoords : (rightCoords.length > 0 ? rightCoords : centerCoords);
      const c1 = remain.shift();
      const c2 = remain.shift();
      if (c1) numbers[coords.indexOf(c1)] = valA;
      if (c2) numbers[coords.indexOf(c2)] = valB;
    }
  }

  for (let i = 0; i < count; i++) {
    if (!numbers[i]) numbers[i] = list[i] || 16;
  }

  return numbers;
}
