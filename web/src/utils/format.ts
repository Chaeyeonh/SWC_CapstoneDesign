import type { Metrics } from "../hooks/useRun";

export function formatSecondsFromMs(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`;
}
export function formatMs(ms: number) {
  return `${Math.round(ms)}ms`;
}
export function formatCls(v: number) {
  return v.toFixed(2);
}

export function formatSubtitle(m: Metrics | null, isTimeout: boolean) {
  if (isTimeout) return "페이지 로드 타임아웃";
  if (!m) return "측정값 없음";
  return `LCP ${formatSecondsFromMs(m.lcp)} · FCP ${formatSecondsFromMs(m.fcp)} · CLS ${formatCls(m.cls)} · TTFB ${formatMs(m.ttfb)}`;
}
