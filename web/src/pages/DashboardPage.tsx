import { useMemo } from "react";
import { EnvironmentSelector } from "../components/EnvironmentSelector";
import { PresetResultCard, type ChangedFactor } from "../components/PresetResultCard";
import { useRun, type Metrics, type ScreeningResult } from "../hooks/useRun";
import { useToggle } from "../hooks/useToggle";

function detectSpikes(results: ScreeningResult[], metricKey: keyof Metrics = "lcp") {
  if (!results || results.length === 0) return [];

  const sorted = [...results].sort(
    (a, b) => (a.metrics?.[metricKey] || 0) - (b.metrics?.[metricKey] || 0)
  );

  const spikes: { to: ScreeningResult; changedFactors: ChangedFactor[] }[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const prevVal = prev.metrics?.[metricKey] ?? 0;
    const currVal = curr.metrics?.[metricKey] ?? 0;

    if (prev.metrics && curr.metrics && currVal > prevVal * 2) {
      const changedFactors: ChangedFactor[] = [];
      (["cpu", "network", "gpu", "memory"] as const).forEach((factor) => {
        if (prev.preset[factor] !== curr.preset[factor]) {
          changedFactors.push({
            factor,
            from: prev.preset[factor],
            to: curr.preset[factor],
          });
        }
      });

      spikes.push({ to: curr, changedFactors });
    }
  }

  return spikes;
}

function isBottleneck(m: Metrics | null) {
  if (!m) return false;
  if (m.lcp > 4000) return true;
  if (m.fcp > 3000) return true;
  if (m.cls > 0.25) return true;
  if (m.ttfb > 1800) return true;
  return false;
}

function getBrokenMetrics(m: Metrics | null) {
  if (!m) return [];
  const broken = [];
  if (m.lcp > 4000) broken.push("LCP > 4s (Poor)");
  if (m.fcp > 3000) broken.push("FCP > 3s (Poor)");
  if (m.cls > 0.25) broken.push("CLS > 0.25 (Poor)");
  if (m.ttfb > 1800) broken.push("TTFB > 1.8s (Poor)");
  return broken;
}

export default function DashboardPage() {
  const toggle = useToggle();
  const {
    url,
    setUrl,
    cpus,
    setCpus,
    networks,
    setNetworks,
    gpus,
    setGpus,
    memories,
    setMemories,
    results,
    loading,
    runPresets,
    runHeadful,
  } = useRun();

  const totalPresets = useMemo(
    () => cpus.length * networks.length * gpus.length * memories.length,
    [cpus.length, networks.length, gpus.length, memories.length]
  );

  const spikes = useMemo(() => detectSpikes(results, "lcp"), [results]);
  const canRun = url.trim().length > 0 && totalPresets > 0;

  const handleRun = async () => {
    if (!canRun) return;
    await runPresets();
  };

  return (
    <div className="p-8">

      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">UX Visualizer Dashboard</h1>
          <p className="text-gray-600 text-sm"></p>
        </div>

        <button
          onClick={handleRun}
          disabled={!canRun || loading}
          className={`px-6 py-2 rounded-md text-white text-base transition 
            ${canRun && !loading 
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" 
              : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? "재실행 중..." : "선택 preset 재실행"}
        </button>
      </header>

      {/* SELECTION SUMMARY + ENV SELECTOR */}
      <section className="flex flex-wrap gap-6 mb-8">
        
        {/* 환경설정 패널 */}
        <div className="flex-1 min-w-[320px]">
          <EnvironmentSelector
            url={url}
            setUrl={setUrl}
            cpus={cpus}
            setCpus={setCpus}
            networks={networks}
            setNetworks={setNetworks}
            gpus={gpus}
            setGpus={setGpus}
            memories={memories}
            setMemories={setMemories}
            toggle={toggle}
          />
        </div>

        {/* 선택 요약 */}
        <div className="flex-1 min-w-[260px] bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">선택 요약</h3>
          <p><strong>URL:</strong> {url || "-"}</p>
          <p><strong>CPU:</strong> {cpus.length ? cpus.join(", ") : "-"}</p>
          <p><strong>Network:</strong> {networks.length ? networks.join(", ") : "-"}</p>
          <p><strong>GPU:</strong> {gpus.length ? gpus.join(", ") : "-"}</p>
          <p><strong>Memory:</strong> {memories.length ? memories.join(", ") : "-"}</p>
          <p className="mt-3 text-sm">
            총 <strong>{totalPresets}</strong>개 조합
          </p>

          {!canRun && (
            <p className="text-red-600 text-sm mt-2">
              URL과 각 옵션에서 최소 1개 이상 선택해야 합니다.
            </p>
          )}
        </div>
      </section>

      {/* RESULTS */}
      {results.length === 0 ? (
        <p className="text-gray-600">Popup에서 preset을 실행하면 결과가 여기 표시됩니다.</p>
      ) : (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            스크리닝 결과 ({results.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((result, idx) => (
              <PresetResultCard
                key={`${result.preset.cpu}-${result.preset.network}-${result.preset.gpu}-${result.preset.memory}-${idx}`}
                index={idx}
                result={result}
                metrics={result.metrics}
                bottleneck={isBottleneck(result.metrics)}
                brokenMetrics={getBrokenMetrics(result.metrics)}
                spikeFactors={spikes.find((s) => s.to === result)?.changedFactors}
                onHeadful={() => runHeadful(result.preset)}
                timeout={result.timeout}
                error={result.error ?? null}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
