import { atom } from "recoil";

type withdrawModal = {
  isOpen: boolean;
  modalData?: any;
};

export const transactionModalStatus = atom<
  "confirming" | "confirmed" | "error" | null
>({
  key: "transactionModalStatus",
  default: null,
});

export const operatorSelectModalStatus = atom<boolean>({
  key: "operatorSelectStatus",
  default: false,
});

export const transactionModalOpenStatus = atom<boolean>({
  key: "transactionModalOpenStatus",
  default: false,
});