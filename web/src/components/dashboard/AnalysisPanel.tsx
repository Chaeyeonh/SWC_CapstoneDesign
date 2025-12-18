import type { ScreeningResult } from "../../hooks/useRun";
import { Button } from "../../components/common/Button";
import { EnvConfigCard } from "./EnvConfigCard";
import { MetricsCardList } from "./MetricsCardList";
import { BottleneckCard } from "./BottleneckCard";
import { AiAnalysisCard } from "./AIAnalysisCard";
import type { ChangedFactor } from "../../utils/spikes";

function compactTitle(p: ScreeningResult["preset"]) {
  return `Preset (${p.cpu}, ${p.network}, ${p.gpu }, ${p.memory})`;
}

export function AnalysisPanel({
  selected,
  bottleneck,
  brokenMetrics,
  spikeFactors,
  onRunHeadful,
}: {
  selected: ScreeningResult | null;
  bottleneck: boolean;
  brokenMetrics: string[];
  spikeFactors?: ChangedFactor[];
  onRunHeadful: (preset: ScreeningResult["preset"]) => void; 
}) {
  if (!selected) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5">
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
            좌측 Preset을 클릭하면 상세 분석이 여기에 표시됩니다.
          </div>
        </div>
      </div>
    );
  }

  const isTimeout = selected.timeout === true;
  const metrics = selected.metrics ?? null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">세부 분석</div>
          <div className="text-sm text-slate-500 mt-1">{compactTitle(selected.preset)}</div>
        </div>

        <Button variant="outline" onClick={() => onRunHeadful(selected.preset)}>
          실행하기
        </Button>
      </div>

      <div className="p-5 space-y-6">
       
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">성능 지표 결과값</div>
          </div>

          {isTimeout && (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              페이지 로드 타임아웃이 발생했습니다.
              {selected.error ? <div className="mt-1 text-xs opacity-80">({selected.error})</div> : null}
            </div>
          )}

          <MetricsCardList metrics={metrics} isTimeout={isTimeout} error={selected.error} />
        </div>

        <BottleneckCard
          result={selected}
          bottleneck={bottleneck}
          brokenMetrics={brokenMetrics}
          spikeFactors={spikeFactors}
        />

        {selected.ai && !isTimeout && <AiAnalysisCard text={selected.ai} />}
      </div>
    </div>
  );
}
