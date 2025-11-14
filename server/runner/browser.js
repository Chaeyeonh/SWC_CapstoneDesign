// server/runner/browser.js
const puppeteer = require("puppeteer");

async function createBrowser() {
  return puppeteer.launch({
    headless: "new",
    defaultViewport: null,
  });
}

module.exports = { createBrowser };
