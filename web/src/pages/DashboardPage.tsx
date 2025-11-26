import { useMemo } from "react";
import { EnvironmentSelector } from "../components/EnvironmentSelector";
import { PresetResultCard, type ChangedFactor } from "../components/PresetResultCard";
import { useRun, type Metrics, type ScreeningResult } from "../hooks/useRun";
import { useToggle } from "../hooks/useToggle";

function detectSpikes(
  results: ScreeningResult[],
  metricKey: keyof Metrics = "lcp"
) {
  if (!results || results.length === 0) return [];

  const sorted = [...results].sort(
    (a, b) => (a.metrics?.[metricKey] || 0) - (b.metrics?.[metricKey] || 0)
  );

  const spikes: {
    to: ScreeningResult;
    changedFactors: ChangedFactor[];
  }[] = [];

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

      spikes.push({
        to: curr,
        changedFactors,
      });
    }
  }

  return spikes;
}

function isBottleneck(m: Metrics | null) {
  if (!m) return false;
  if (m.lcp > 4000) return true;
  if (m.fcp > 3000) return true;
  if (m.inp > 500) return true;
  if (m.ttfb > 1800) return true;
  return false;
}

function getBrokenMetrics(m: Metrics | null) {
  if (!m) return [];
  const broken = [];
  if (m.lcp > 4000) broken.push("LCP > 4s (Poor)");
  if (m.fcp > 3000) broken.push("FCP > 3s (Poor)");
  if (m.inp > 500) broken.push("INP > 500ms (Poor)");
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
    <div style={{ padding: 32 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>UX Visualizer Dashboard</h1>
          <p style={{ color: "#475467", margin: 0 }}>
    
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={!canRun || loading}
          style={{
            padding: "10px 20px",
            borderRadius: 6,
            border: "none",
            background: canRun && !loading ? "#2563eb" : "#94a3b8",
            color: "#fff",
            fontSize: 16,
            cursor: canRun && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "재실행 중..." : "선택 preset 재실행"}
        </button>
      </header>

      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
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

        <div
          style={{
            flex: "1 1 260px",
            minWidth: 240,
            background: "#f9fafb",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ marginTop: 0 }}>선택 요약</h3>
          <p>
            <strong>URL:</strong> {url || "-"}
          </p>
          <p>
            <strong>CPU:</strong> {cpus.length ? cpus.join(", ") : "-"}
          </p>
          <p>
            <strong>Network:</strong>{" "}
            {networks.length ? networks.join(", ") : "-"}
          </p>
          <p>
            <strong>GPU:</strong> {gpus.length ? gpus.join(", ") : "-"}
          </p>
          <p>
            <strong>Memory:</strong> {memories.length ? memories.join(", ") : "-"}
          </p>
          <p style={{ marginTop: 12 }}>
            총 <strong>{totalPresets}</strong>개 조합
          </p>
          {!canRun && (
            <p style={{ color: "#b91c1c" }}>
              URL과 각 옵션에서 최소 1개 이상 선택해야 합니다.
            </p>
          )}
        </div>
      </section>


      {results.length === 0 ? (
        <p style={{ color: "#475467" }}>
          Popup에서 preset을 실행하면 결과가 여기 표시됩니다.
        </p>
      ) : (
        <section>
          <h2 style={{ marginBottom: 16 }}>
            스크리닝 결과 ({results.length})
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
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
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
