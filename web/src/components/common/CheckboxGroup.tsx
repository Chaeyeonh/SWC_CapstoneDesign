import { Checkbox } from "./Checkbox";

interface CheckboxGroupProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}


export function CheckboxGroup({ label, options, selected, onToggle }:CheckboxGroupProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <strong>{label}</strong><br/>

      {options.map(opt => (
        <Checkbox
          key={opt.value}
          label={opt.label}
          checked={selected.includes(opt.value)}
          onChange={() => {
          
            onToggle(opt.value);
          }}
          
        />
      ))}
    </div>
  );
}
