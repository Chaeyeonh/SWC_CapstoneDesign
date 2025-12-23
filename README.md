# SWC_CapstoneDesign
2025-2 소프트웨어융합캡스톤디자인
# UX Simulator & Visualizer

---

## 📌 프로젝트 소개

현대 웹 서비스는 기능과 시각적 요소가 빠르게 복잡해지면서, 로딩 과정에서 발생하는 지연·레이아웃 흔들림·상호작용 실패 같은 UX 문제가 사용자 경험을 크게 좌우합니다.  
하지만 개발·테스트는 대체로 고사양 PC와 안정적인 네트워크 환경에서 이루어지기 때문에, 실제 사용자 환경(저속 네트워크, 저사양 CPU, 메모리 제약, GPU 가속 제한 등)에서 발생하는 성능 저하나 렌더링 실패가 사전에 재현되지 않는 경우가 많습니다. 특히 글로벌 서비스에서는 지역별 인프라 차이와 단말 성능 격차로 인해 “특정 환경에서만” UX가 급격히 무너지는 문제가 발생할 수 있으며, 이러한 이슈는 배포 이후 사용자 불만과 이탈로 이어질 위험이 있습니다.

이를 해결하기 위해 Lighthouse, Chrome DevTools, WebPageTest와 같은 도구들이 성능 지표 측정과 원인 분석 기능을 제공하지만, 대부분 사용자가 선택한 **단일 환경 프로파일**에서의 정적인 진단에 머무르며, 다양한 제약 환경 조합에서 **언제부터 UX가 무너지는지(임계 조건)**를 찾는 과정은 개발자가 조건을 바꿔가며 반복 실행하는 수동 워크플로우로 남아 있습니다.

본 프로젝트는 이러한 공백을 메우기 위해, **CPU·Network·GPU·Memory 제약 조건을 조합(Preset)으로 자동 생성하고 반복 실행**하여 Web Vitals(LCP, FCP, CLS, TTFB)를 수집·비교함으로써, 문제 환경을 빠르게 좁히는 **UX 성능 스크리닝 도구**를 구현하는 것을 목표로 합니다.  
또한 단순 수치 리포트에 그치지 않고, 선택한 Preset을 **headful 브라우저로 재현 실행**하여 실제 로딩 화면을 시각적으로 확인할 수 있게 하고, 조합 간 비교를 통해 지표가 급격히 악화되는 **스파이크(Spike) 구간**을 자동 탐지해 “이 조건부터 집중 테스트하라”는 우선순위를 제시합니다. 마지막으로 OpenAI API 기반 분석 기능을 통해 측정 결과 해석과 개선 방향을 요약 제공하여, 제약 환경에서의 UX 리스크를 배포 전에 선제적으로 줄이는 것을 지향합니다.


## ✨ 주요 기능

### 1) 제약 환경 Preset 조합 스크리닝
- URL + CPU / Network / GPU / Memory 옵션을 **복수 선택(체크박스)**하여 환경 조합(Preset)을 자동 생성
- 생성된 모든 조합을 반복 실행하여 결과를 대시보드에 누적

### 2) CDP 기반 환경 제어 + Puppeteer 자동 실행
- Chrome DevTools Protocol(CDP)로 네트워크/성능 관련 실행 조건을 적용
- Puppeteer로 동일 조건에서 페이지 로딩을 반복 수행 (재현성 확보)

### 3) Web Vitals 측정 및 기준 비교
- LCP / FCP / CLS / TTFB 수집
- 지표별 권장 기준과 비교하여 기준 초과 시 병목 가능성 표시
- Timeout 발생 시 “측정 실패/timeout” 상태로 별도 처리(0값 오해 방지)

### 4) 스파이크(급격한 악화) 자동 탐지
- 환경 조합 간 지표 변화량을 비교하여 특정 조건 변화에서 급격히 악화되는 구간을 강조 표시
- “이 환경부터 테스트하라”는 우선순위 도출에 활용

