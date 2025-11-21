const fs = require("fs");
const path = require("path");
const { applyNetworkConditions } = require("./network");
const { createBrowser } = require("./browser");
const { applyCPUThrottling } = require("./cpu");

async function captureFilmstrip(url, { cpu, network, gpu }) {
  const browser = await createBrowser(gpu);
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await applyNetworkConditions(client, network);
  await applyCPUThrottling(client, cpu);
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

  // LCP,FCP 성능지표
  await page.evaluateOnNewDocument(() => {
    window.__perf = {
      lcp: 0,
      fcp: 0,
      blankUntil: 0,
    };

    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      window.__perf.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    // FCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcp = entries.find(e => e.name === "first-contentful-paint");
      if (fcp) window.__perf.fcp = fcp.startTime;
    }).observe({ type: "paint", buffered: true });

    // INP
    // new PerformanceObserver((entryList) => {
    //   for (const entry of entryList.getEntries()) {
    //     if (!window.__perf.inp || entry.duration > window.__perf.inp) {
    //       window.__perf.inp = entry.duration;
    //     }
    //   }
    // }).observe({ type: "event", buffered: true });
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });

  //TTFB 계산
   const nav = JSON.parse(
    await page.evaluate(() =>
      JSON.stringify(performance.getEntriesByType("navigation")[0])
    )
  );

  const ttfb = nav.responseStart - nav.requestStart;




  // 3) Filmstrip 캡처
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

  //LCP,FCP 가져오기
  const perf = await page.evaluate(() => window.__perf);

  const metrics = {
    lcp: perf.lcp,
    fcp: perf.fcp,
    //inp: perf.inp,
    ttfb: ttfb,
  };

  await browser.close();

  return {
    ok: true,
    runId,
    frames,
    directory: `filmstrip/${runId}`,
    metrics
  };
}

module.exports = { captureFilmstrip };
