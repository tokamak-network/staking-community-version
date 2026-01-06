## 1. Design Principles
* **Trust & Transparency:** 보상이 없는 스테이킹 구조이므로, 사용자가 자신의 기여가 생태계에 어떻게 도움이 되는지 명확히 보여줘야 합니다.
* **Risk-Aware:** "Risk" 상태의 L2를 붉은색/경고 아이콘으로 강조하여 사용자의 주의를 환기합니다.

## 2. Key Components Specification

### A. `StatusBadge` (L2 상태 표시기)
각 L2 행(Row)이나 상세 페이지 헤더에 위치합니다.

* **Logic (Rule 4):**
    * `isActive` = $T_i \ge \theta \cdot B_i$
* **States:**
    * 🟢 **Active:** "정상 운영 중" (보상 자격 충족).
    * 🔴 **Risk:** "자격 미달" (최소 스테이킹 부족).
* **Tooltip:** Risk 상태일 경우, *"현재 스테이킹 부족으로 인해 시퀀서가 보상을 받지 못하고 있습니다. 스테이킹하여 L2를 지원하세요."* 메시지 표시.

### B. `HealthGauge` (건전성 시각화)
L2 상세 페이지 상단에 위치하여, 해당 L2가 얼마나 안정적인지 보여줍니다.

* **Visual:** 반원형 게이지 차트.
* **Zones:**
    * 🔴 **Red Zone (0 ~ Required):** 스테이킹 양이 부족한 구간 ($\theta \cdot B_i$ 미만).
    * 🟢 **Green Zone (Required ~ Saturation):** 안정적인 구간.
    * 🟠 **Orange Zone (Saturation+):** 과포화 구간 (보상 효율 하락).
* **Indicators:**
    * **Current Stake Marker:** 현재 $T_i$ 위치 표시.
    * **Required Stake Marker:** 최소 요구량($\theta \cdot B_i$) 위치 표시.

### C. `SaturationChart` (수확 체감 곡선)
사용자가 자신의 스테이킹이 전체 효율에 미치는 영향을 이해하도록 돕습니다.

* **Type:** Line Chart.
* **X-Axis:** Total Effective Bridged TON ($x$).
* **Y-Axis:** Total Distributed Seigniorage ($y(x)$).
* **Curve Function:** $y = L \cdot \frac{x}{k+x}$.
* **Current Point:** 현재 네트워크 전체의 $x$값 위치에 점을 찍어 표시.
* **Interaction:** 사용자가 시뮬레이터에 금액을 입력하면, 점이 곡선을 따라 이동하며 예상되는 $y(x)$ 변화를 보여줌.

### D. `StakingSimulator` (예측 도구)
사용자가 스테이킹 전 결과를 미리 확인하는 도구입니다.

* **Inputs:** `Add Amount` (추가 예치할 TON 양).
* **Outputs (Real-time Calculation):**
    1.  **Status Change:** `Risk` -> `Active`로 변하는지 여부 (가장 강력한 동기부여 요소).
    2.  **Safety Buffer:** 추가 예치 후 최소 요구량까지 얼마나 여유가 생기는지 ($T_{new} - \theta \cdot B_i$).
    3.  **Share %:** 나의 지분이 전체 풀에서 차지하는 비율 변화.

## 3. User Flows (Interaction Design)

### Flow 1: Supporting a "Risk" L2
1.  사용자가 대시보드 리스트에서 **🔴 Risk** 배지가 달린 L2 발견.
2.  상세 페이지 진입 -> `HealthGauge` 바늘이 Red Zone에 있음을 확인.
3.  `StakingSimulator`에 금액 입력 -> 바늘이 Green Zone으로 이동하는 시뮬레이션 확인.
4.  **"Support & Enable Rewards"** (문구 강조) 버튼 클릭.
5.  트랜잭션 서명 -> 완료 후 해당 L2 상태가 **🟢 Active**로 즉시 변경되는 UX 제공 (Optimistic UI 적용 권장).

### Flow 2: Checking Global Ecosystem
1.  메인 대시보드 접속.
2.  `GlobalStats` 컴포넌트에서 **현재 인플레이션율**과 **총 발행량** 확인.
3.  `BridgedTonBar`를 통해 어떤 L2가 생태계 성과($B_i$)를 주도하고 있는지 파악.