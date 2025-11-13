const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("UX Visualizer backend running");
});

// 임시 테스트 API
app.post("/run-test", async (req, res) => {
  const { url, network } = req.body || {};
  console.log("run-test called:", url, network);

  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new", // 최신 Puppeteer 옵션
    });
    const page = await browser.newPage();

    // TODO: network 조건은 나중에 붙이기
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // 일단은 전체 페이지 스크린샷 하나만 찍어보자
    await page.screenshot({ path: "screenshot.png", fullPage: true });

    await browser.close();

    res.json({
      ok: true,
      message: "Test finished (dummy). Screenshot saved on server.",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "puppeteer error", detail: String(e) });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
