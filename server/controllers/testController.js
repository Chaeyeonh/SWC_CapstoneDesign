const { launch } = require("../runner/launch");

async function runTest(req, res) {
  try {
    const { url, network, cpu, gpu, memory } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const metrics = await launch(url, {
      network,
      cpu,
      gpu,
      memory,
      headless: false       //  실제 창 띄우기
    });

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
