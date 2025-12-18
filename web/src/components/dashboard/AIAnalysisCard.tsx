import { useState } from "react";
import { Button } from "../../components/common/Button";

export function AiAnalysisCard({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">AI 결과분석</div>
        <Button variant="neutral" onClick={() => setOpen((v) => !v)}>
          {open ? "접기" : "보기"}
        </Button>
      </div>

      {open && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm whitespace-pre-wrap leading-6 text-slate-800">
          {text}
        </div>
      )}
    </div>
  );
}
