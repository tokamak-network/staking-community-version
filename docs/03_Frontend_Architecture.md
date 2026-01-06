# 03. Frontend Architecture

## 1. Tech Stack
* **Framework:** React (Next.js 14+ App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Shadcn/UI 호환 권장)
* **State Management:** TanStack Query (React Query) - 주기적 데이터 폴링 및 캐싱
* **Web3 Integration:** Wagmi / Viem (Contract Read/Write)

## 2. Directory Structure (Proposed)
```bash
src/
├── app/
│   ├── page.tsx              # Main Dashboard
│   ├── l2/
│   │   └── [id]/page.tsx     # L2 Detail & Simulator
│   └── layout.tsx            # Global Layout (Header, Footer)
├── components/
│   ├── common/               # Buttons, Inputs, Cards
│   ├── charts/               # SaturationChart, HealthGauge
│   ├── l2/                   # L2Table, StatusBadge
│   └── staking/              # StakingModal, UnstakingModal
├── hooks/
│   ├── useL2Data.ts          # Fetch Bridged TON, Staked TON
│   ├── useTokenomics.ts      # Fetch Constants (A, d, k, theta)
│   └── useSimulator.ts       # Calculate APY based on input
├── lib/
│   ├── contracts.ts          # Contract ABIs & Addresses
│   └── math.ts               # V3 Formula Implementations
└── types/
    └── index.ts              # Type definitions (L2Data, TokenomicsParams)
```

## 3. State Management & Data Strategy

이 프로젝트는 블록체인 상태(Server State)와 UI 상태(Client State)를 엄격히 분리하여 관리합니다.

### A. Global Constants (Static Data)

네트워크 파라미터는 거버넌스 투표 없이는 변경되지 않으므로, 앱 초기화 시 한 번 로드하고 전역에서 재사용합니다.

**Target Params:**
- $A$ (Annual Seigniorage)
- $d$ (DAO Ratio)
- $k$ (Half-saturation Point)
- $\theta$ (Min Staking Ratio)

**Strategy:**
- `useQuery`의 `staleTime`을 `Infinity`로 설정하여 불필요한 RPC 호출 방지

### B. L2 Real-time Data (Dynamic Data)

L2별 성과와 스테이킹 상태는 블록 생성마다 변경될 수 있는 핵심 데이터입니다.

**Target Data:**
- $B_i$ (Bridged TON)
- $T_i$ (Staked TON)
- Eligibility Status (Active/Risk)

**Strategy:**
- **Dashboard:** 30초~1분 간격의 Polling (`refetchInterval`)
- **L2 Detail & Simulator:** 10~15초 간격 Polling (시뮬레이션 정확도 및 사용자 피드백을 위함)
- **Optimistic Updates:** 사용자가 Stake 트랜잭션을 성공시키면, 블록 확정 전이라도 UI상 수치를 미리 업데이트하여 반응성 향상

### C. BigNumber & Precision Handling

자바스크립트의 숫자 정밀도 한계를 극복하기 위한 전략입니다.

**Storage:**
- 모든 토큰 관련 데이터는 BigInt (wei/ray 단위) 상태로 유지

**Computation:**
- 계산 로직(`lib/math`) 내부에서는 BigInt 연산만 수행

**Display:**
- UI에 렌더링하는 최하위 단계(`components`)에서만 사람이 읽을 수 있는 포맷(String)으로 변환

**Unit Conversion:**
- **TON Token:** 18 decimals ($10^{18}$)
- **V3 Parameters** ($\theta, \alpha, k$): 27 decimals (RAY)
- **Frontend Logic:** $T_i \ge \theta \cdot B_i$ 비교 시, $B_i$에 $10^9$을 곱하거나 $\theta$를 $10^9$로 나누는 등 자릿수 정규화(Normalization) 필수 적용

