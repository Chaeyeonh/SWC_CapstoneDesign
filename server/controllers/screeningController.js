const presets = require("../presets/screening.json");
const { captureFilmstrip } = require("../runner/captureFilmstrip");

exports.runScreening = async (req, res) => {
  const { url } = req.body;
  const results = [];

  for (const preset of presets) {
    const out = await captureFilmstrip(url, preset);
    results.push({ preset, out });
  }

  res.json({ ok: true, results });
};
