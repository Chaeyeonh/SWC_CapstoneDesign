const { launch } = require("../runner/launch");
const { generatePresets } = require("../utils/presetGenerator");

exports.run = async (req, res) => {
  const { url, cpu, network, gpu, memory } = req.body;

  if (!url) {
    return res.status(400).json({ ok: false, error: "url is required" });
  }

  // cpu, network, gpu, memory 는 배열 형태로 넘어옴
  const presets = generatePresets(cpu, network, gpu, memory);
  const results = [];

  for (const preset of presets) {
    const metrics = await launch(url, {
      cpu: preset.cpu,
      network: preset.network,
      gpu: preset.gpu,
      memory: preset.memory,
      headless: true   // 모든 Screening은 headless
    });

    results.push({ preset, metrics });
  }

  res.json({ ok: true, results });
};
