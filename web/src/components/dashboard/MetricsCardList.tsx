import type { Metrics } from "../../hooks/useRun";
import { formatSecondsFromMs, formatMs, formatCls } from "../../utils/format";
import { metricStatus, isValidMetrics } from "../../utils/perf";

const DESCRIPTIONS: Record<"LCP" | "FCP" | "CLS" | "TTFB", string> = {
  LCP: "가장 큰 콘텐츠가 로드되기까지 걸리는 시간",
  FCP: "첫 콘텐츠가 화면에 보이기까지 걸리는 시간",
  CLS: "예상치 못한 레이아웃 변동 점수",
  TTFB: "서버 응답이 시작되는 시간",
};

export function MetricsCardList({
  metrics,
  isTimeout,
  error,
}: {
  metrics: Metrics | null;
  isTimeout: boolean;
  error?: string | null;
}) {
  // Timeout상태 보여주기
  if (isTimeout) {
    return (
      <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="text-sm font-semibold text-rose-900">Timeout</div>
        <div className="mt-1 text-sm text-rose-800">
          제한 시간 내에 페이지가 완전히 로드되지 않아 지표를 계산할 수 없습니다.
        </div>
        {error ? <div className="mt-2 text-xs text-rose-800/80">({error})</div> : null}
      </div>
    );
  }

  // metrics가 0/NaN 같은 “무효”면 없는 것으로 처리
  const safe = isValidMetrics(metrics) ? metrics : null;

  if (!safe) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        측정값이 아직 없습니다.
      </div>
    );
  }

  const rows = [
    { k: "LCP", v: formatSecondsFromMs(safe.lcp), s: metricStatus("lcp", safe.lcp) },
    { k: "FCP", v: formatSecondsFromMs(safe.fcp), s: metricStatus("fcp", safe.fcp) },
    { k: "CLS", v: formatCls(safe.cls), s: metricStatus("cls", safe.cls) },
    { k: "TTFB", v: formatMs(safe.ttfb), s: metricStatus("ttfb", safe.ttfb) },
  ] as const;

  return (
    <div className="mt-3 space-y-2">
      {rows.map((m) => {
        const tone =
          m.s === "good"
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : m.s === "needs"
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-rose-50 border-rose-200 text-rose-900";

        return (
          <div key={m.k} className={`rounded-2xl border p-4 ${tone}`}>
            {/* 상단: 지표명 + 설명(오른쪽) */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold shrink-0">{m.k}</span>
                <span className="text-xs text-slate-600 truncate">
                  {DESCRIPTIONS[m.k]}
                </span>
              </div>

              <span className="text-lg font-semibold shrink-0">{m.v}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
