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
    try {
      const launchResult = await launch(url, {
        cpu: preset.cpu,
        network: preset.network,
        gpu: preset.gpu,
        memory: preset.memory,
        headless: true,
      });

      // launch 결과가 timeout이나 에러인지 확인 (metrics 필드가 있으면 에러/timeout)
      if ('metrics' in launchResult && launchResult.metrics === null) {
        // Timeout 또는 에러 케이스
        console.log(`[runController] Timeout/Error detected for preset:`, preset);
        results.push({
          preset,
          metrics: null,
          timeout: launchResult.timeout || false,
          error: launchResult.error || "Unknown error",
        });
      } else {
        // 정상적인 metrics인 경우 (lcp, fcp, cls, ttfb가 있음)
        console.log(`[runController] Normal metrics for preset:`, preset);
        results.push({
          preset,
          metrics: {
            lcp: launchResult.lcp !== null && launchResult.lcp !== undefined ? Number(launchResult.lcp) : 0,
            fcp: launchResult.fcp !== null && launchResult.fcp !== undefined ? Number(launchResult.fcp) : 0,
            cls: launchResult.cls !== null && launchResult.cls !== undefined ? Number(launchResult.cls) : 0,
            ttfb: launchResult.ttfb !== null && launchResult.ttfb !== undefined ? Number(launchResult.ttfb) : 0,
          },
          timeout: false,
          error: null,
        });
      }
    } catch (error) {
      // 예상치 못한 에러 발생 시
      console.error(`Error running preset ${JSON.stringify(preset)}:`, error.message);
      results.push({
        preset,
        metrics: null,
        timeout: false,
        error: error.message || "Unknown error",
      });
    }
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
