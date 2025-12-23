import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EnvironmentSelector } from "../components/EnvironmentSelector";
import { useRun } from "../hooks/useRun";
import { useToggle } from "../hooks/useToggle";
import { Button } from "../components/common/Button";
import { ProgressBar } from "../components/common/ProgressBar";

export default function PopupPage() {
  const navigate = useNavigate();
  const toggle = useToggle();
  //const { currentIndex, totalCount } = useRun();

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

  const canRun = url.trim().length > 0 && totalPresets > 0;  // URL이 유효해야만 실행 가능

  const handleRun = async () => {
    if (!canRun) return;
    await runPresets();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-5 w-[360px] bg-white shadow-lg rounded-md">
        <h2 className="text-xl font-semibold mb-4">UX Simulator</h2>

        {/* Environment Selector 컴포넌트 */}
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

        {/* 실행 버튼 */}
        <Button
          fullWidth
          size="lg"
          variant="primary"
          disabled={!canRun || loading}  // URL 유효성 검사 후 버튼 비활성화
          onClick={handleRun}
          className="mt-5"
        >
          {loading ? "실행 중..." : "실행하기"}
        </Button>

        {/* 로딩 진행 상황 */}
        {/* {loading && totalCount > 0 && (
          <ProgressBar current={currentIndex} total={totalCount} />
        )} */}

    

        {/* URL과 옵션들이 모두 채워지지 않은 경우 경고 메시지 */}
        {!canRun && (
          <p className="mt-2 text-red-600 text-xs">
            URL과 각 옵션에서 최소 1개 이상 선택해야 합니다.
          </p>
        )}
      </div>
    </div>
  );
}
