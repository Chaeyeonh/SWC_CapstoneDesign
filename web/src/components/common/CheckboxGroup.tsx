import { Checkbox } from "./Checkbox";

interface CheckboxGroupProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function CheckboxGroup({ label, options, selected, onToggle }: CheckboxGroupProps) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* 라벨 */}
      <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>

      {/* 체크박스 목록 */}
      <div className="flex flex-col gap-1">
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
