interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-blue-600 cursor-pointer"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