### 5) Headful 브라우저 재현 실행(시각적 UX 확인)
- Dashboard에서 특정 Preset을 클릭하면 동일 조건으로 **headful Chrome UI**를 띄워 렌더링 흐름을 직접 확인
- 클릭/스크롤 등 기본 상호작용을 관찰하여 체감 UX 이슈를 빠르게 파악

### 6) OpenAI API 기반 결과 해석(초기 버전)
- 각 Preset 결과에 대해 “AI 분석 보기” 버튼 제공
- 지표/환경/패턴을 바탕으로 해석, 원인 후보, 개선 방향을 요약 제공

---

##  사용 흐름

1. **PopupPage**에서 URL 입력 및 Preset 옵션(CPU/Network/GPU/Memory) 선택  
2. `Run` 실행 → `/api/run`로 조합 스크리닝 요청  
3. 완료 시 **DashboardPage**로 이동 → 조합별 결과 확인/비교  
4. 특정 Preset 선택 → 필요 시 `/api/run/headful`로 **동일 조건 재현 실행**  
5. (선택) “AI 분석 보기”로 원인/개선안 요약 확인  

---

##  시스템 구성(요약)

- Frontend: React , TailwindCSS
- State: React Context (RunContext / RunProvider)
- Backend: Node.js API
- Browser Automation: Puppeteer + CDP
- Metrics: LCP / FCP / CLS / TTFB 수집
- AI Analysis: OpenAI API (선택 기능)

---

## 🎬 Demo Video

- ▶️ YouTube: https://youtu.be/j-3s3HZ4M5M

[![Demo Video](https://img.youtube.com/vi/j-3s3HZ4M5M/0.jpg)](https://youtu.be/j-3s3HZ4M5M)


## 📁 폴더 구조


### Server (`/server`)

| 폴더/파일명 | 설명 |
|---|---|
| `server/index.js` | 서버 엔트리 포인트(라우팅/미들웨어 설정 및 서버 실행 시작점) |
| `server/routes` | API 엔드포인트 라우팅 정의 (`/api/run`, `/api/run/headful` 등) |
| `server/controllers` | 요청 처리 로직(프리셋 실행 요청 수신, 결과 생성·응답 반환) |
| `server/runner` | Puppeteer + CDP 기반 실행 모듈(환경 조합 스크리닝, headful 렌더링 재현 실행) |
| `server/utils` | 공통 유틸(프리셋 파싱/검증, 결과 가공, 로그 처리 등) |
| `server/package.json` | 서버 의존성 및 실행 스크립트 |
| `server/package-lock.json` | 서버 의존성 잠금 파일 |

### Web (`/web`)

| 폴더/파일명 | 설명 |
|---|---|
| `web/public` | 정적 파일(기본 HTML, 아이콘 등) |
| `web/src/assets` | 이미지/아이콘 등 UI 자산 |
| `web/src/components` | UI 컴포넌트 모음 |
| `web/src/components/common` | 재사용 공통 컴포넌트(버튼/카드/배지 등) |
| `web/src/components/popup` | URL 및 환경 프리셋 선택 UI 컴포넌트 |
| `web/src/components/dashboard` | 결과 리스트/그래프/상세 분석 패널 UI 컴포넌트 |
| `web/src/pages` | 페이지 단위 컴포넌트(팝업/대시보드 등 라우팅 단위) |
| `web/src/hooks` | 커스텀 훅(실행 상태/선택 상태/UI 상태 처리) |
| `web/src/services` | API 통신 모듈(스크리닝 실행, headful 실행, AI 분석 요청 등) |
| `web/src/types` | 타입 정의(Preset, ScreeningResult, Metrics 등) |
| `web/src/utils` | 공통 유틸(지표 포맷팅, 기준 비교, 배지 상태 계산 등) |
| `web/package.json` | 프론트 의존성 및 실행 스크립트 |
| `web/package-lock.json` | 프론트 의존성 잠금 파일 |

