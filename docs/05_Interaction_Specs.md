# 05. Action & Interaction Specifications

이 문서는 사용자가 UI에서 수행하는 핵심 액션(Transaction)에 대한 상세 요구사항, 검증 로직, 데이터 흐름을 정의합니다.

---

## 1. Action: Stake (Deposit)
사용자가 특정 L2를 지지하기 위해 TON을 예치하는 액션입니다.

### 1.1 개요
* **Actor:** 일반 유저 (Holder)
* **Goal:** L2의 $T_i$를 증가시켜 'Active' 상태로 만들거나 유지함.
* **Contract:** `DepositManager.deposit(layer2, account, amount)`

### 1.2 입력 데이터 (Inputs)
* **Target L2:** 선택된 L2 주소 (Context)
* **Amount:** 예치할 TON 수량 (User Input)

### 1.3 검증 로직 (Validation)
1.  **Wallet Connection:** 지갑 연결 여부 확인.
2.  **Network Check:** 올바른 체인(Ethereum Mainnet or Titan)인지 확인.
3.  **Balance Check:** `Input Amount <= User TON Balance`
    * *Error:* "잔액이 부족합니다."
4.  **Min Amount:** `Input Amount > 0`
5.  **Allowance Check:** `Approved Amount >= Input Amount`
    * *State:* 부족할 경우 'Approve' 버튼 노출.

### 1.4 실행 흐름 (Interaction Flow)
1.  **User:** `Amount` 입력 후 `Stake` 버튼 클릭.
2.  **System (FE):** 유효성 검사 수행.
3.  **Branch A (Approval Needed):**
    * UI: 버튼 텍스트가 `Approve TON`으로 변경됨.
    * User: 클릭하여 `TON.approve(DepositManager, amount)` 서명.
    * UI: `Approving...` 스피너 표시 -> 트랜잭션 완료 대기.
    * System: 완료 후 버튼을 `Confirm Stake`로 변경.
4.  **Branch B (Stake):**
    * User: `Confirm Stake` 클릭.
    * Wallet: `DepositManager.deposit(layer2, user, amount)` 호출 서명 요청.
    * UI: `Staking...` 모달 상태 변경 (Optimistic Update: 리스트의 스테이킹 수치를 미리 증가시켜 보여줌).
5.  **Completion:**
    * Transaction Receipt 수신.
    * UI: "스테이킹이 완료되었습니다" Toast 메시지.
    * Data: `useL2Data` 쿼리 무효화(Invalidate) 및 재조회.

### 1.5 에러 처리 (Edge Cases)
* **User Rejected:** "사용자가 서명을 거부했습니다." Toast 표시.
* **Transaction Failed:** (예: 가스비 부족, 컨트랙트 일시정지) "트랜잭션 실패. 다시 시도해주세요."
* **V3 Migration check:** 만약 `v3Migrated == false`라면 액션 차단.

---

## 2. Action: Unstake (Request Withdrawal)
위임했던 자산을 회수하기 위해 출금을 요청하는 단계입니다. (즉시 인출되지 않음)

### 2.1 개요
* **Actor:** 스테이커
* **Goal:** 자산 회수 프로세스 시작 (2주 락업 타이머 가동).
* **Contract:** `DepositManager.requestWithdrawal(layer2, amount)`

### 2.2 입력 데이터
* **Target L2:** 출금할 L2 주소.
* **Amount:** 회수할 수량 (User Input).

### 2.3 검증 로직
1.  **Staked Balance Check:** `Input Amount <= My Staked Amount`
    * *Error:* "스테이킹 된 수량보다 많이 요청할 수 없습니다."
2.  **Pending Check:** 이미 진행 중인 출금 요청이 있는지 확인.
    * *Note:* DepositManager 로직상 중복 요청이 가능한지, 덮어씌워지는지 확인 필요. (일반적으로 추가 요청 시 타이머가 초기화될 수 있으므로 **경고** 필요).
    * *Warning:* "이미 진행 중인 출금 요청이 있습니다. 추가 요청 시 대기 시간이 초기화될 수 있습니다."

