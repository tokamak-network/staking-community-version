import { calculatorModalStatus } from "@/recoil/modal/atom";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

export default function useCalculatorModal() {
	const [isOpen, setModalOpen] = useRecoilState(calculatorModalStatus);

	const openCalculatorModal = () => {
		setModalOpen(true);
	};

	const closeSelectModal = useCallback(() => {
		setModalOpen(false);
	}, []);

	return {
		isOpen,
		openCalculatorModal,
		closeSelectModal,
	};
}
