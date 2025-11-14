import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [network, setNetwork] = useState("slow-3g");

  const handleStart = async () => {
  if (!url) return;

  const res = await fetch("http://localhost:4000/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, network }),
  });

  const data = await res.json();
  console.log("server response:", data);
};


  return (
    <div style={{ padding: 24 }}>
      <h1>UX Visualizer </h1>

      <div style={{ marginBottom: 12 }}>
        <input
          style={{ width: 400 }}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

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

      <button onClick={handleStart}>Start Test</button>
    </div>
  );
}

export default App;

