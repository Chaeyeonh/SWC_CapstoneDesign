import { CheckboxGroup } from "./common/CheckboxGroup";

interface EnvironmentSelectorProps {
  url: string;
  setUrl: (v: string) => void;

  cpus: string[];
  setCpus: (v: string[]) => void;

  networks: string[];
  setNetworks: (v: string[]) => void;

  gpus: string[];
  setGpus: (v: string[]) => void;

  memories: string[];
  setMemories: (v: string[]) => void;

  toggle: (list: string[], value: string, setter: (v: string[]) => void) => void;
}

export function EnvironmentSelector({
  url, setUrl,
  cpus, setCpus,
  networks, setNetworks,
  gpus, setGpus,
  memories, setMemories,
  toggle
}: EnvironmentSelectorProps) {

  return (
    <div className="flex flex-col gap-6">

      {/* URL 입력 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">테스트 URL</label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* CPU 체크박스 */}
      <CheckboxGroup
        label="CPU"
        options={[
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" }
        ]}
        selected={cpus}
        onToggle={(v) => toggle(cpus, v, setCpus)}
      />

      {/* Network 체크박스 */}
      <CheckboxGroup
        label="Network"
        options={[
          { value: "slow-3g", label: "Slow 3G" },
          { value: "fast-3g", label: "Fast 3G" },
          { value: "4g", label: "4G" },
          { value: "wifi", label: "WiFi" }
        ]}
        selected={networks}
        onToggle={(v) => toggle(networks, v, setNetworks)}
      />

      {/* GPU 체크박스 */}
      <CheckboxGroup
        label="GPU"
        options={[
          { value: "on", label: "On" },
          { value: "off", label: "Off" }
        ]}
        selected={gpus}
        onToggle={(v) => toggle(gpus, v, setGpus)}
      />

      {/* Memory 체크박스 */}
      <CheckboxGroup
        label="Memory"
        options={[
          { value: "very-low", label: "Very Low" },
          { value: "low", label: "Low" },
          { value: "normal", label: "Normal" }
        ]}
        selected={memories}
        onToggle={(v) => toggle(memories, v, setMemories)}
      />

    </div>
  );
}
