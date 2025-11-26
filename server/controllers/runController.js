const { launch } = require("../runner/launch");
const { generatePresets } = require("../utils/presetGenerator");

exports.run = async (req, res) => {
  const { url, cpu = [], network = [], gpu = [], memory = [] } = req.body;

  if (!url) {
    return res.status(400).json({ ok: false, error: "url is required" });
  }

  if (
    !Array.isArray(cpu) ||
    !Array.isArray(network) ||
    !Array.isArray(gpu) ||
    !Array.isArray(memory) ||
    cpu.length === 0 ||
    network.length === 0 ||
    gpu.length === 0 ||
    memory.length === 0
  ) {
    return res.status(400).json({
      ok: false,
      error: "cpu, network, gpu, memory must be non-empty arrays",
    });
  }

  const presets = generatePresets(cpu, network, gpu, memory);
  const results = [];

  for (const preset of presets) {
    const metrics = await launch(url, {
      cpu: preset.cpu,
      network: preset.network,
      gpu: preset.gpu,
      memory: preset.memory,
      headless: true,
    });

    results.push({ preset, metrics });
  }

  res.json({ ok: true, results });
};

exports.runHeadful = async (req, res) => {
  const { url, preset } = req.body;

  if (!url) {
    return res.status(400).json({ ok: false, error: "url is required" });
  }

  if (
    !preset ||
    !preset.cpu ||
    !preset.network ||
    !preset.gpu ||
    !preset.memory
  ) {
    return res
      .status(400)
      .json({ ok: false, error: "preset with cpu/network/gpu/memory is required" });
  }

  const metrics = await launch(url, {
    cpu: preset.cpu,
    network: preset.network,
    gpu: preset.gpu,
    memory: preset.memory,
    headless: false,
  });

  res.json({ ok: true, preset, metrics });
};
