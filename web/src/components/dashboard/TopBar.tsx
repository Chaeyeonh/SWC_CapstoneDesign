import { Button } from "../common/Button";

export function TopBar({ onNewTest }: { onNewTest: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center">
          <span className="text-blue-700 font-semibold">UX</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 leading-6">UX Visualizer</h1>
          <p className="text-sm text-slate-500">Performance Screening Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Connected
        </span>
        <Button onClick={onNewTest}>New Test</Button>
      </div>
    </header>
  );
}