### 2.4 실행 흐름
1.  **User:** `Unstake` 탭에서 수량 입력 후 `Request Withdrawal` 클릭.
2.  **System:** "2주(약 100,800 블록) 동안 자산이 잠깁니다. 진행하시겠습니까?" 컨펌 모달 표시.
3.  **User:** `Confirm` 클릭.
4.  **Wallet:** `requestWithdrawal` 트랜잭션 서명.
5.  **Completion:**
    * UI: "출금 요청이 접수되었습니다. [날짜] 이후에 수령 가능합니다." 안내.
    * Data: `My Portfolio`의 상태가 `Staked` -> `Pending`으로 이동.

---

## 3. Action: Withdraw (Process Withdrawal)
대기 기간이 끝난 자산을 지갑으로 최종 수령하는 액션입니다.

### 3.1 개요
* **Actor:** 스테이커
* **Goal:** Pending 상태의 자산을 Wallet Balance로 이동.
* **Contract:** `DepositManager.processRequest(layer2)`

### 3.2 전제 조건 (Prerequisites)
* **Pending Amount > 0:** 출금 요청한 금액이 있어야 함.
* **Delay Passed:** `Current Block >= Request Block + Withdrawal Delay`
    * *UI:* 조건 미달 시 버튼 비활성화 (`Disabled`) 및 남은 시간 표시.

### 3.3 실행 흐름
1.  **User:** `My Portfolio` 목록에서 `Claimable` 상태인 항목의 `Withdraw` 버튼 클릭.
2.  **Wallet:** `processRequest` 트랜잭션 서명.
3.  **UI:** `Processing...` 상태 표시.
4.  **Completion:**
    * UI: "자산 수령 완료! 지갑을 확인하세요."
    * Data: `Pending` 목록에서 제거, 지갑 잔액 업데이트.

### 3.4 에러 처리
* **Too Early:** 블록 생성 속도 차이로 인해 FE에서는 시간이 된 것 같아도 컨트랙트에서 Revert 날 수 있음.
    * *Handling:* 예상 블록보다 5~10 블록 정도 여유를 두고 버튼을 활성화함.

---

## 4. 시뮬레이터 로직 (Frontend Calculation)

사용자가 `Stake` 액션을 고민할 때 실시간으로 피드백을 주는 로직입니다.

### 4.1 상태 시뮬레이션 (Eligibility)
* **Input:** `addAmount`
* **Formula:**
    ```typescript
    const newTotalStake = currentStake + addAmount;
    const required = bridgedTON * minStakingRatio; // (decimal 보정 필요)
    const isActiveNow = currentStake >= required;
    const willBeActive = newTotalStake >= required;
    ```
* **Output UI:**
    * `isActiveNow`가 `false`이고 `willBeActive`가 `true`이면:
    * **Effect:** "회원님의 참여로 L2가 **Active** 상태가 됩니다!" (강력한 강조 문구 & 파티클 효과)

### 4.2 안정성 버퍼 계산 (Safety Buffer)
* **Formula:**
    ```typescript
    const buffer = newTotalStake - required;
    const bufferPercent = (buffer / required) * 100;
    ```
* **Output UI:**
    * "최소 요구량보다 **15%** 더 여유가 생깁니다."

---

## 5. 데이터 갱신 전략 (Post-Action Refetching)

트랜잭션 성공 후 사용자가 새로고침 하지 않아도 최신 데이터가 반영되어야 합니다.

| 액션 | 무효화할 쿼리 키 (Invalidate Query Keys) | 이유 |
| :--- | :--- | :--- |
| **Stake** | `['l2Data', id]`, `['userStake', id]`, `['allowance']`, `['balance']` | L2의 총 스테이킹 증가, 내 지갑 잔액 감소, 내 스테이킹 증가 |
| **Unstake** | `['userStake', id]`, `['userPending', id]` | 내 스테이킹 감소, 대기중 자산 증가 |
| **Withdraw** | `['userPending', id]`, `['balance']` | 대기중 자산 소멸, 내 지갑 잔액 증가 |

```typescript
// Example: Wagmi + TanStack Query
const { writeContractAsync } = useWriteContract();
const queryClient = useQueryClient();

const handleStake = async () => {
  await writeContractAsync({ ...config });
  // 트랜잭션 확인 후 데이터 갱신
  await waitForTransactionReceipt(hash);
  queryClient.invalidateQueries({ queryKey: ['l2Data'] });
};