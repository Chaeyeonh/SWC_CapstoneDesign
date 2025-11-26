import type { Metrics, Preset, ScreeningResult } from "../hooks/useRun";

export interface ChangedFactor {
  factor: keyof Preset;
  from: string;
  to: string;
}

interface PresetResultCardProps {
  index: number;
  result: ScreeningResult;
  metrics: Metrics | null;
  bottleneck: boolean;
  brokenMetrics: string[];
  spikeFactors?: ChangedFactor[];
  onHeadful: () => void;
}

export function PresetResultCard({
  index,
  result,
  metrics,
  bottleneck,
  brokenMetrics,
  spikeFactors,
  onHeadful,
}: PresetResultCardProps) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: bottleneck ? "#fee2e2" : "#ecfccb",
        border: bottleneck ? "1px solid #f87171" : "1px solid #84cc16",
        boxShadow: "0 10px 20px -10px rgba(15, 23, 42, 0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ margin: 0 }}>Preset #{index + 1}</h4>
        <button
          onClick={onHeadful}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #0f172a",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Headful 보기
        </button>
      </div>

      <p style={{ margin: "8px 0 0" }}>
        <strong>CPU:</strong> {result.preset.cpu}
      </p>
      <p style={{ margin: "4px 0" }}>
        <strong>Network:</strong> {result.preset.network}
      </p>
      <p style={{ margin: "4px 0" }}>
        <strong>GPU:</strong> {result.preset.gpu}
      </p>
      <p style={{ margin: "4px 0 12px" }}>
        <strong>Memory:</strong> {result.preset.memory}
      </p>

      {metrics ? (
        <>
          <p>
            <strong>LCP:</strong> {Math.round(Number(metrics.lcp))} ms
          </p>
          <p>
            <strong>FCP:</strong> {Math.round(Number(metrics.fcp))} ms
          </p>
          <p>
            <strong>TTFB:</strong> {Math.round(Number(metrics.ttfb))} ms
          </p>
          <p>
            <strong>INP:</strong> {Math.round(Number(metrics.inp))} ms
          </p>
        </>
      ) : (
        <p>메트릭 없음</p>
      )}

      {spikeFactors && spikeFactors.length > 0 && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: "#fff7ed",
            borderRadius: 8,
          }}
        >
          <strong>급증 요인</strong>
          <ul style={{ margin: "6px 0 0 18px" }}>
            {spikeFactors.map((cf, spikeIdx) => (
              <li key={spikeIdx}>
                {cf.factor}: {cf.from} → {cf.to}
              </li>
            ))}
          </ul>
        </div>
      )}

      {brokenMetrics.length > 0 && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: "#fef2f2",
            borderRadius: 8,
            border: "1px solid #fecaca",
          }}
        >
          <strong>병목 기준 초과</strong>
          <ul style={{ margin: "6px 0 0 18px" }}>
            {brokenMetrics.map((b, brokenIdx) => (
              <li key={brokenIdx} style={{ color: "#b91c1c" }}>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

