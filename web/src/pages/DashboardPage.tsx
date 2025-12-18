import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRun } from "../hooks/useRun";

import { TopBar } from "../components/dashboard/TopBar";
import { KpiRow } from "../components/dashboard/KpiRow";
import { PresetList } from "../components/dashboard/PresetList";
import { SummaryAccordion } from "../components/dashboard/SummaryAccordion";
import { AnalysisPanel } from "../components/dashboard/AnalysisPanel";
import { TimelineCard } from "../components/dashboard/TimelineCard";

import { detectSpikes } from "../utils/spikes";
import { isBottleneck, getBrokenMetrics } from "../utils/perf";
import type { Metrics, ScreeningResult } from "../hooks/useRun";
import type { ChangedFactor } from "../utils/spikes";

function selectBestPresetIndex(results: ScreeningResult[], metricKey: keyof Metrics = "lcp") {
  if (!results.length) return 0;

  let bestIdx = 0;
  let bestVal = Number.POSITIVE_INFINITY;

  for (let i = 0; i < results.length; i++) {
    const v = results[i]?.metrics?.[metricKey] ?? Number.POSITIVE_INFINITY;
    if (v < bestVal) {
      bestVal = v;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export default function DashboardPage() {
  const { url, cpus, networks, gpus, memories, results, loading, runHeadful } = useRun();
  const navigate = useNavigate();

  const totalPresets = useMemo(
    () => cpus.length * networks.length * gpus.length * memories.length,
    [cpus, networks, gpus, memories]
  );

  const [selectedIdx, setSelectedIdx] = useState(0);
  const didAutoSelectRef = useRef(false);

  useEffect(() => {
    if (!results.length) {
      setSelectedIdx(0);
      didAutoSelectRef.current = false;
      return;
    }

    setSelectedIdx((prev) => {
      if (prev >= 0 && prev < results.length && didAutoSelectRef.current) return prev;
      const best = selectBestPresetIndex(results, "lcp");
      didAutoSelectRef.current = true;
      return best;
    });
  }, [results]);

  const selected = results[selectedIdx] ?? null;
  const selectedMetrics = selected?.metrics ?? null;
  const isTimeout = selected?.timeout === true;

  const spikes = useMemo(() => detectSpikes(results, "lcp"), [results]);
  const spikeMap = useMemo(() => {
    const m = new Map<ScreeningResult, ChangedFactor[]>();
    spikes.forEach((s) => m.set(s.to, s.changedFactors));
    return m;
  }, [spikes]);

  const onRunHeadful = (preset: ScreeningResult["preset"]) => runHeadful(preset);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <TopBar onNewTest={() => navigate("/")} />

        {/*  KPI에 timeout 전달 <KpiRow metrics={selectedMetrics} isTimeout={isTimeout} />
*/}
        
        {results.length > 0 && (
          <div className="mt-6">
            <TimelineCard results={results} selectedIdx={selectedIdx} />
          </div>
        )}


        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-6 space-y-6">
            <PresetList
              results={results}
              loading={loading}
              selectedIdx={selectedIdx}
              onSelect={(idx: number) => {
                didAutoSelectRef.current = true;
                setSelectedIdx(idx);
              }}
              spikeMap={spikeMap}
              onRunHeadful={onRunHeadful}
            />

            <SummaryAccordion
              url={url}
              cpus={cpus}
              networks={networks}
              gpus={gpus}
              memories={memories}
              totalPresets={totalPresets}
            />
          </section>

          <section className="lg:col-span-6">
            <AnalysisPanel
              selected={selected}
              bottleneck={isBottleneck(selectedMetrics)}
              brokenMetrics={getBrokenMetrics(selectedMetrics)}
              spikeFactors={selected ? spikeMap.get(selected) : undefined}
              onRunHeadful={onRunHeadful}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
