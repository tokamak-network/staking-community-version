// atoms/operatorAtoms.ts
import { atom, selector } from 'recoil';
import { recoilPersist } from 'recoil-persist';

// 오퍼레이터 타입 정의
export interface Operator {
  name: string;
  address: string;
  totalStaked: string;
  yourStaked?: string;
}


const { persistAtom } = recoilPersist({
  key: 'operators-persist',  // 로컬 스토리지 키 이름
  storage: typeof window === 'undefined' ? undefined : window.localStorage  // Next.js 서버 사이드 렌더링 고려
});

// 오퍼레이터 리스트를 위한 atom
export const operatorsListState = atom<Operator[]>({
  key: 'operatorsListState', 
  default: [], 
  effects_UNSTABLE: [persistAtom],
});

// 오퍼레이터 로딩 상태를 위한 atom
export const operatorsLoadingState = atom<boolean>({
  key: 'operatorsLoadingState',
  default: true,
  effects_UNSTABLE: [persistAtom], 
});

// 선택된 오퍼레이터를 위한 atom (필요한 경우)
export const selectedOperatorState = atom<string | null>({
  key: 'selectedOperatorState',
  default: null, 
});

export const operatorFilterState = atom<string>({
  key: 'operatorFilterState',
  default: '',
});

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


