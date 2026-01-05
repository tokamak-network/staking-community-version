# Frontend Component Specification

## 1. Tech Stack
- Framework: React (Next.js)
- Styling: Tailwind CSS
- State Management: TanStack Query (React Query)
- Web3: Wagmi / Viem

## 2. Shared Components
- **`BridgedTonBar`**: Displays $B_i$ value with a progress bar relative to the ecosystem max.
- **`StatusBadge`**:
  - `Healthy` (Green): $T_i \ge \theta \cdot B_i$
  - [cite_start]`Warning` (Red): $T_i < \theta \cdot B_i$ (Tooltip: "No Rewards")[cite: 304].

## 3. Page: Main Dashboard
- [cite_start]**`GlobalStats`**: Shows $x$ (Total Effective Bridged TON) and Current Inflation Rate (approx 7.3% at year 10)[cite: 244].
- **`L2Table`**:
  - Columns: Rank, Name, Bridged TON, Saturation Level, APY, Action.
  - [cite_start]Sorting: Default by Bridged TON (Performance)[cite: 273].

## 4. Page: L2 Detail
- **`HealthGauge`**:
  - Visualizes $T_i$ vs Required ($\theta \cdot B_i$).
  - Shows "Safe Buffer" amount ($T_i - \theta \cdot B_i$).
- **`SaturationChart`**:
  - Plots the curve $y(x) = L \cdot \frac{x}{k+x}$.
  - [cite_start]Marks the current position of the L2 to show marginal returns[cite: 314].
- **`StakingSimulator`**:
  - Input: User adds amount $\Delta T$.
  - Logic: Recalculate APY considering if $\Delta T$ affects Saturation or Eligibility.