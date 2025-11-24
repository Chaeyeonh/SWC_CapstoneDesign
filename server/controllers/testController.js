const { launch } = require("../runner/launch");

async function runTest(req, res) {
  try {
    const { url, network, cpu, gpu } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    // 실제 headful 크롬창을 띄우고 LCP/FCP/TTFB 등 성능지표 측정
    const metrics = await launch(url, { network, cpu, gpu });

    return res.json({
      ok: true,
      metrics
    });

  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: "runner error",
      detail: String(e)
    });
  }
}

module.exports = { runTest };
