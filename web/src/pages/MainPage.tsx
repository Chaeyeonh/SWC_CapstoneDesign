import { useState,useMemo } from "react";

export default function MainPage() {
  const [url, setUrl] = useState("");
  const [network, setNetwork] = useState("slow-3g");

  // 추가된 상태들
  const [cpu, setCpu] = useState("medium");
  const [gpu, setGpu] = useState("on");
  const [memory, setMemory] = useState("normal");

  const [screeningResults, setScreeningResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  interface ChangedFactor {
    factor: string;
    from: string;
    to: string;
    }
 


    // 병목 급증 감지 + 어떤 preset 변화에서 급증했는지 반환
    function detectSpikes(results: any[], metricKey: string = "lcp") {
        if (!results || results.length === 0) return [];

        // metric 기준으로 정렬
        const sorted = [...results].sort(
            (a, b) => a.out.metrics[metricKey] - b.out.metrics[metricKey]
        );

        const spikes: any[] = [];

        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const curr = sorted[i];

            const prevVal = prev.out.metrics[metricKey];
            const currVal = curr.out.metrics[metricKey];

            // 급증 조건
            if (currVal > prevVal * 2) {
            // 어떤 preset 요소가 변했는지 계산
                const changedFactors: ChangedFactor[] = [];
                const factors = ["cpu", "network", "gpu", "memory"] as const;

                factors.forEach(f => {
                    if (prev.preset[f] !== curr.preset[f]) {
                    changedFactors.push({
                        factor: f,
                        from: prev.preset[f],
                        to: curr.preset[f]
                    });
                }
            });

            spikes.push({
                from: prev,
                to: curr,
                metricKey,
                increase: { prev: prevVal, curr: currVal },
                changedFactors
            });
            }
        }

        return spikes;
    }


  // UI에서 매번 계산되지 않도록 useMemo 적용
  const spikes = useMemo(
    () => detectSpikes(screeningResults, "lcp"),
    [screeningResults]
  );

  function isSpikeResult(r: any) {
    return spikes.some((s) => s.to === r);
  }

  //병목 기준
   function isBottleneck(m: any) {
    if (!m) return false;

    if (m.lcp > 4000) return true; // LCP Poor
    if (m.fcp > 3000) return true; // FCP Poor
    if (m.inp > 500) return true;  // INP Poor
    if (m.ttfb > 1800) return true; // TTFB Poor

    return false;
  }

  // 👉 어떤 지표가 초과되었는지 리스트 반환
  function getBrokenMetrics(m: any) {
    if (!m) return [];

    const broken = [];

    if (m.lcp > 4000) broken.push("LCP > 4s (Poor)");
    if (m.fcp > 3000) broken.push("FCP > 3s (Poor)");
    if (m.inp > 500) broken.push("INP > 500ms (Poor)");
    if (m.ttfb > 1800) broken.push("TTFB > 1.8s (Poor)");

    return broken;
  }

  // 단일 테스트 실행
  const handleStartSingle = async () => {
    if (!url) return;

    const res = await fetch("http://localhost:4000/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        network,
        cpu,
        gpu,
        memory
      }),
    });

    const data = await res.json();
    console.log("single test result:", data);
  };

  // 자동 스크리닝 실행
  const handleRunScreening = async () => {
    if (!url) return;
    setLoading(true);

    const res = await fetch("http://localhost:4000/api/test/screening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setScreeningResults(data.results || []);
    setLoading(false);
    console.log("screening results:", data);
  };

 
  return (
    <div style={{ padding: 24 }}>
      <h1>UX Visualizer</h1>

      {/* URL 입력 */}
      <div style={{ marginBottom: 12 }}>
        <input
          style={{ width: 400 }}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* Network 선택 */}
      <div style={{ marginBottom: 12 }}>
        <label>
          Network:
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="slow-3g">Slow 3G</option>
            <option value="fast-3g">Fast 3G</option>
            <option value="4g">4G</option>
            <option value="wifi">WiFi</option>
          </select>
        </label>
      </div>

      {/* CPU 선택 */}
      <div style={{ marginBottom: 12 }}>
        <label>
          CPU:
          <select
            value={cpu}
            onChange={(e) => setCpu(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="low">Low (6x slower)</option>
            <option value="medium">Medium (3x slower)</option>
            <option value="high">High (1x)</option>
          </select>
        </label>
      </div>

      {/* GPU 선택 */}
      <div style={{ marginBottom: 12 }}>
        <label>
          GPU:
          <select
            value={gpu}
            onChange={(e) => setGpu(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="on">ON</option>
            <option value="off">OFF</option>
          </select>
        </label>
      </div>

      {/* Memory 선택 (옵션 기능) */}
      <div style={{ marginBottom: 12 }}>
        <label>
          Memory:
          <select
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="low">Low Memory</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      {/* 단일 테스트 */}
      <button onClick={handleStartSingle} style={{ marginRight: 10 }}>
        단일 테스트 실행
      </button>

      {/* 스크리닝 테스트 */}
      <button onClick={handleRunScreening}>자동 분석 시작하기</button>

      {loading && <p>스크리닝 실행 중...</p>}

      {/* 스크리닝 결과 */}
      {screeningResults.length > 0 && (
        <div style={{ marginTop: 20 }}>
            <h3>스크리닝 결과:</h3>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                    marginTop: "16px"
                }}
            >

                {screeningResults.map((r, i) => {
                    const m = r.out?.metrics;
                    const bottleneck = isBottleneck(m);
                    const broken = getBrokenMetrics(m);

                    return (
                        <div
                            key={i}
                            style={{
                                padding: 16,
                                marginBottom: 12,
                                borderRadius: 10,
                                background: bottleneck ? "#ffd8d8" : "#e8ffe8",
                                border: bottleneck ? "1px solid #ff6b6b" : "1px solid #8cd48c"
                            }}
                        >
                            <h4>Preset #{i + 1}</h4>

                            <p><strong>CPU:</strong> {r.preset.cpu}</p>
                            <p><strong>Network:</strong> {r.preset.network}</p>
                            <p><strong>GPU:</strong> {r.preset.gpu}</p>

                            <hr />

                            {m ? (
                                <>
                                <p><strong>LCP:</strong> {Math.round(m.lcp)} ms</p>
                                <p><strong>FCP:</strong> {Math.round(m.fcp)} ms</p>
                                <p><strong>INP:</strong> {Math.round(m.inp)} ms</p>
                                <p><strong>TTFB:</strong> {Math.round(m.ttfb)} ms</p>
                        
                               
                                </>
                            ) : (
                                <p>메트릭 없음</p>
                            )}

                            <hr />
                            <p>Filmstrip 폴더: {r.out.directory}</p>

                            {isSpikeResult(r) && (
                                <div style={{ marginTop: 10, padding: 8, background: "#fff3cd", borderRadius: 6 }}>
                                    <strong>급증 요인:</strong>
                                    <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                                    {spikes
                                        .find(s => s.to === r)
                                        ?.changedFactors.map((cf: any, idx: number) => (
                                        <li key={idx}>
                                            {cf.factor}: {cf.from} → {cf.to}
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                                )}


                                {broken.length > 0 && (
                                    <div
                                    style={{
                                        marginTop: 10,
                                        padding: 8,
                                        background: "#ffe9e9",
                                        borderRadius: 6,
                                        border: "1px solid #ff8a8a",
                                    }}
                                    >
                                    <strong>병목 기준 초과:</strong>
                                    <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                                        {broken.map((b: string, idx: number) => (
                                        <li key={idx} style={{ color: "#d80000" }}>
                                            {b}
                                        </li>
                                        ))}
                                    </ul>
                                    </div>
                                )}
                                        
                                {bottleneck && (
                                <p style={{ color: "#d80000", fontWeight: "bold" }}>
                                ⚠ 병목 발생 환경입니다!
                                </p>
                            )}
                        </div>
                    )})}
                </div>
            </div>
        )};
    </div>)
    }
