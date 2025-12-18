const { applyNetworkConditions } = require("./network");
const { createBrowser } = require("./browser");
const { applyCPUThrottling } = require("./cpu");

async function launch(url, { 
  cpu,     
  network, 
  gpu, 
  memory, 
  headless = true, 
  timeout = 180000, 
}) {
  let browser;
  
  try {
    browser = await createBrowser(gpu, headless, memory);
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();

    // 1. 설정 적용 (CPU 및 네트워크)
    
    await applyCPUThrottling(client, cpu);
    await applyNetworkConditions(client, network);

    console.log(`>>> launch.js: Environments applied (CPU: ${cpu}, Network: ${network})`);

    // 2. 브라우저 내 메트릭 수집 스크립트 주입 (기존 로직 유지)
    await page.evaluateOnNewDocument(() => {
      window.__metrics = {
        lastLcpAt: 0, 
        lastFcpAt: 0,
        lcpEntry: null,
        lcpCandidates: [],
        fcpEntry: null,
        clsValue: 0,
        clsSessions: [],
        currentSession: { value: 0, startTime: 0, entries: [] },
        observersStopped: false,
        finalizedAt: null,
      };

      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        if (window.__metrics.observersStopped) return;
        const entries = list.getEntries();
        for (const entry of entries) {
          window.__metrics.lcpCandidates.push({
            startTime: entry.startTime,
            size: entry.size,
          });
          window.__metrics.lcpEntry = entry;
          window.__metrics.lastLcpAt = performance.now();
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      // FCP Observer
      const fcpObserver = new PerformanceObserver((list) => {
        if (window.__metrics.observersStopped) return;
        const entry = list.getEntries().find(e => e.name === "first-contentful-paint");
        if (entry) {
          window.__metrics.fcpEntry = entry;
          window.__metrics.lastFcpAt = performance.now();
        }
      });
      fcpObserver.observe({ type: "paint", buffered: true });

      // CLS Observer (Lighthouse 방식 세션 계산)
      const clsObserver = new PerformanceObserver((list) => {
        if (window.__metrics.observersStopped) return;
        const MAX_SESSION_GAP = 1000;
        const MAX_WINDOW_DURATION = 5000;
        
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            const m = window.__metrics;
            if (m.currentSession.entries.length === 0 || 
                (entry.startTime - m.currentSession.startTime > MAX_SESSION_GAP) ||
                (entry.startTime - m.currentSession.entries[0].startTime > MAX_WINDOW_DURATION)) {
              if (m.currentSession.entries.length > 0) m.clsSessions.push({...m.currentSession});
              m.currentSession = { value: entry.value, startTime: entry.startTime, entries: [entry] };
            } else {
              m.currentSession.value += entry.value;
              m.currentSession.startTime = entry.startTime;
              m.currentSession.entries.push(entry);
            }
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });

      window.__stopObservers = () => {
        if (window.__metrics.observersStopped) return;
        window.__metrics.observersStopped = true;
        lcpObserver.disconnect();
        fcpObserver.disconnect();
        clsObserver.disconnect();
        
        // 최종 CLS 계산
        const m = window.__metrics;
        if (m.currentSession.entries.length > 0) m.clsSessions.push(m.currentSession);
        m.clsValue = m.clsSessions.length > 0 ? Math.max(...m.clsSessions.map(s => s.value)) : 0;
        m.finalizedAt = performance.now();
      };
    });

    // 3. 페이지 이동
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout });
      console.log(`✓ Navigation completed`);
    } catch (e) {
      console.warn(`⚠ Navigation timeout/error: ${e.message}. Proceeding to extract metrics.`);
    }

    // 4. 동적 안정화 대기 (LCP 업데이트 후 1초간 정지 상태인지 확인)
    const LCP_STABILIZE_GAP = 1000;
    try {
      await page.waitForFunction((gap) => {
        const m = window.__metrics;
        return m.fcpEntry && m.lastLcpAt > 0 && (performance.now() - m.lastLcpAt) > gap;
      }, { polling: 500, timeout: 30000 }, LCP_STABILIZE_GAP);
      console.log(`✓ Metrics stabilized.`);
    } catch (e) {
      console.warn(`⚠ Dynamic wait timed out. Page may still be loading.`);
    }

    // 5. 수동 정지 및 메트릭 추출
    await page.evaluate(() => window.__stopObservers?.());
    
    const metrics = await page.evaluate(() => {
      const m = window.__metrics;
      const nav = performance.getEntriesByType("navigation")[0];
      return {
        lcp: m.lcpEntry?.startTime ?? null,
        fcp: m.fcpEntry?.startTime ?? null,
        cls: m.clsValue || 0,
        ttfb: nav ? nav.responseStart - nav.fetchStart : null,
        lcpCandidatesCount: m.lcpCandidates.length,
        observersStopped: m.observersStopped
      };
    });

    
    // 최종 결과 반환
    return {
      metrics: {
        lcp: metrics.lcp,
        fcp: metrics.fcp,
        cls: metrics.cls,
        ttfb: metrics.ttfb
      },
      debug: { lcpCandidatesCount: metrics.lcpCandidatesCount },
      timeout: false,
      error: null
    };

  } catch (error) {
    if (browser) await browser.close();
    return { metrics: null, timeout: false, error: error.message };
  }
}

module.exports = { launch };