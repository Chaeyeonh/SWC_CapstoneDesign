const { applyNetworkConditions } = require("./network");
const { createBrowser } = require("./browser");
const { applyCPUThrottling } = require("./cpu");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function launch(url, { cpu, network, gpu, headless = false }) {
  const browser = await createBrowser(gpu, headless);
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();

  await applyNetworkConditions(client, network);
  await applyCPUThrottling(client, cpu);

  console.log(">>> launch.js LOADED");



  // 옵저버 주입 

  await page.evaluateOnNewDocument(() => {
    window.__perf = { lcp: 0, fcp: 0, inp: 0 };

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      window.__perf.lcp = last.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcp = entries.find(e => e.name === "first-contentful-paint");
      if (fcp) window.__perf.fcp = fcp.startTime;
    }).observe({ type: "paint", buffered: true });

    new PerformanceObserver((entryList) => {
      for (const e of entryList.getEntries()) {
        if (!window.__perf.inp || e.duration > window.__perf.inp) {
          window.__perf.inp = e.duration;
        }
      }
    }).observe({ type: "event", buffered: true });
  });


  await page.goto(url, { waitUntil: "domcontentloaded" });
  await sleep(1500);
  const perf = await page.evaluate(() => window.__perf);


  // TTFB
  const nav = JSON.parse(
    await page.evaluate(() =>
      JSON.stringify(performance.getEntriesByType("navigation")[0])
    )
  );
  const ttfb = nav.responseStart - nav.requestStart;

  console.log("FINAL METRICS:", perf);

  return {

      lcp: perf.lcp,
      fcp: perf.fcp,
      inp: perf.inp,
      ttfb

  };
}

module.exports = { launch };
