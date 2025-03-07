// atoms/operatorAtoms.ts
import { atom, selector } from 'recoil';

// 오퍼레이터 타입 정의
export interface Operator {
  name: string;
  address: string;
  totalStaked: string;
  yourStaked?: string;
}

// 오퍼레이터 리스트를 위한 atom
export const operatorsListState = atom<Operator[]>({
  key: 'operatorsListState', // 고유한 키 이름 
  default: [], // 기본값은 빈 배열
});

// 오퍼레이터 로딩 상태를 위한 atom
export const operatorsLoadingState = atom<boolean>({
  key: 'operatorsLoadingState',
  default: true,
});

// 선택된 오퍼레이터를 위한 atom (필요한 경우)
export const selectedOperatorState = atom<string | null>({
  key: 'selectedOperatorState',
  default: null, // 기본값은 null (선택된 오퍼레이터 없음)
});

// 오퍼레이터 필터링을 위한 atom (필요한 경우)
export const operatorFilterState = atom<string>({
  key: 'operatorFilterState',
  default: '',
});

// 필터링된 오퍼레이터 목록을 위한 selector
export const filteredOperatorsState = selector({
  key: 'filteredOperatorsState',
  get: ({ get }) => {
    const operators = get(operatorsListState);
    const filter = get(operatorFilterState).toLowerCase();
    
    if (!filter) return operators;
    
    return operators.filter(operator => 
      operator.name.toLowerCase().includes(filter)
    );
  }
});

// 오퍼레이터 총 스테이킹 금액 selector
export const totalStakedAmountState = selector({
  key: 'totalStakedAmountState',
  get: ({ get }) => {
    const operators = get(operatorsListState);
    return operators.reduce((total, operator) => {
      // BigInt로 변환해서 계산하는 경우
      try {
        return total + BigInt(operator.totalStaked);
      } catch (e) {
        // 숫자로 파싱할 수 없는 경우 그냥 현재 total 반환
        return total;
      }
    }, BigInt(0)).toString();
  }
});