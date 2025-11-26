

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void; 
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label style={{ marginRight: 12 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
