import type { ScreeningResult } from "../../hooks/useRun";

export function EnvConfigCard({ preset }: { preset: ScreeningResult["preset"] }) {
  const rows = [
    { k: "CPU", v: preset.cpu },
    { k: "Network", v: preset.network },
    { k: "GPU", v: preset.gpu },
    { k: "Memory", v: preset.memory },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-900">선택한 환경</div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3 py-2">
            <span className="text-slate-500">{r.k}</span>
            <span className="font-semibold text-slate-900">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
