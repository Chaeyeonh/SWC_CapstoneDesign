import type { ScreeningResult } from "../../hooks/useRun";
import { PresetListItem, type BadgeTone } from "./PresetListItem";
import { formatSubtitle } from "../../utils/format";
import { isBottleneck, getBrokenMetrics } from "../../utils/perf";
import type { ChangedFactor } from "../../utils/spikes";

function compactTitle(p: ScreeningResult["preset"]) {
  return `Preset (${p.cpu}, ${p.network}, ${p.gpu}, ${p.memory})`;
}

function isNil(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

// 시간(ms/s) 계열은 0이면 측정 불가로 간주(너희 케이스)
function isInvalidTimeMetric(v: unknown) {
  return isNil(v) || Number.isNaN(Number(v)) || Number(v) <= 0;
}

// CLS는 0이 정상일 수 있으니 "null/undefined/NaN"만 무효로
function isInvalidCls(v: unknown) {
  return isNil(v) || Number.isNaN(Number(v));
}

function getInvalidMetricNames(metrics: any) {
  if (!metrics) return ["ALL"];

  const invalid: string[] = [];
  if (isInvalidTimeMetric(metrics.lcp)) invalid.push("LCP");
  if (isInvalidTimeMetric(metrics.fcp)) invalid.push("FCP");
  if (isInvalidTimeMetric(metrics.ttfb)) invalid.push("TTFB");
  if (isInvalidCls(metrics.cls)) invalid.push("CLS"); // CLS는 0 허용

  return invalid;
}

export function PresetList({
  results,
  loading,
  selectedIdx,
  onSelect,
  spikeMap,
  onRunHeadful,
}: {
  results: ScreeningResult[];
  loading: boolean;
  selectedIdx: number;
  onSelect: (idx: number) => void;
  spikeMap: Map<ScreeningResult, ChangedFactor[]>;
  onRunHeadful: (preset: ScreeningResult["preset"]) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-slate-900">조합 결과 목록</div>
            <div className="text-sm text-slate-500 mt-1">상세 분석을 보려면 원하는 조합을 클릭하세요.</div>
          </div>
          <span className="text-xs text-slate-500">
            {results.length ? `${results.length} results` : loading ? "Running..." : "No results"}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {!results.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            Popup에서 preset을 실행하면 결과가 여기에 나타납니다.
          </div>
        ) : (
          results.map((r, idx) => {
            const timeout = r.timeout === true;
            const broken = getBrokenMetrics(r.metrics ?? null);
            const bottleneck = isBottleneck(r.metrics ?? null);
            const spikes = spikeMap.get(r) ?? [];

            const invalidNames = getInvalidMetricNames(r.metrics);
            const hasInvalid = invalidNames.length > 0 && invalidNames[0] !== "ALL";

            const badges: { text: string; tone: BadgeTone }[] = [];

            if (timeout) {
              badges.push({ text: "Timeout", tone: "bad" });
            } else if (!r.metrics) {
              badges.push({ text: "No Metrics", tone: "neutral" });
            } else if (hasInvalid) {
              // 원하는 문구로 바꿔도 됨: "Invalid", "No Data", "Incomplete"
              badges.push({ text: `No Data: ${invalidNames.join(", ")}`, tone: "warn" });
            } else if (bottleneck) {
              badges.push({ text: "Bottleneck", tone: "bad" });
            } else {
              badges.push({ text: "Optimal", tone: "ok" });
            }

            if (spikes.length) badges.push({ text: "Spike", tone: "warn" });
            if (broken.length) badges.push({ text: `${broken.length} issues`, tone: "bad" });
              

            return (
              <PresetListItem
                key={`${r.preset.cpu}-${r.preset.network}-${r.preset.gpu}-${r.preset.memory}-${idx}`}
                index={idx}
                active={idx === selectedIdx}
                title={compactTitle(r.preset)}
                subtitle={formatSubtitle(r.metrics ?? null, timeout)}
                badges={badges}
                onClick={() => onSelect(idx)}
                action={{
                  label: "실행하기",
                  onAction: () => onRunHeadful(r.preset),
                }}
              />

            );
          })
        )}
      </div>
    </div>
  );
}
