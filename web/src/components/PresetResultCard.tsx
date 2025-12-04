import { useState } from "react";
import { Button } from "../components/common/Button";
import type { Metrics, Preset, ScreeningResult } from "../hooks/useRun";

export interface ChangedFactor {
  factor: keyof Preset;
  from: string;
  to: string;
}

interface PresetResultCardProps {
  index: number;
  result: ScreeningResult;
  metrics: Metrics | null;
  bottleneck: boolean;
  brokenMetrics: string[];
  spikeFactors?: ChangedFactor[];
  onHeadful: () => void;
  timeout?: boolean;
  error?: string | null;
}

export function PresetResultCard({
  index,
  result,
  metrics,
  bottleneck,
  brokenMetrics,
  spikeFactors,
  onHeadful,
  timeout,
  error,
}: PresetResultCardProps) {
  const [showAI, setShowAI] = useState(false);

  const isTimeout = timeout === true || result.timeout === true;
  

  return (
    <div
      className={`
        p-5 rounded-xl shadow-lg border
        ${bottleneck || isTimeout 
          ? "bg-red-100 border-red-400" 
          : "bg-lime-100 border-lime-500"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="m-0 font-semibold">Preset #{index + 1}</h4>

        <Button variant="outline" onClick={onHeadful}>
          실행하기
        </Button>
      </div>

      {/* Preset Info */}
      <div className="mt-3 space-y-1 text-sm">
        <p><strong>CPU:</strong> {result.preset.cpu}</p>
        <p><strong>Network:</strong> {result.preset.network}</p>
        <p><strong>GPU:</strong> {result.preset.gpu}</p>
        <p><strong>Memory:</strong> {result.preset.memory}</p>
      </div>

      {/* Timeout UI */}
      {isTimeout && (
        <div className="mt-4 mb-4 p-4 bg-orange-50 border-2 border-orange-400 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⏱️</span>
            <strong className="text-orange-700 text-base">페이지 로드 타임아웃</strong>
          </div>

          <p className="text-orange-700 text-sm leading-5">
            이 preset 환경에서는 제한 시간 내에 페이지가 완전히 로드되지 않았습니다.
            {error && (
              <span className="block mt-1 text-xs opacity-70">
                ({error})
              </span>
            )}
          </p>
        </div>
      )}

      {/* 일반 에러 UI */}
      {error && !isTimeout && (
        <div className="mt-4 mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
          <strong className="text-red-700 text-sm">⚠ 오류 발생</strong>
          <p className="text-red-700 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Metrics */}
      {metrics && !isTimeout && (
        <div className="mt-4 border-t border-slate-300 pt-3 text-sm space-y-1">
          <p><strong>LCP:</strong> {Math.round(Number(metrics.lcp))} ms</p>
          <p><strong>FCP:</strong> {Math.round(Number(metrics.fcp))} ms</p>
          <p><strong>TTFB:</strong> {Math.round(Number(metrics.ttfb))} ms</p>
          <p><strong>CLS:</strong> {Number(metrics.cls).toFixed(3)}</p>
        </div>
      )}

      {/* AI 분석 버튼 */}
      {result.ai && !isTimeout && (
        <Button
          variant="neutral"
          onClick={() => setShowAI(!showAI)}
          className="mt-4"
        >
          {showAI ? "AI 분석 접기" : "AI 분석 보기"}
        </Button>
      )}

      {/* AI 분석 결과 */}
      {showAI && result.ai && !isTimeout && (
        <div className="mt-4 p-4 bg-slate-50 border rounded-lg whitespace-pre-wrap leading-6 text-sm">
          <h4 className="mt-0 font-semibold">AI 분석 결과</h4>
          {result.ai}
        </div>
      )}

      {/* Spike Factor */}
      {spikeFactors && spikeFactors.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <strong className="text-sm">급증 요인</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
            {spikeFactors.map((cf, idx) => (
              <li key={idx}>
                {cf.factor}: {cf.from} → {cf.to}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Broken Metrics */}
      {brokenMetrics.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
          <strong className="text-sm">병목 기준 초과</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-red-700">
            {brokenMetrics.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
