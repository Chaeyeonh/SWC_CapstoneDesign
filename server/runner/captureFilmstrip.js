const fs = require("fs");
const path = require("path");
const { applyNetworkConditions } = require("./network");
const { createBrowser } = require("./browser");

async function captureFilmstrip(url, network) {
  const browser = await createBrowser();
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await applyNetworkConditions(client, network);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 1) 실행마다 폴더 고유 생성
  const runId = Date.now();  // 또는 uuid
  const directory = path.join("storage", "filmstrip", String(runId));

  // 2) 폴더 생성
  fs.mkdirSync(directory, { recursive: true });

  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // 3) 촬영 설정
  const frames = [];
  const INTERVAL = 500;
  const DURATION = 5000;
  const start = Date.now();

  while (Date.now() - start < DURATION) {
    const timestamp = Date.now() - start;
    const filepath = path.join(directory, `frame_${timestamp}.png`);

    await page.screenshot({ path: filepath, fullPage: true });
    frames.push({
      timestamp,
      path: `filmstrip/${runId}/frame_${timestamp}.png`
    });

    await sleep(INTERVAL);
  }

  await browser.close();

  return {
    ok: true,
    runId,
    frames,
    directory: `filmstrip/${runId}`
  };
}

module.exports = { captureFilmstrip };
