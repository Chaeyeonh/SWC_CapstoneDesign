// server/runner/browser.js
const puppeteer = require("puppeteer");

async function createBrowser(gpu = "on", headless = false) {
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
    headless: headless,       // 전달된 headless 설정 적용
    defaultViewport: null,
    args,
  });
}

module.exports = { createBrowser };
