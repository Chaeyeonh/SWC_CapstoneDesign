import { useState } from "react";

export default function MainPage() {
  const [url, setUrl] = useState("");
  const [network, setNetwork] = useState("slow-3g");
  const [screeningResults, setScreeningResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // 기존 기본 테스트
  const handleStartSingle = async () => {
    if (!url) return;

    const res = await fetch("http://localhost:4000/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, network }),
    });

    const data = await res.json();
    console.log("single test result:", data);
  };

  // 자동 스크리닝
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

      {/* 네트워크 선택 */}
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
          </select>
        </label>
      </div>

      {/* 단일 테스트 실행 */}
      <button onClick={handleStartSingle} style={{ marginRight: 10 }}>
        단일 테스트 실행
      </button>

      {/* 스크리닝 실행 */}
      <button onClick={handleRunScreening}>자동 분석 시작하기</button>

      {loading && <p>스크리닝 실행 중...</p>}

      {/* 스크리닝 결과 렌더링 */}
      {screeningResults.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>스크리닝 결과:</h3>
          {screeningResults.map((r, i) => (
            <div key={i}>
              <p>CPU: {r.preset.cpu}</p>
              <p>Network: {r.preset.network}</p>
              <p>GPU: {r.preset.gpu}</p>
              <p>폴더: {r.out.directory}</p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
