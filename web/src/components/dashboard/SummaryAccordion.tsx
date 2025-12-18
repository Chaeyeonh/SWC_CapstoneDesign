export function SummaryAccordion({
  url,
  cpus,
  networks,
  gpus,
  memories,
  totalPresets,
}: {
  url: string;
  cpus: string[];
  networks: string[];
  gpus: string[];
  memories: string[];
  totalPresets: number;
}) {
  return (
    <div className="mt-4 rounded-3xl border border-slate-200 bg-white shadow-sm">
      <details className="p-5">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">선택한 조합 요약</summary>
        <div className="mt-4 text-sm text-slate-700 space-y-1">
          <div><span className="font-semibold">URL:</span> {url || "-"}</div>
          <div><span className="font-semibold">CPU:</span> {cpus.length ? cpus.join(", ") : "-"}</div>
          <div><span className="font-semibold">Network:</span> {networks.length ? networks.join(", ") : "-"}</div>
          <div><span className="font-semibold">GPU:</span> {gpus.length ? gpus.join(", ") : "-"}</div>
          <div><span className="font-semibold">Memory:</span> {memories.length ? memories.join(", ") : "-"}</div>
          <div className="pt-2 text-xs text-slate-500">
            전체 조합 수: <span className="font-semibold text-slate-700">{totalPresets}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
