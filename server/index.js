const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("UX Visualizer backend running");
});

app.post("/run-test", async (req, res) => {
  const { url, network } = req.body || {};
  console.log("run-test called:", url, network);

  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      defaultViewport: null,
    });

    const page = await browser.newPage();

    // CDP 세션 생성
    const client = await page.target().createCDPSession();
    await client.send("Network.enable");

    // 네트워크 조건 적용
    if (network === "slow-3g") {
      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: (500 * 1024) / 8,     // 500kbps
        uploadThroughput: (500 * 1024) / 8,
        latency: 400,
      });
    }

    if (network === "fast-3g") {
      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
        latency: 150,
      });
    }

    if (network === "4g") {
      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: (7 * 1024 * 1024) / 8,
        uploadThroughput: (3 * 1024 * 1024) / 8,
        latency: 20,
      });
    }

    //네트워크 적용 후, 페이지 이동 시간 측정 시작
    const start = Date.now();
    console.log(`[${network}] Navigation start:`, start);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const end = Date.now();
    console.log(`[${network}] Navigation end:`, end);
    console.log(
      `[${network}] Navigation time:`,
      ((end - start) / 1000).toFixed(2),
      "sec"
    );


    // 스크린샷 저장
    await page.screenshot({ path: "screenshot4G.png", fullPage: true });

    await browser.close();

    res.json({
      ok: true,
      network,
      message: "Test finished with network simulation",
    });

  } catch (e) {
    console.error("Puppeteer error:", e);
    res.status(500).json({ error: "puppeteer error", detail: String(e) });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
