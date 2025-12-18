import { CheckboxGroup } from "./common/CheckboxGroup";
import Tooltip from "./common/Tooltip";


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

  const selectAll = (opts: string[], setter: (v: string[]) => void) => setter(opts);
  const clearAll = (setter: (v: string[]) => void) => setter([]);

  const cpuTooltipText = `
    <p>
    본인 컴퓨터 cpu사양의 얼만큼 사용할지 선택하세요.
    </p>
  `;

  const networkTooltipText = `
    네트워크 대역폭(속도)과 지연 시간(Latency)을 조절하여 전 세계의 다양한 통신 환경을 시뮬레이션합니다.<br /><br />
    
    ➡️ <strong>3G Slow</strong> (다운로드: 1.6 Mbps, 업로드: 750 Kbps, 지연: 300ms): <br />
    인터넷 인프라가 낙후된 국가나 신호가 약한 환경을 시뮬레이션합니다. <br /><br />

    ➡️ <strong>3G</strong> (다운로드: 3 Mbps, 업로드: 3 Mbps, 지연: 150ms): <br />
    일부 동남아, 남미 등 인터넷이 보급 중인 지역이나 농어촌 지역의 3G 환경입니다. <br /><br />

    ➡️ <strong>4G</strong> (다운로드: 9 Mbps, 업로드: 9 Mbps, 지연: 170ms): <br />
    글로벌 표준 LTE 환경을 시뮬레이션합니다. 일반적인 모바일 사용자 경험을 측정하는 가장 중요한 기준점입니다.<br /><br />

    ➡️ <strong>4G Fast</strong> (다운로드: 10 Mbps, 업로드: 10 Mbps, 지연: 40ms): <br />
    도시 지역의 쾌적한 고속 LTE 환경입니다.<br /><br />

    ➡️ <strong>LTE</strong> (다운로드: 12 Mbps, 업로드: 12 Mbps, 지연: 70ms): <br />
    최신 LTE 네트워크 환경으로, 한국 등 IT 강국의 평균적인 모바일 연결 환경과 유사합니다. <br /><br />
`;

  const gpuTooltipText = `
    ➡️ <strong>On</strong> (GPU 사용): <br />
    GPU 하드웨어 가속을 활성화합니다. 3D, WebGL, 복잡한 애니메이션 등 그래픽 집약적인 웹 콘텐츠에서 가장 빠르고 부드러운 성능을 제공하는 환경을 시뮬레이션합니다.<br /><br />
    
    ➡️ <strong>Off</strong> (GPU 사용 안 함): <br />
    GPU 가속을 비활성화하고 모든 그래픽 처리를 CPU에 의존합니다. 구형 기기나 가상 환경을 시뮬레이션할 때 사용하며, 그래픽 성능이 현저히 저하되고 버벅임이 발생할 수 있습니다.
`;

  const memoryTooltipText = `
    브라우저 자바스크립트 엔진(V8)에 할당되는 최대 메모리를 제한하여 기기 사양별 성능을 테스트합니다.<br />
    ※ 브라우저 전체 점유율은 설정값의 약 2~3배로 시뮬레이션됩니다.<br /><br />
    
    ➡️ <strong>Very Low (512MB)</strong>: <br />
    <strong>실제 RAM 2GB 미만</strong>의 초저사양 기기 환경입니다. 잦은 메모리 정리(GC)로 인해 실행 속도가 현저히 저하됩니다.<br /><br />

    ➡️ <strong>Low (1GB)</strong>: <br />
    <strong>실제 RAM 4GB 수준</strong>의 보급형 스마트폰 환경입니다. 글로벌 사용자의 표준적인 성능 제약을 확인하기 가장 좋습니다.<br /><br />

    ➡️ <strong>Medium (2GB)</strong>: <br />
    <strong>실제 RAM 8GB 수준</strong>의 일반적인 노트북 및 중급형 스마트폰 환경입니다. 안정적인 성능을 보여주는 기준점입니다.<br /><br />

    ➡️ <strong>High (3GB)</strong>: <br />
    <strong>실제 RAM 12GB급 최신 플래그십 기기</strong> 환경입니다. 브라우저가 자원을 최대한 활용하는 고성능 상태를 의미합니다.<br /><br />
`;
  return (
    <div className="flex flex-col gap-6">

      {/* URL 입력 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">URL을 입력하세요</label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* CPU */}
      
        <CheckboxGroup
          label={
          <div className="flex items-center gap-2">
            <span>CPU</span>
            {/* Tooltip 컴포넌트를 label 내부에 위치시키고 툴팁 텍스트 전달 */}
            <Tooltip text={cpuTooltipText}>
              {/* Tooltip 컴포넌트 내부에는 아이콘이 위치할 더미 요소(혹은 <span>)를 전달 */}
              <span></span> 
            </Tooltip>
          </div>
        }
          options={[
            { value: "veryverylow", label: "10%" },
            { value: "verylow", label: "25%" },
            { value: "low", label: "50%" },
            { value: "normal", label: "100%" },
          ]}
          selected={cpus}
          onToggle={(v) => toggle(cpus, v, setCpus)}
          onSelectAll={() => selectAll(["veryverylow","verylow","low","normal"], setCpus)}
          onClearAll={() => clearAll(setCpus)}
        />

      
      {/* Network */}
      
        <CheckboxGroup
        label={
          <div className="flex items-center gap-2">
            <span>Network</span>
            <Tooltip text={networkTooltipText}>
              <span></span> 
            </Tooltip>
          </div>
        }
        options={[
          { value: "slow-3g", label: "Slow 3G" },
          { value: "fast-3g", label: "Fast 3G" },
          { value: "4g", label: "4G" },
          { value: "fast-4g", label: "Fast 4G" },
          { value: "lte", label: "LTE" },
        ]}
        selected={networks}
        onToggle={(v) => toggle(networks, v, setNetworks)}
        onSelectAll={() =>
          selectAll(["slow-3g", "fast-3g", "4g", "fast-4g", "lte"], setNetworks)
        }
        onClearAll={() => clearAll(setNetworks)}
      />

      

      {/* GPU */}
    
        <CheckboxGroup
          label={
            <div className="flex items-center gap-2">
              <span>GPU</span>
              <Tooltip text={gpuTooltipText}>
                <span></span> 
              </Tooltip>
            </div>
          }
          options={[
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ]}
          selected={gpus}
          onToggle={(v) => toggle(gpus, v, setGpus)}
          onSelectAll={() => selectAll(["on", "off"], setGpus)}
          onClearAll={() => clearAll(setGpus)}
        />
   
      

      {/* Memory */}
     
        <CheckboxGroup
          label={
          <div className="flex items-center gap-2">
            <span>Memory</span>
            <Tooltip text={memoryTooltipText}>
              <span></span> 
            </Tooltip>
          </div>
        }
          options={[
            { value: "very-low", label: "Very Low" },
            { value: "low", label: "Low" },
            { value: "medium", label: "medium" },
     
            { value: "high", label: "high" },
          ]}
          selected={memories}
          onToggle={(v) => toggle(memories, v, setMemories)}
          onSelectAll={() => selectAll(["very-low", "low", "medium","high"], setMemories)}
          onClearAll={() => clearAll(setMemories)}
        />


      

    </div>
  );
}
