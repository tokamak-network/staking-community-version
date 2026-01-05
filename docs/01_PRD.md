# Product Requirements Document (PRD): Tokamak Staking V3 Frontend

## 1. 개요
Tokamak Network의 새로운 토크노믹스(V3)를 지원하는 스테이킹 대시보드입니다.
사용자는 L2의 성능(Bridged TON)과 스테이킹 건전성(Minimum Requirement)을 확인하고,
최적의 보상을 받을 수 있는 L2를 선택하여 TON을 스테이킹할 수 있어야 합니다.

## 2. 핵심 목표
1. [cite_start]**성과 기반 보상 시각화:** L2의 Bridged TON($B_i$)이 보상의 핵심 기준임을 보여줌[cite: 273].
2. [cite_start]**리스크 경고 (Rule 4):** L2의 총 스테이킹 양($T_i$)이 최소 요구량($\theta \cdot B_i$) 미만일 경우 보상 자격이 없음을 경고[cite: 296, 298].
3. [cite_start]**수확 체감(Saturation) 시뮬레이션:** 특정 L2에 스테이킹이 몰릴 경우 효율이 떨어짐을 시각적으로 안내[cite: 275].

## 3. 사용자 타겟
- **TON 보유자:** 안정적이고 높은 수익률을 원하는 투자자.
- **L2 운영자:** 자신의 L2에 더 많은 스테이킹을 유치하고자 하는 시퀀서.

## 4. 주요 기능 (Features)
- [cite_start]**Dashboard:** 전체 생태계 현황 (Total Bridged TON, Inflation Rate) 표시[cite: 231, 307].
- **L2 List:** Bridged TON 순위대로 L2 나열 및 상태(Active/Inactive) 표시.
- **Staking Detail:** 특정 L2의 APY, 포화도(Saturation), 최소 요구량 버퍼(Buffer) 표시.
- **Simulator:** 추가 예치 시 예상 수익률 변화 계산.