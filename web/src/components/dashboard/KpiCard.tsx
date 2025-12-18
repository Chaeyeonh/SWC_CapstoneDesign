import type { MetricStatus } from "../../utils/perf";

const DESCRIPTIONS: Record<string, string> = {
  LCP: "가장 큰 콘텐츠가 로드되기까지 걸리는 시간",
  FCP: "첫 콘텐츠가 화면에 보이기까지 걸리는 시간",
  CLS: "예상치 못한 레이아웃 변동 점수",
  TTFB: "서버 응답이 시작되는 시간",
};

export function KpiCard({
  label,
  value,
  status,
  isTimeout,
}: {
  label: string;
  value: string;
  status: MetricStatus;
  isTimeout?: boolean;
}) {

  const description = DESCRIPTIONS[label] || "";

  if (isTimeout) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm text-rose-900">
        <div className="flex justify-between items-start">
          <div className="text-xs font-medium opacity-80">{label}</div>
        </div>
        <div className="mt-1 text-2xl font-semibold">—</div>
        <div className="mt-1 text-[10px] leading-tight opacity-60 mb-2">{description}</div>
        <div className="text-xs font-medium opacity-80 pt-1 border-t border-rose-100">Timeout</div>
      </div>
    );
  }

  const tone =
    status === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : status === "needs"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  const badge = status === "good" ? "Good" : status === "needs" ? "Needs Work" : "Poor";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-all ${tone}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>

      <div className="mt-1 text-[10px] leading-tight opacity-60 mb-2">{description}</div>
      <div className="text-xs font-medium opacity-80 pt-1 border-t border-current border-opacity-10">
        {badge}
      </div>
    </div>
  );
}
