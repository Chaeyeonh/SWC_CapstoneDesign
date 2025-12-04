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
  timeout?: boolean;   // 서버에서 넘겨오는 timeout 여부
  error?: string | null;  // 오류 메시지
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

  const runPresets = useCallback(
    async (override?: RunPayload) => {
      const payload = {
        url: (override?.url ?? url).trim(),
        cpu: override?.cpu ?? cpus,
        network: override?.network ?? networks,
        gpu: override?.gpu ?? gpus,
        memory: override?.memory ?? memories,
      };

      if (
        !payload.url ||
        payload.cpu.length === 0 ||
        payload.network.length === 0 ||
        payload.gpu.length === 0 ||
        payload.memory.length === 0
      ) {
        console.warn("모든 preset 선택 항목과 URL이 필요합니다.");
        return;
      }

      setUrl(payload.url);
      setCpus(payload.cpu);
      setNetworks(payload.network);
      setGpus(payload.gpu);
      setMemories(payload.memory);

      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("runPresets 실패", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cpus, gpus, memories, networks, url]
  );

  const runHeadful = useCallback(
    async (preset: Preset, targetUrl?: string) => {
      const finalUrl = (targetUrl ?? url).trim();
      if (!finalUrl) {
        console.warn("Headful 실행에는 URL이 필요합니다.");
        return;
      }

      await fetch("http://localhost:4000/api/run/headful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl, preset }),
      });
    },
    [url]
  );

  const clearResults = useCallback(() => setResults([]), []);

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
    runPresets,
    runHeadful,
    clearResults,
  };

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const ctx = useContext(RunContext);
  if (!ctx) {
    throw new Error("useRun은 RunProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}

