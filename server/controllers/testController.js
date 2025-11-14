const { captureFilmstrip } = require("../runner/captureFilmstrip");

async function runTest(req, res) {
  try {
    const { url, network } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const frames = await captureFilmstrip(url, network);
    return res.json({ ok: true, frames });

  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: "runner error",
      detail: String(e)
    });
  }
}

module.exports = { runTest };
