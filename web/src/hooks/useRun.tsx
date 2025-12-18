import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface Preset {
  cpu: string;
  network: string;
  gpu: string;
  memory: string;
}

export interface Metrics {
  lcp: number;
  fcp: number;
  cls: number;
  ttfb: number;
}

export interface ScreeningResult {
  preset: Preset;
  metrics: Metrics | null;
  timeout?: boolean;
  error?: string | null;
  ai?: string | null;
}

export interface RunPayload {
  url?: string;
  cpu?: string[];
  network?: string[];
  gpu?: string[];
  memory?: string[];
}

interface RunContextValue {
  url: string;
  setUrl: (val: string) => void;

  cpus: string[];
  setCpus: (val: string[]) => void;

  networks: string[];
  setNetworks: (val: string[]) => void;

  gpus: string[];
  setGpus: (val: string[]) => void;

  memories: string[];
  setMemories: (val: string[]) => void;

  results: ScreeningResult[];

  loading: boolean;

  currentIndex: number;
  totalCount: number;

  runPresets: (payload?: RunPayload) => Promise<void>;
  runHeadful: (preset: Preset, targetUrl?: string) => Promise<void>;
  clearResults: () => void;
}

const RunContext = createContext<RunContextValue | undefined>(undefined);

export function RunProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState("");
  const [cpus, setCpus] = useState<string[]>([]);
  const [networks, setNetworks] = useState<string[]>([]);
  const [gpus, setGpus] = useState<string[]>([]);
  const [memories, setMemories] = useState<string[]>([]);
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(false);

  // 진행률 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * preset 하나를 서버에 보내서 실행시키는 함수
   */
  // const runSinglePreset = async (preset: Preset, url: string) => {
  //   const res = await fetch("http://localhost:4000/api/run", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ url, preset }),
  //   });

  //   const data = await res.json();
  //   if (!data.preset) {
  //   data.preset = { cpu: 'default', network: 'default', gpu: 'default', memory: 'default' };
  // }
  //   return data as ScreeningResult;
  // };

  /**
   * 프리셋 전체 실행
   */
  const runPresets = useCallback(
    async (override?: RunPayload) => {
      const payload = {
        url: (override?.url ?? url).trim(),
        cpu: override?.cpu ?? cpus,
        network: override?.network ?? networks,
        gpu: override?.gpu ?? gpus,
        memory: override?.memory ?? memories,
      };

      console.log("--- Starting runPresets ---");
      console.log("Selected CPUs:", payload.cpu); 
      console.log("Total combinations:", payload.cpu.length * payload.network.length * payload.gpu.length * payload.memory.length);

      if (
        !payload.url ||
        payload.cpu.length === 0 ||
        payload.network.length === 0 ||
        payload.gpu.length === 0 ||
        payload.memory.length === 0
      ) {
        console.warn("모든 선택 항목과 URL이 필요합니다.");
        return;
      }


      setUrl(payload.url);
      setCpus(payload.cpu);
      setNetworks(payload.network);
      setGpus(payload.gpu);
      setMemories(payload.memory);

      setLoading(true);
      setTotalCount(payload.cpu.length * payload.network.length * payload.gpu.length * payload.memory.length);
      try{
        const res = await fetch("http://localhost:4000/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), });
        
        const data = await res.json();
        setResults(data.results || []);}
        
      catch(err){
        console.error("runPresets 실패", err);
        throw err;}
      finally{
        setLoading(false);
        }
      },
      [cpus, gpus, memories, networks, url]);

      
  /**
   * headful 실행
   */
  const runHeadful = useCallback(
    async (preset: Preset, targetUrl?: string) => {
      const finalUrl = (targetUrl ?? url).trim();
      if (!finalUrl) return;

      await fetch("http://localhost:4000/api/run/headful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl, preset }),
      });
    },
    [url]
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const value: RunContextValue = {
    url,
    setUrl,
    cpus,
    setCpus,
    networks,
    setNetworks,
    gpus,
    setGpus,
    memories,
    setMemories,

    results,

    loading,

    currentIndex,
    totalCount,

    runPresets,
    runHeadful,
    clearResults,
  };

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const ctx = useContext(RunContext);
  if (!ctx) {
    throw new Error("useRun은 RunProvider 내부에서만 사용해야 합니다.");
  }
  return ctx;
}
