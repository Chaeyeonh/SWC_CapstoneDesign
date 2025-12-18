import type { Metrics, ScreeningResult } from "../../hooks/useRun";
import type { ChangedFactor } from "../../utils/spikes";

export function BottleneckCard({
  result,
  bottleneck,
  brokenMetrics,
  spikeFactors,
}: {
  result: ScreeningResult;
  bottleneck: boolean;
  brokenMetrics: string[];
  spikeFactors?: ChangedFactor[];
}) {
  const isTimeout = result.timeout === true;
  const metrics: Metrics | null = result.metrics ?? null;

  const title = (() => {
    if (isTimeout) return "Timeout Detected";
    if (!metrics) return "No Metrics";
    if (!bottleneck) return "No Major Bottleneck";
    if (metrics.lcp > 4000 && result.preset.cpu.toLowerCase().includes("low")) return "CPU Bottleneck Detected";
    if (metrics.ttfb > 1800 && result.preset.network.toLowerCase().includes("slow")) return "Network Bottleneck Detected";
    return "Bottleneck Detected";
  })();

  const desc = (() => {
    if (isTimeout) return "이 프리셋 환경에서는 제한 시간 내에 페이지가 완전히 로드되지 않았습니다.";
    if (!metrics) return "측정값이 아직 준비되지 않았습니다.";
    if (!bottleneck) return "치명적인 병목은 보이지 않습니다. 다만 CLS나 순간 스파이크는 추가 확인이 필요할 수 있습니다.";
    return "초기 렌더링 구간에서 지표가 기준을 초과했습니다. JS 실행/메인스레드 블로킹, 이미지/폰트 로딩, 네트워크 지연을 우선 의심해볼 수 있습니다.";
  })();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">병목 분석</div>

      <div className={`mt-3 rounded-2xl border p-4 ${bottleneck || isTimeout ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
        <div className={`text-sm font-semibold ${bottleneck || isTimeout ? "text-rose-900" : "text-emerald-900"}`}>
          {title}
        </div>
        <div className={`mt-1 text-sm ${bottleneck || isTimeout ? "text-rose-800" : "text-emerald-800"}`}>
          {desc}
        </div>

        {!!spikeFactors?.length && (
          <div className="mt-3 text-sm">
            <div className="font-semibold text-slate-900">Spike Factors</div>
            <ul className="mt-1 list-disc pl-5 text-slate-700 space-y-1">
              {spikeFactors.map((cf, idx) => (
                <li key={idx}>
                  {String(cf.factor)}: {cf.from} → {cf.to}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!!brokenMetrics.length && (
          <div className="mt-3 text-sm">
            <div className="font-semibold text-slate-900">Threshold Exceeded</div>
            <ul className="mt-1 list-disc pl-5 text-rose-800 space-y-1">
              {brokenMetrics.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
