# 01. Project Overview & PRD

## 1. 개요
**Tokamak Staking V3 Frontend**는 Tokamak Network의 새로운 토크노믹스(V3)를 지원하는 통합 유저 포털입니다.
V3의 핵심인 **성과 기반(Performance-based) 보상 시스템**을 사용자에게 시각적으로 전달하고, 사용자가 생태계의 건전성(Health)에 기여할 수 있도록 돕는 것이 목적입니다.

## 2. 핵심 목표 (Core Goals)
1.  **성과 기반 보상 시각화:**
    * [cite_start]L2의 **Bridged TON ($B_i$)**이 보상의 핵심 기준임을 명확히 보여줍니다[cite: 273].
    * 단순 스테이킹 양이 아닌, 실제 L2 활성도(Bridged TON)가 중요함을 강조합니다.
2.  **리스크 경고 (Rule 4 준수):**
    * [cite_start]L2의 총 스테이킹 양($T_i$)이 최소 요구량($\theta \cdot B_i$) 미만일 경우, 보상 자격이 없음을 경고합니다[cite: 296, 298].
    * 사용자가 "위험한 L2"에 스테이킹하지 않도록(혹은 살리기 위해 스테이킹하도록) 유도합니다.
3.  **수확 체감(Saturation) 시뮬레이션:**
    * [cite_start]특정 L2에 스테이킹이 과도하게 몰릴 경우 보상 효율이 떨어짐을 시각적으로 안내합니다 (쌍곡선 함수 적용)[cite: 275, 314].

## 3. 사용자 타겟
* **TON 보유자 (Delegator):** 안정적이고 높은 수익률을 제공하는 L2를 찾아 지지(Support)하려는 투자자.
* **L2 운영자 (Sequencer):** 자신의 L2 성과($B_i$)를 홍보하고, 자격 유지($T_i$)를 위해 위임을 유치하려는 운영자.

## 4. 주요 기능 (Key Features)
* [cite_start]**Dashboard:** 전체 생태계 현황 (Total Bridged TON, Inflation Rate) 표시[cite: 231, 307].
* [cite_start]**L2 List:** Bridged TON 순위대로 L2 나열 및 상태(Active/Risk) 표시[cite: 273].
* **Staking Detail:** 특정 L2의 APY, 포화도(Saturation), 최소 요구량 버퍼(Buffer) 상세 조회.
* **Simulator:** 내가 TON을 추가 예치했을 때, 해당 L2의 자격 충족 여부와 예상 수익률 변화 계산.