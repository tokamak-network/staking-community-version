// atoms/operatorAtoms.ts
import { atom, selector } from 'recoil';
import { recoilPersist } from 'recoil-persist';

export interface Operator {
  name: string;
  address: string;
  totalStaked: string;
  yourStaked?: string;
  isL2?: boolean;
  sequencerSeig?: string;
  lockedInL2?: string;
  manager?: string;
}


const { persistAtom } = recoilPersist({
  key: 'operators-persist',  // 로컬 스토리지 키 이름
  storage: typeof window === 'undefined' ? undefined : window.localStorage  // Next.js 서버 사이드 렌더링 고려
});

export const operatorsListState = atom<Operator[]>({
  key: 'operatorsListState', 
  default: [], 
  effects_UNSTABLE: [persistAtom],
});

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


