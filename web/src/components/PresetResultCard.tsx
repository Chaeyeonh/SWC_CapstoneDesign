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
  timeout?: boolean;
  error?: string | null;
}

export function PresetResultCard({
  index,
  result,
  metrics,
  bottleneck,
  brokenMetrics,
  spikeFactors,
  onHeadful,
  timeout,
  error
}: PresetResultCardProps) {
  // 디버깅용 로그
  if (timeout !== undefined || error) {
    console.log(`[PresetResultCard #${index + 1}] timeout:`, timeout, "error:", error);
  }
  
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
   
        background: bottleneck || result.timeout === true ? "#fee2e2" : "#ecfccb",
        border: bottleneck || result.timeout === true ? "1px solid #f87171" : "1px solid #84cc16",
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
          실행하기
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

      {/* Timeout UI */}
      {(timeout === true || result.timeout === true) && (
        <div style={{
          padding: "16px",
          background: "#fff7ed",
          border: "2px solid #fb923c",
          borderRadius: 8,
          marginTop: 12,
          marginBottom: 12
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8
          }}>
            <span style={{ fontSize: 20 }}>⏱️</span>
            <strong style={{ color: "#ea580c", fontSize: 16 }}>
              페이지 로드 타임아웃
            </strong>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: 14, 
            color: "#9a3412",
            lineHeight: 1.5
          }}>
            이 preset 환경에서는 제한 시간(150초) 내에 페이지가 완전히 로드되지 않았습니다.
            {error && (
              <span style={{ display: "block", marginTop: 4, fontSize: 12, opacity: 0.8 }}>
                ({(error || result.error)})
              </span>
            )}
          </p>
        </div>
      )}

      {/* 일반 에러 UI (timeout이 아닌 경우) */}
      {error && !timeout && (
        <div style={{
          padding: "12px 16px",
          background: "#fef2f2",
          color: "#b91c1c",
          borderRadius: 8,
          marginTop: 12,
          marginBottom: 12
        }}>
          <strong>⚠ 오류 발생</strong>
          <p style={{ marginTop: 4, marginBottom: 0, fontSize: 12 }}>{error}</p>
        </div>
      )}

      {/* 정상적인 메트릭 표시 */}
      {metrics && !timeout && (
        <>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
            <p style={{ margin: "4px 0" }}>
              <strong>LCP:</strong> {!isNaN(Number(metrics.lcp)) ? Math.round(Number(metrics.lcp)) : 0} ms
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>FCP:</strong> {!isNaN(Number(metrics.fcp)) ? Math.round(Number(metrics.fcp)) : 0} ms
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>TTFB:</strong> {!isNaN(Number(metrics.ttfb)) ? Math.round(Number(metrics.ttfb)) : 0} ms
            </p>
            <p style={{ margin: "4px 0 0" }}>
              <strong>CLS:</strong> {!isNaN(Number(metrics.cls)) ? Number(metrics.cls).toFixed(3) : "0.000"}
            </p>
          </div>
        </>
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

