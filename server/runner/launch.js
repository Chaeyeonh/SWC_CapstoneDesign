
const { applyNetworkConditions } = require("./network");
const { createBrowser } = require("./browser");
const { applyCPUThrottling } = require("./cpu");

async function launch(url, { cpu, network, gpu }) {
  const browser = await createBrowser(gpu);
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await applyNetworkConditions(client, network);
  await applyCPUThrottling(client, cpu);


  // LCP,FCP 성능지표
  await page.evaluateOnNewDocument(() => {
    window.__perf = {
      lcp: 0,
      fcp: 0,
      inp: 0,
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

    //INP
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!window.__perf.inp || entry.duration > window.__perf.inp) {
          window.__perf.inp = entry.duration;
        }
      }
    }).observe({ type: "event", buffered: true });
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });


  //TTFB 계산
   const nav = JSON.parse(
    await page.evaluate(() =>
      JSON.stringify(performance.getEntriesByType("navigation")[0])
    )
  );

  const ttfb = nav.responseStart - nav.requestStart;

  //LCP,FCP 가져오기
  const perf = await page.evaluate(() => window.__perf);

   return {
    lcp: perf.lcp,
    fcp: perf.fcp,
    inp:perf.inp,
    ttfb,
  };
}

module.exports = { launch };
