// server/runner/browser.js
const puppeteer = require("puppeteer");

async function createBrowser(gpu = "on") {
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ];

  if (gpu === "off") {
    args.push("--disable-gpu");
    args.push("--disable-accelerated-2d-canvas");
    args.push("--disable-webgl");
    args.push("--disable-software-rasterizer");
    args.push("--use-gl=disabled");
  }

  return puppeteer.launch({
    headless: false,        // 실제 크롬창 띄우기
    defaultViewport: null,  // 창 크기를 OS 기본값으로 (window 사이즈 그대로)
    args,
  });
}

module.exports = { createBrowser };
