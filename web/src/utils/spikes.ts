import type { Metrics, ScreeningResult, Preset } from "../hooks/useRun";

export interface ChangedFactor {
  factor: keyof Preset;
  from: string;
  to: string;
}

export function detectSpikes(results: ScreeningResult[], metricKey: keyof Metrics = "lcp") {
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
          changedFactors.push({ factor, from: prev.preset[factor], to: curr.preset[factor] });
        }
      });
      spikes.push({ to: curr, changedFactors });
    }
  }

  return spikes;
}
