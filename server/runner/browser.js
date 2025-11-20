// server/runner/browser.js
const puppeteer = require("puppeteer");

async function createBrowser(gpu = "on") {
  const args = [];

  if (gpu === "off") {
    args.push("--disable-gpu");
    args.push("--disable-accelerated-2d-canvas");
    args.push("--disable-webgl");
  }

  return puppeteer.launch({
    headless: true,
    args
  });
}


module.exports = { createBrowser };
