interface ProgressBarProps {
  current: number; // 현재 실행 번호
  total: number;   // 전체 개수
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="flex flex-col gap-1 mt-4">
      {/* 텍스트 */}
      <div className="flex justify-between text-xs text-gray-600">
      
        <span>{current} / {total} ({percentage}%)</span>
      </div>

      {/* 진행 바 */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
