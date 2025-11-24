const presets = require("../presets/screening.json");
const { launch } = require("../runner/launch");

exports.runScreening = async (req, res) => {
  const { url } = req.body;
  const results = [];

  for (const preset of presets) {
    const metrics = await launch(url,preset);
    results.push({ preset, metrics });
  }

  res.json({ ok: true, results });
};
