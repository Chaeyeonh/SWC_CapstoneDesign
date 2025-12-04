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
    <div className="p-4 w-[360px]">
      <h2 className="text-xl font-semibold mb-2">UX Simulator</h2>

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

      <div className="mt-5">
        <button
          onClick={handleRun}
          disabled={!canRun || loading}
          className={`w-full py-3 rounded-md text-white text-base transition
            ${canRun && !loading ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed"}
          `}
        >
          {loading ? "실행 중..." : "실행"}
        </button>

        {!canRun && (
          <p className="mt-2 text-red-600 text-xs">
            URL과 각 옵션에서 최소 1개 이상 선택해야 합니다.
          </p>
        )}
      </div>
    </div>
  );
}
