# Technical Specification: Staking V3 Logic & Algorithms

## 1. Constants & Parameters
- [cite_start]$A$: Total Annual Seigniorage (Fixed)[cite: 287].
- [cite_start]$d$: DAO distribution parameter (0 < d < 1)[cite: 291].
- [cite_start]$L$: Upper bound of seigniorage allocated to L2s ($L = (1-d) \cdot A$)[cite: 315].
- [cite_start]$\theta$: Minimum staking ratio parameter (0 < \theta \le 1)[cite: 299].
- [cite_start]$k$: Half-saturation point constant[cite: 315].
- [cite_start]$\alpha$: Validator distribution ratio[cite: 323].

## 2. Core Formulas

### A. Eligibility Check (Rule 4)
각 L2 $i$가 시뇨리지를 받을 자격이 있는지 판단하는 함수:
$$1_i = \begin{cases} 1 & \text{if } T_i \ge \theta \cdot B_i \\ 0 & \text{otherwise} \end{cases}$$
[cite_start][cite: 303, 304]
- $T_i$: Total Staked TON in L2 $i$
- $B_i$: Bridged TON in L2 $i$

### B. Total L2 Performance
자격 조건을 통과한 L2들의 유효 Bridged TON 합계:
$$x = \sum_{i} 1_i \cdot B_i$$
[cite_start][cite: 307]

### C. Total Distributable Seigniorage (Hyperbolic Function)
생태계 전체에 뿌려질 총 보상량 (수확 체감 적용):
$$y(x) = L \cdot \frac{x}{k+x}$$
[cite_start][cite: 314]

### D. Individual L2 Allocation
특정 L2 $i$에 할당되는 총 보상:
$$S_i = y(x) \cdot \frac{1_i \cdot B_i}{x}$$
[cite_start][cite: 322]

### E. User (Validator) Reward Calculation
사용자(Validator $j$)가 L2 $i$에서 받는 보상:
$$v_j = \frac{\alpha \cdot S_i}{|V_i|}$$
(단, 사용자의 지분에 따라 비례 배분하는 로직 추가 구현 필요) [cite_start][cite: 326]

## 3. Data Requirements
- [cite_start]Frontend must fetch `BridgedTON` ($B_i$) and `TotalStaked` ($T_i$) from the contract or subgraph periodically[cite: 309].
- [cite_start]Inflation rate decreases over time based on total supply $S(t)$[cite: 244].