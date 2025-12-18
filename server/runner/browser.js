const puppeteer = require("puppeteer");

// --- 1. 메모리 프리셋 정의 (복사/붙여넣기) ---
const memoryPresets = {
  "very-low": { maxMemoryUsage: 512 },
  "low": { maxMemoryUsage: 1024 },
  "medium": { maxMemoryUsage: 2048 },
  "high": { maxMemoryUsage: 3072 }, 
};

/**
 * V8 힙 크기 제한 인수를 생성합니다. (메모리 시뮬레이션 핵심)
 * @param {string} memoryMode - 사용할 메모리 프리셋 키
 * @returns {string[]} - V8 힙 제한 인수가 담긴 배열
 */
function getV8MemoryLimitArgs(memoryMode) {
  const preset = memoryPresets[memoryMode] || memoryPresets['medium'];
  return [
    `--js-flags="--max-old-space-size=${preset.maxMemoryUsage}"`,
  ];
}
// ---------------------------------------------


// createBrowser 함수의 인수에 memoryMode를 추가합니다.
async function createBrowser(gpu = "on", headless = false, memoryMode = "medium") { 
  let args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage", // 메모리 환경에 도움
  ];

  // GPU 제어 로직 (기존 코드)
  if (gpu === "off") {
    args.push("--disable-gpu");
    args.push("--disable-accelerated-2d-canvas");
    args.push("--disable-webgl");
    args.push("--disable-software-rasterizer");
    args.push("--use-gl=disabled");
  }
  
  // 2. 메모리 제한 인수 추가 (새로운 로직)
  const memoryArgs = getV8MemoryLimitArgs(memoryMode);
  args = args.concat(memoryArgs); // 기존 인수에 메모리 제한 인수 합치기

  console.log(`[Browser Launch] GPU: ${gpu}, Memory: ${memoryMode} 적용. Total Args: ${args.length}`);

  return puppeteer.launch({
    headless: headless,
    defaultViewport: null,
    args: args, // 최종 인수를 Puppeteer에 전달
  });
}

// ---------------------------------------------

// 참고: 이제 이 모듈을 사용하는 API 핸들러(`api/run`) 쪽에서도 `memoryMode`를 전달해줘야 합니다.
module.exports = { createBrowser, memoryPresets };