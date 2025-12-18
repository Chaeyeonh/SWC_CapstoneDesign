import type { Metrics } from "../../hooks/useRun";
import { metricStatus, isValidMetrics } from "../../utils/perf";
import { formatSecondsFromMs, formatMs, formatCls } from "../../utils/format";
import { KpiCard } from "./KpiCard";

export function KpiRow({ metrics, isTimeout }: { metrics: Metrics | null; isTimeout: boolean }) {
  if (isTimeout) {
    return (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="LCP" value="-" status="poor" isTimeout />
        <KpiCard label="FCP" value="-" status="poor" isTimeout />
        <KpiCard label="CLS" value="-" status="poor" isTimeout />
        <KpiCard label="TTFB" value="-" status="poor" isTimeout />
      </div>
    );
  }

  const safe = isValidMetrics(metrics) ? metrics : null;

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="LCP" value={safe ? formatSecondsFromMs(safe.lcp) : "-"} status={safe ? metricStatus("lcp", safe.lcp) : "needs"} />
      <KpiCard label="FCP" value={safe ? formatSecondsFromMs(safe.fcp) : "-"} status={safe ? metricStatus("fcp", safe.fcp) : "needs"} />
      <KpiCard label="CLS" value={safe ? formatCls(safe.cls) : "-"} status={safe ? metricStatus("cls", safe.cls) : "needs"} />
      <KpiCard label="TTFB" value={safe ? formatMs(safe.ttfb) : "-"} status={safe ? metricStatus("ttfb", safe.ttfb) : "needs"} />
    </div>
  );
}
