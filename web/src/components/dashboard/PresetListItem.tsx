//import { Button } from "../common/Button";
export type BadgeTone = "ok" | "warn" | "bad" | "neutral";

export function PresetListItem({
  index,
  active,
  title,
  subtitle,
  badges,
  onClick,
  action,
}: {
  index?: number;
  active: boolean;
  title: string;
  subtitle: string;
  badges: { text: string; tone: BadgeTone }[];
  onClick: () => void;
  action?: { label: string; onAction: () => void };
}) {
  const ring = active ? "ring-2 ring-blue-500" : "hover:border-slate-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition ${ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
        
          <div className="truncate text-sm font-semibold text-slate-900">
            {index !== undefined ? `[Preset ${index + 1}] ` : ""}
            {title}
          </div>
          <div className="mt-1 truncate text-xs text-slate-500">{subtitle}</div>
        </div>

        <div className="shrink-0 flex flex-wrap gap-2 justify-end">
          {action && (
            <span
              onClick={(e) => e.stopPropagation()}      // 카드 클릭 전파 차단
              onMouseDown={(e) => e.stopPropagation()}  // 마우스다운도 같이 차단(더 안정적)
            >
              {/* <Button variant="outline" onClick={action.onAction}>
                실행하기
              </Button> */}
            </span>
          )}
          {badges.map((b, i) => {
            const cls =
              b.tone === "ok"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : b.tone === "warn"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : b.tone === "bad"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-slate-50 text-slate-700 border-slate-200";

            return (
              <span key={i} className={`text-[11px] px-2 py-1 rounded-full border ${cls}`}>
                {b.text}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
