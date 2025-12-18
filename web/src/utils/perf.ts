import type { Metrics } from "../hooks/useRun";

export type MetricKey = keyof Metrics;
export type MetricStatus = "good" | "needs" | "poor";

export function metricStatus(key: MetricKey, v: number): MetricStatus {
  if (key === "lcp") return v <= 2500 ? "good" : v <= 4000 ? "needs" : "poor";
  if (key === "fcp") return v <= 1800 ? "good" : v <= 3000 ? "needs" : "poor";
  if (key === "cls") return v <= 0.1 ? "good" : v <= 0.25 ? "needs" : "poor";
  if (key === "ttfb") return v <= 800 ? "good" : v <= 1800 ? "needs" : "poor";
  return "needs";
}

export function isBottleneck(m: Metrics | null) {
  if (!m) return false;
  if (m.lcp > 4000) return true;
  if (m.fcp > 3000) return true;
  if (m.cls > 0.25) return true;
  if (m.ttfb > 1800) return true;
  return false;
}

export function getBrokenMetrics(m: Metrics | null) {
  if (!m) return [];
  const broken: string[] = [];
  if (m.lcp > 4000) broken.push("LCP > 4s (Poor)");
  if (m.fcp > 3000) broken.push("FCP > 3s (Poor)");
  if (m.cls > 0.25) broken.push("CLS > 0.25 (Poor)");
  if (m.ttfb > 1800) broken.push("TTFB > 1.8s (Poor)");
  return broken;
}

export function isValidMetrics(m: Metrics | null) {
  if (!m) return false;

  const okNum = (v: unknown) => typeof v === "number" && Number.isFinite(v);

  // LCP/FCP/TTFB는 0이면 실패로 간주 (실측에서 0은 사실상 불가능)
  if (!okNum(m.lcp) || m.lcp <= 0) return false;
  if (!okNum(m.fcp) || m.fcp <= 0) return false;
  if (!okNum(m.ttfb) || m.ttfb <= 0) return false;

  // CLS는 0이 가능하니까 0 허용 (NaN/Infinity만 배제)
  if (!okNum(m.cls) || m.cls < 0) return false;

  return true;
}
