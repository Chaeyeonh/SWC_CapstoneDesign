import React, { useState, useRef, useEffect } from "react";
// import TooltipIcon from "../assets/tooltip.jpg"; // 이 이미지를 아이콘 대신 사용할 경우

interface TooltipProps {
  text: string; // 툴팁에 표시할 텍스트 (HTML 포함)
  children: React.ReactNode; // 툴팁을 트리거할 자식 요소 (체크박스 그룹의 제목 등)
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  // 1. 툴팁 표시 상태 관리
  const [isVisible, setIsVisible] = useState(false);
  
  // 툴팁 외부 클릭 감지를 위한 ref
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 2. 외부 클릭 감지 useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 툴팁 내부나 아이콘을 클릭한 것이 아니라면 툴팁을 닫음
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("mousedown", handleClickOutside);
    
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tooltipRef]);


  return (
    // 툴팁 외부 클릭 감지를 위해 전체를 ref로 묶습니다.
    <div className="relative flex items-center group" ref={tooltipRef}> 
      
      {/* 1. 레이블 및 체크박스 영역 */}
      <div className="flex-grow">{children}</div>

      {/* 2. 정보 아이콘 (클릭 트리거) */}
      {/* ⓘ 아이콘을 사용하거나, 주석 처리된 이미지 아이콘을 사용할 수 있습니다. */}
      <span 
        className="ml-2 text-gray-500 hover:text-blue-500 cursor-pointer text-sm font-semibold"
        onClick={() => setIsVisible(!isVisible)} // 클릭 시 상태 토글
      >
        ⓘ
        {/* <img src={TooltipIcon} alt="Info" className="w-4 h-4" /> */}
      </span>


      {/* 3. 툴팁 내용 (표시 상태에 따라 클래스 변경) */}
      <div 
        className={`
          tooltip-content 
          absolute left-full transform translate-x-4 top-0 
          w-80 px-4 py-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg 
          transition-opacity duration-300 z-50
          ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'} 
        `}
      >
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </div>
  );
};

export default Tooltip;