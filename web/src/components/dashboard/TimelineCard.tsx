import { useMemo, useRef, useState, type MouseEvent } from "react";
import type { ScreeningResult } from "../../hooks/useRun";

type VisibleKeys = { lcp: boolean; fcp: boolean; ttfb: boolean; cls: boolean };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// ms -> s 표시
const fmtMsOrS = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;

// 값 유효성(0이면 invalid 처리: timeout/실패에서 0이 자주 나옴)
const validMs = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0;
const validCls = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0;

export function TimelineCard({
  results,
  selectedIdx,
}: {
  results: ScreeningResult[];
  selectedIdx?: number;
}) {
  const [visible, setVisible] = useState<VisibleKeys>({
    lcp: true,
    fcp: true,
    ttfb: true,
    cls: true,
  });

  // ✅ SVG 좌표계(뷰박스) 기준 크기 (화면에서는 w-full로 반응형)
  const W = 900;
  const H = 280;

  // ✅ 축/라벨 패딩
  const padL = 64;
  const padR = 24;
  const padT = 18;
  const padB = 52;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const n = results.length;
  if (n < 2) return null;

  // ✅ preset을 “균등 밴드”로 배치 (n=2여도 양 끝 축에 딱 붙지 않음)
  const bandW = innerW / n;
  const xCenterOf = (k: number) => padL + bandW * k + bandW / 2;

  // ✅ 모든 지표를 동일 스케일로 계산 (CLS는 ms로 변환: *1000)
  const scales = useMemo(() => {
    const allVals: number[] = [];

    for (const r of results) {
      const m = r.metrics;
      if (!m || r.timeout) continue;

      if (validMs(m.lcp)) allVals.push(m.lcp);
      if (validMs(m.fcp)) allVals.push(m.fcp);
      if (validMs(m.ttfb)) allVals.push(m.ttfb);
      if (validCls(m.cls)) allVals.push(m.cls * 1000);
    }

    const minRaw = allVals.length ? Math.min(...allVals) : 0;
    const maxRaw = allVals.length ? Math.max(...allVals) : 1;

    const pad = (maxRaw - minRaw) * 0.08 || 120;

    return {
      min: Math.max(0, minRaw - pad),
      max: maxRaw + pad,
    };
  }, [results]);

  const yOf = (v: number) => {
    const t = (v - scales.min) / Math.max(1e-9, scales.max - scales.min);
    return H - padB - innerH * clamp(t, 0, 1);
  };

  // ✅ 막대그리기용: 한 preset 안에서 지표별 막대가 “같은 폭/같은 간격”으로 들어가게
  const metricOrder = ["ttfb", "fcp", "lcp", "cls"] as const;
  const visibleMetrics = metricOrder.filter((k) => visible[k]);

  const BAR_GAP = 4; // 막대 간 간격
  const GROUP_PAD = 8; // preset 밴드 안쪽 여백(축/경계 겹침 방지)

  // “원하는 기본 막대폭” (항상 동일)
  const DESIRED_BAR_W = 12;

  // bandW 안에 다 들어오도록 “전체적으로만” 같이 줄어드는 폭(모든 preset/지표 동일)
  const barW = useMemo(() => {
    const count = Math.max(1, visibleMetrics.length);
    const maxAllowed =
      (bandW - GROUP_PAD * 2 - BAR_GAP * (count - 1)) / count;

    return Math.max(6, Math.min(DESIRED_BAR_W, maxAllowed));
  }, [bandW, visibleMetrics.length]);

  const groupW = useMemo(() => {
    const count = Math.max(1, visibleMetrics.length);
    return count * barW + (count - 1) * BAR_GAP;
  }, [visibleMetrics.length, barW]);

  const thresholds = { lcp: 4000, fcp: 3000, ttfb: 1800, cls: 0.25 };

  const colors: Record<(typeof metricOrder)[number], string> = {
    lcp: "#f43f5e",
    fcp: "#f59e0b",
    ttfb: "#0ea5e9",
    cls: "#10b981",
  };

  // ✅ 막대 값 준비 (CLS는 *1000)
  const bars = useMemo(() => {
    return results.map((r, k) => {
      const m = r.metrics;
      const xc = xCenterOf(k);

      if (!m || r.timeout) {
        return { k, xc, timeout: true as const, lcp: null, fcp: null, ttfb: null, cls: null };
      }

      const lcp = validMs(m.lcp) ? m.lcp : null;
      const fcp = validMs(m.fcp) ? m.fcp : null;
      const ttfb = validMs(m.ttfb) ? m.ttfb : null;
      const cls = validCls(m.cls) ? m.cls : null;

      return {
        k,
        xc,
        timeout: false as const,
        lcp: lcp == null ? null : { raw: lcp, scaled: lcp, y: yOf(lcp) },
        fcp: fcp == null ? null : { raw: fcp, scaled: fcp, y: yOf(fcp) },
        ttfb: ttfb == null ? null : { raw: ttfb, scaled: ttfb, y: yOf(ttfb) },
        cls: cls == null ? null : { raw: cls, scaled: cls * 1000, y: yOf(cls * 1000) },
      };
    });
  }, [results, scales]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverK, setHoverK] = useState<number | null>(null);
  const [hoverXPx, setHoverXPx] = useState<number | null>(null);

  // ✅ hover 인덱스도 밴드 기준으로 (n=2일 때 특히 안정적)
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;

    // px -> svg좌표
    const xSvg = (xPx / rect.width) * W;
    const t = (xSvg - padL) / innerW;
    const k = Math.floor(clamp(t, 0, 0.999999) * n);

    setHoverK(k);
    setHoverXPx(xPx);
  };

  const yAxisTicks = useMemo(() => {
    const ticks: { y: number; label: string }[] = [];
    const numTicks = 5;

    for (let i = 0; i <= numTicks; i++) {
      const y = H - padB - (innerH * i) / numTicks;
      const display = scales.min + ((scales.max - scales.min) * i) / numTicks;
      ticks.push({ y, label: fmtMsOrS(display) });
    }
    return ticks;
  }, [scales, innerH]);

  const selectedK = selectedIdx != null ? selectedIdx : null;

  // ✅ 툴팁 위치(축/밖으로 튀는 것 방지)
  const tooltipStyle = useMemo(() => {
    if (!wrapRef.current || hoverXPx == null) return { left: 0, top: 0, display: "none" as const };
    const rect = wrapRef.current.getBoundingClientRect();
    const TOOLTIP_W = 240;

    const left = clamp(hoverXPx + 12, 8, rect.width - TOOLTIP_W - 8);
    const top = 10; // 상단 여백
    return { left, top, display: "block" as const };
  }, [hoverXPx]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* 헤더/토글 배치 정리 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">성능지표 결과 비교</div>
          <div className="mt-1 text-xs text-slate-500">
            X축: preset · Y축: 모든 지표 (CLS는 ×1000 스케일)
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {(
            [
              { k: "lcp", label: "LCP", cls: "border-rose-200 bg-rose-50 text-rose-700" },
              { k: "fcp", label: "FCP", cls: "border-amber-200 bg-amber-50 text-amber-700" },
              { k: "ttfb", label: "TTFB", cls: "border-sky-200 bg-sky-50 text-sky-700" },
              { k: "cls", label: "CLS", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            ] as const
          ).map((it) => (
            <button
              key={it.k}
              type="button"
              onClick={() => setVisible((v) => ({ ...v, [it.k]: !v[it.k] }))}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                visible[it.k] ? it.cls : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={wrapRef}
        className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 relative"
        onMouseMove={onMove}
        onMouseLeave={() => {
          setHoverK(null);
          setHoverXPx(null);
        }}
      >
        {/* ✅ 반응형: width 고정 박스 제거 */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[280px]">
          {/* grid + y labels */}
          {yAxisTicks.map(({ y, label }, i) => (
            <g key={i}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="rgba(148,163,184,0.25)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <text
                x={padL - 10}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill="rgba(100,116,139,0.85)"
              >
                {label}
              </text>
            </g>
          ))}

          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="rgba(100,116,139,0.55)" strokeWidth={1.5} />
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(100,116,139,0.55)" strokeWidth={1.5} />

          {/* threshold lines */}
          {visible.lcp && (
            <line x1={padL} y1={yOf(thresholds.lcp)} x2={W - padR} y2={yOf(thresholds.lcp)} stroke={colors.lcp} strokeWidth={1.2} strokeDasharray="6 5" opacity={0.35} />
          )}
          {visible.fcp && (
            <line x1={padL} y1={yOf(thresholds.fcp)} x2={W - padR} y2={yOf(thresholds.fcp)} stroke={colors.fcp} strokeWidth={1.2} strokeDasharray="6 5" opacity={0.35} />
          )}
          {visible.ttfb && (
            <line x1={padL} y1={yOf(thresholds.ttfb)} x2={W - padR} y2={yOf(thresholds.ttfb)} stroke={colors.ttfb} strokeWidth={1.2} strokeDasharray="6 5" opacity={0.35} />
          )}
          {visible.cls && (
            <line
              x1={padL}
              y1={yOf(thresholds.cls * 1000)}
              x2={W - padR}
              y2={yOf(thresholds.cls * 1000)}
              stroke={colors.cls}
              strokeWidth={1.2}
              strokeDasharray="6 5"
              opacity={0.35}
            />
          )}

          {/* bars */}
          {bars.map((b) => {
            const baseY = H - padB;
            const startX = b.xc - groupW / 2; // ✅ preset 밴드 중앙에 그룹 정렬

            return (
              <g key={`bar-${b.k}`}>
                {visibleMetrics.map((key, idx) => {
                  const item = b[key];
                  if (!item) return null;

                  // ✅ 항상 동일한 폭/간격
                  const x = startX + idx * (barW + BAR_GAP);
                  const y = item.y;
                  const h = Math.max(0, baseY - y);

                  // ✅ 축 근처 겹침 방지(왼쪽/오른쪽 경계 안으로)
                  const safeX = clamp(x, padL + 1, W - padR - barW - 1);

                  return (
                    <rect
                      key={`${b.k}-${key}`}
                      x={safeX}
                      y={y}
                      width={barW}
                      height={h}
                      rx={4}
                      fill={colors[key]}
                      opacity={0.82}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* X labels */}
          {results.map((_, k) => {
            const step = n > 14 ? 3 : n > 8 ? 2 : 1;
            if (k % step !== 0 && k !== n - 1) return null;
            return (
              <text
                key={`xl-${k}`}
                x={xCenterOf(k)}
                y={H - padB + 26}
                textAnchor="middle"
                fontSize={11}
                fill="rgba(100,116,139,0.9)"
              >
                {`Preset ${k + 1}`}
              </text>
            );
          })}

          {/* Timeout markers */}
          {results.map((r, k) => {
            if (r.timeout !== true) return null;
            const x = xCenterOf(k);
            const y = padT + 12;
            return (
              <g key={`to-${k}`}>
                <circle cx={x} cy={y} r={8} fill="rgba(244,63,94,0.95)" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">
                  T
                </text>
              </g>
            );
          })}

          {/* selected line */}
          {/* {selectedK != null && (
            <line
              x1={xCenterOf(selectedK)}
              y1={padT}
              x2={xCenterOf(selectedK)}
              y2={H - padB}
              stroke="rgba(59,130,246,0.45)"
              strokeWidth={2}
            />
          )} */}

          {/* hover line */}
          {hoverK != null && (
            <line
              x1={xCenterOf(hoverK)}
              y1={padT}
              x2={xCenterOf(hoverK)}
              y2={H - padB}
              stroke="rgba(15,23,42,0.18)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}
        </svg>

        {/* tooltip */}
        {hoverK != null && results[hoverK] && (
          <div
            className="absolute pointer-events-none bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs"
            style={tooltipStyle}
          >
            <div className="font-semibold text-slate-900">Preset #{hoverK + 1}</div>
            <div className="mt-1 text-[10px] text-slate-500">
              cpu={results[hoverK].preset.cpu}, net={results[hoverK].preset.network}, gpu={results[hoverK].preset.gpu}, mem={results[hoverK].preset.memory}
            </div>

            {results[hoverK].timeout === true ? (
              <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-rose-800">
                <div className="font-semibold">Timeout</div>
                {results[hoverK].error ? <div className="mt-1 text-[10px] opacity-80">({results[hoverK].error})</div> : null}
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between gap-6">
                  <span className="font-medium text-rose-600">LCP</span>
                  <span className="text-slate-900">
                    {validMs(results[hoverK].metrics?.lcp) ? `${Math.round(results[hoverK].metrics!.lcp)}ms` : "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="font-medium text-amber-600">FCP</span>
                  <span className="text-slate-900">
                    {validMs(results[hoverK].metrics?.fcp) ? `${Math.round(results[hoverK].metrics!.fcp)}ms` : "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="font-medium text-sky-600">TTFB</span>
                  <span className="text-slate-900">
                    {validMs(results[hoverK].metrics?.ttfb) ? `${Math.round(results[hoverK].metrics!.ttfb)}ms` : "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="font-medium text-emerald-600">CLS</span>
                  <span className="text-slate-900">
                    {validCls(results[hoverK].metrics?.cls) ? results[hoverK].metrics!.cls.toFixed(3) : "-"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
