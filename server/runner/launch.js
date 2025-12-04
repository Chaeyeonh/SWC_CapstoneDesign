const { applyNetworkConditions } = require("./network");
const { createBrowser } = require("./browser");
const { applyCPUThrottling } = require("./cpu");
const { applyMemoryConditions } = require("./memory");

async function launch(url, { cpu, network, gpu, memory, headless = true, timeout = 180000, observationWindow = 5000 }) {
  let browser;
  
  try {
    browser = await createBrowser(gpu, headless, memory);
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();

    await applyNetworkConditions(client, network);
    await applyCPUThrottling(client, cpu);
    await applyMemoryConditions(client, memory);

    console.log(">>> launch.js LOADED ");

    // ---------------------------------------------------------
    // 1) Enhanced LCP/FCP/CLS Observer with session windowing
    // ---------------------------------------------------------
    await page.evaluateOnNewDocument(() => {
      window.__metrics = {
        lcpEntry: null,
        fcpEntry: null,
        clsValue: 0,
        clsSessions: [],
        currentSession: { value: 0, startTime: 0 },
        done: false,
      };

      // LCP Observer
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__metrics.lcpEntry = entry;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });

      // FCP Observer
      new PerformanceObserver((list) => {
        const entry = list.getEntries().find(e => e.name === "first-contentful-paint");
        if (entry) window.__metrics.fcpEntry = entry;
      }).observe({ type: "paint", buffered: true });

      // CLS Observer with session windowing (Lighthouse-style)
      new PerformanceObserver((list) => {
        const MAX_SESSION_GAP = 1000; // 1초동안 레이아웃 변경 없으면 세선 종료, 새 세션 시작작
        const MAX_WINDOW_DURATION = 5000; // 세션 최대 지속 시간간
        
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            const m = window.__metrics;
            const timeSinceLastShift = entry.startTime - m.currentSession.startTime;
            
            // Start new session if gap > 1s or window > 5s
            if (timeSinceLastShift > MAX_SESSION_GAP || 
                timeSinceLastShift > MAX_WINDOW_DURATION) {
              if (m.currentSession.value > 0) {
                m.clsSessions.push(m.currentSession.value);
              }
              m.currentSession = { value: entry.value, startTime: entry.startTime };
            } else {
              m.currentSession.value += entry.value;
              m.currentSession.startTime = entry.startTime;
            }
            
            // Update max CLS across all sessions
            m.clsValue = Math.max(m.clsValue, m.currentSession.value);
          }
        }
      }).observe({ type: "layout-shift", buffered: true });

      // Finalize function
      const finalize = () => { 
        window.__metrics.done = true;
        // Finalize last CLS session
        if (window.__metrics.currentSession.value > 0) {
          window.__metrics.clsSessions.push(window.__metrics.currentSession.value);
          window.__metrics.clsValue = Math.max(...window.__metrics.clsSessions, 0);
        }
      };
      
      addEventListener("visibilitychange", finalize, { once: true });
      addEventListener("pagehide", finalize, { once: true });
    });

    // ---------------------------------------------------------
    // 2) Page Load with better error handling
    // ---------------------------------------------------------
    try {
      await page.goto(url, {
        waitUntil: "load",
        timeout,
      });
    } catch (e) {
      console.error(`Navigation error: ${e.message}`);
      return {
        metrics: null,
        timeout: true,
        error: e.message || "Navigation timeout",
      };
    }

    // ---------------------------------------------------------
    // 3) Observation window with metrics check
    // ---------------------------------------------------------
    console.log(`Waiting ${observationWindow}ms for metrics to stabilize...`);
    await new Promise(resolve => setTimeout(resolve, observationWindow));

    // Manually trigger finalization
    try {
      await page.evaluate(() => {
        const m = window.__metrics;
        if (!m.done) {
          if (m.currentSession.value > 0) {
            m.clsSessions.push(m.currentSession.value);
            m.clsValue = Math.max(...m.clsSessions, m.clsValue);
          }
          m.done = true;
        }
      });
      
    } catch (e) {
      console.warn("Could not trigger finalization:", e.message);
    }

    // ---------------------------------------------------------
    // 4) Extract Metrics with validation
    // ---------------------------------------------------------
    const metrics = await page.evaluate(() => {
      const m = window.__metrics;
      return {
        lcp: m.lcpEntry ? m.lcpEntry.startTime : null,
        fcp: m.fcpEntry ? m.fcpEntry.startTime : null,
        cls: m.clsValue || 0,
        done: m.done,
      };
    }).catch(e => {
      console.error("Error extracting metrics:", e.message);
      return { lcp: null, fcp: null, cls: 0, done: false };
    });

    // TTFB with fallback
    const nav = await page.evaluate(() => {
      const navEntry = performance.getEntriesByType("navigation")[0];
      return navEntry ? {
        responseStart: navEntry.responseStart,
        requestStart: navEntry.requestStart,
        fetchStart: navEntry.fetchStart,
      } : null;
    }).catch(() => null);

    const ttfb = nav ? nav.responseStart - nav.requestStart : null;

    return {
      metrics: {
        lcp: metrics.lcp !== null ? Number(metrics.lcp) : null,
        fcp: metrics.fcp !== null ? Number(metrics.fcp) : null,
        cls: Number(metrics.cls) || 0,
        ttfb: ttfb !== null ? Number(ttfb) : null,
      },
      timeout: false,
      error: null
    };
    

  } catch (error) {
    console.error("Launch error:", error);
    return {
      metrics: null,
      timeout: false,
      error: error.message,
    };
  
  }
}

module.exports = { launch };