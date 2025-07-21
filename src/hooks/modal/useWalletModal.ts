import {
	operatorSelectModalStatus,
	walletModalStatus,
} from "@/recoil/modal/atom";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

export default function useWalletModal() {
	const [isOpen, setModalOpen] = useRecoilState(walletModalStatus);

	const onOpenSelectModal = () => {
		setModalOpen(true);
	};

	const closeSelectModal = useCallback(() => {
		setModalOpen(false);
	}, []);

	return {
		isOpen,
		onOpenSelectModal,
		closeSelectModal,
	};
}
