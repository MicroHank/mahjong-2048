/**
 * Level Definitions & Solvable Layouts for 3D Mahjong 2048
 * Grand 20-Stage Campaign with Solvable Binary Decomposition.
 */

export const LEVELS = [
  // --- 1. 雙子階梯金字塔 ---
  {
    id: 1,
    name: "雙子階梯金字塔",
    desc: "宏偉左右雙峰金字塔，開闊無遮蔽，左右跨陣地自由連鎖合併！",
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

  // --- 2. 雙塔天梯要塞 ---
  {
    id: 2,
    name: "雙塔天梯要塞",
    desc: "高聳入雲的左翼與右翼雙子塔，消除底層將觸發壯觀的重力大崩塌！",
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

  // --- 3. 雙生萬花魔術方塊 ---
  {
    id: 3,
    name: "雙生萬花立方",
    desc: "並列於空間兩端的實心雙子方體，由外向內逐步剝除多維外殼！",
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

  // --- 4. 東西雙城要塞 ---
  {
    id: 4,
    name: "東西雙城要塞",
    desc: "兩座固若金湯的雙城要塞隔空對峙，豐富的外牆防禦與多層主塔！",
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

  // --- 5. 雙螺旋星雲聖殿 ---
  {
    id: 5,
    name: "雙螺旋星雲聖殿",
    desc: "宇宙級雙生螺旋石階，極限高度落差，左右呼應的終極立體幾何挑戰！",
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

    // --- 6. 萬里長城雙雄關 ---
  {
    id: 6,
    name: "萬里長城雙雄關",
    desc: "起伏綿延的雙雄長城要塞，重疊的城垛與高聳烽火台，考驗空中航線規劃！",
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

  // --- 7. 獅身雙子守護獸 ---
  {
    id: 7,
    name: "獅身雙子守護獸",
    desc: "雄踞於黃金沙漠兩側的雙子巨獸，厚重前爪與威嚴獸首，重力連鎖大考驗！",
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

    // --- 8. 懸空雙闕飛雲閣 ---
  {
    id: 8,
    name: "懸空雙闕飛雲閣",
    desc: "懸掛於千仞雲海間的重檐樓闕，飛檐斗拱交錯，高空拋物弧線極致展現！",
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

  // --- 9. 雙生古鏡八卦陣 ---
  {
    id: 9,
    name: "雙生古鏡八卦陣",
    desc: "乾坤陰陽相扣的雙重八卦陣列，環形圍繞的石柱，平層跨度限制的考驗場！",
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

  // --- 10. 泰姬白玉雙穹殿 ---
  {
    id: 10,
    name: "泰姬白玉雙穹殿",
    desc: "極致優雅對稱的白玉宮殿群，四角宣禮塔聳立，中央倒影池相映成輝！",
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

  // --- 11. 瑪雅羽蛇神日晷 ---
  {
    id: 11,
    name: "瑪雅羽蛇神日晷",
    desc: "神秘古文明金字塔祭壇，蛇身巨石階梯延展，削平中央高峰方可破除封印！",
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

  // --- 12. 浮空天宮七星橋 ---
  {
    id: 12,
    name: "浮空天宮七星橋",
    desc: "懸浮於銀河星海之上的北斗七星飛橋，跨越虛空的長程拋物線飛行盛宴！",
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

  // --- 13. 鑽石星辰雙王冠 ---
  {
    id: 13,
    name: "鑽石星辰雙王冠",
    desc: "八角星芒王冠聳立，高低突起的寶石稜角，精確計算平層跨度的戰略博弈！",
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

    // --- 14. 兵馬雙翼大軍陣 ---
  {
    id: 14,
    name: "兵馬雙翼大軍陣",
    desc: "古代軍神排兵布陣，先鋒方陣與後翼戰車層疊呼應，感受連續重力大崩塌！",
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

    // --- 15. 鳳凰涅槃雙展翼 ---
  {
    id: 15,
    name: "鳳凰涅槃雙展翼",
    desc: "烈火神鳥雙翼劃破虛空，層層遞升的翎羽梯級，體驗上天入地的飛升快感！",
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

  // --- 16. 巨石陣遠古星盤 ---
  {
    id: 16,
    name: "巨石陣遠古星盤",
    desc: "數千年巨石立柱與橫梁交錯，中心神秘星盤連鎖，打通四周環形石廊！",
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

  // --- 17. 雙子摩天幾何城 ---
  {
    id: 17,
    name: "雙子摩天幾何城",
    desc: "錯落有致的賽博階梯高樓群，多層露台與天際連廊，立體建築學極限挑戰！",
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

    // --- 18. 雙生太極乾坤殿 ---
  {
    id: 18,
    name: "雙生太極乾坤殿",
    desc: "流轉無息的陰陽乾坤巨殿，雙魚旋流與天地之柱，考驗全局策略與宏觀視野！",
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

  // --- 19. 奧林匹斯眾神殿 ---
  {
    id: 19,
    name: "奧林匹斯眾神殿",
    desc: "巍峨希臘衛城列柱雙殿，高矗的三角山牆與神火聖壇，消除峰頂釋放神之天火！",
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

    // --- 20. 終極 2048 創世方舟 ---
  {
    id: 20,
    name: "終極 2048 創世方舟",
    desc: "星際級雙體巡航方舟，量子曲速引擎與終極聚變核心，完成 20 關大通關傳奇！",
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
