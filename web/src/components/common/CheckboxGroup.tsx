import { Checkbox } from "./Checkbox";
import { Button } from "./Button";

interface CheckboxGroupProps {
  label:React.ReactNode;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
  onSelectAll,
  onClearAll
}: CheckboxGroupProps) {

  return (
    <div className="flex flex-col gap-2 mb-5">

      {/* 라벨 + 전체 선택 버튼 */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{label}</p>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onSelectAll}>
            전체 선택
          </Button>
          <Button size="sm" variant="neutral" onClick={onClearAll}>
            전체 해제
          </Button>
        </div>
      </div>

      {/* 체크박스 – 가로 배열 */}
      <div className="flex gap-3 flex-wrap mt-1">
        {options.map((opt) => (
          <Checkbox
            key={opt.value}
            label={opt.label}
            checked={selected.includes(opt.value)}
            onChange={() => onToggle(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
