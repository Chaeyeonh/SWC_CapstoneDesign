import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EnvironmentSelector } from "../components/EnvironmentSelector";
import { useRun } from "../hooks/useRun";
import { useToggle } from "../hooks/useToggle";

export default function PopupPage() {
  const navigate = useNavigate();
  const toggle = useToggle();
  const {
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
    runPresets,
    loading,
  } = useRun();

  const totalPresets = useMemo(
    () => cpus.length * networks.length * gpus.length * memories.length,
    [cpus.length, networks.length, gpus.length, memories.length]
  );

  const canRun = url.trim().length > 0 && totalPresets > 0;

  const handleRun = async () => {
    if (!canRun) return;
    await runPresets();
    navigate("/dashboard");
  };

  return (
    <div style={{ padding: 16, width: 360 }}>
      <h2 style={{ marginTop: 0 }}>UX Simulator</h2>
      <EnvironmentSelector
        url={url}
        setUrl={setUrl}
        cpus={cpus}
        setCpus={setCpus}
        networks={networks}
        setNetworks={setNetworks}
        gpus={gpus}
        setGpus={setGpus}
        memories={memories}
        setMemories={setMemories}
        toggle={toggle}
      />

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleRun}
          disabled={!canRun || loading}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: "none",
            background: canRun && !loading ? "#2563eb" : "#94a3b8",
            color: "#fff",
            fontSize: 16,
            cursor: canRun && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "실행 중..." : `실행`}
        </button>
        {!canRun && (
          <p style={{ marginTop: 8, color: "#b91c1c", fontSize: 12 }}>
            URL과 각 옵션에서 최소 1개 이상 선택해야 합니다.
          </p>
        )}
      </div>
    </div>
  );
}
