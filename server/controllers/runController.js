const { launch } = require("../runner/launch");
const { generatePresets } = require("../utils/presetGenerator");
const { analyzeMetrics } = require("../utils/analyze");

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
    let ai = null;
    try {
      const { metrics, timeout, error } = await launch(url, {
        cpu: preset.cpu,
        network: preset.network,
        gpu: preset.gpu,
        memory: preset.memory,
        headless: true,
      });

      

      // metrics가 존재할 때만 GPT 분석 실행 (API 키가 있을 때만)
      if (!timeout && metrics) {
        try {
          ai = await analyzeMetrics(metrics);
        } catch (error) {
          // AI 분석 실패해도 계속 진행
          console.error(`AI analysis failed for preset:`, error.message);
          ai = null;
        }
      }
      console.log("AI RESULT:", ai);
      console.log("METRICS:", metrics);

      results.push({
        preset,
        metrics,
        timeout,
        error,
        ai
      });

    } catch (err) {
      results.push({
        preset,
        metrics: null,
        timeout: true,
        error: err.message,
        ai: null
      });
    }
  }
  


  res.json({ ok: true, results });
} 


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
