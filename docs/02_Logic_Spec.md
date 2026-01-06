# 02. Technical Specification: Logic & Algorithms

본 문서는 프론트엔드에서 데이터를 가공하거나 시뮬레이션할 때 사용되는 핵심 수식과 상수를 정의합니다.

## 1. Constants & Parameters (Contract Config)
프론트엔드는 다음 파라미터들을 컨트랙트에서 조회하여 상수로 관리해야 합니다.

| 파라미터 | 설명 | 백서 참조 |
| :--- | :--- | :--- |
| **$A$** | [cite_start]연간 총 시뇨리지 발행량 (고정값) | [cite: 287] |
| **$d$** | [cite_start]DAO 분배 비율 ($0 < d < 1$) | [cite: 291] |
| **$L$** | [cite_start]L2 할당 시뇨리지 상한 ($L = (1-d) \cdot A$) | [cite: 315] |
| **$\theta$** | [cite_start]최소 스테이킹 비율 파라미터 ($0 < \theta \le 1$) | [cite: 299] |
| **$k$** | [cite_start]반포화점 상수 (Half-saturation point) | [cite: 315] |
| **$\alpha$** | [cite_start]검증자 분배 비율 | [cite: 323] |

## 2. Core Formulas (Calculations)

### A. Eligibility Check (Rule 4)
각 L2가 보상을 받을 자격이 있는지 판단하는 로직입니다. **Frontend의 `StatusBadge` 상태 결정에 사용됩니다.**

$$
\text{IsEligible}_i = \begin{cases} \text{true} & \text{if } T_i \ge \theta \cdot B_i \\ \text{false} & \text{otherwise} \end{cases}
$$

* [cite_start]$T_i$: 해당 L2의 총 스테이킹 양 (Sequencer Deposit + User Delegation) [cite: 294]
* [cite_start]$B_i$: 해당 L2의 Bridged TON 총량 [cite: 294]

### B. Total L2 Performance ($x$)
전체 생태계의 유효 성과 총합입니다. **Dashboard의 Global Stats에 표시됩니다.**

$$
x = \sum_{i \in \text{Eligible}} B_i
$$

[cite_start][cite: 307]

### C. Total Distributable Seigniorage ($y(x)$)
생태계 전체에 분배되는 총 시뇨리지 양입니다. **수확 체감(Saturation) 시뮬레이션에 사용됩니다.**

$$
y(x) = L \cdot \frac{x}{k+x}
$$

[cite_start][cite: 314]

### D. Individual L2 Allocation ($S_i$)
특정 L2가 가져가는 총 파이입니다.

$$
S_i = y(x) \cdot \frac{B_i}{x} \quad (\text{단, Eligible한 경우만})
$$

[cite_start][cite: 322]

## 3. Data Requirements
* [cite_start]**Real-time Data:** Frontend는 `BridgedTON` ($B_i$)과 `TotalStaked` ($T_i$)를 컨트랙트 또는 서브그래프(Subgraph)에서 주기적으로(Polling) 가져와야 합니다[cite: 309].
* [cite_start]**Inflation:** 인플레이션율은 총 발행량 $S(t)$에 따라 시간이 지남에 따라 감소하므로, 현재 블록 높이 기준의 총 발행량을 조회하여 계산해야 합니다[cite: 244].