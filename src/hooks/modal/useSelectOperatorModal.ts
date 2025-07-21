import { operatorSelectModalStatus } from "@/recoil/modal/atom";
import { useCallback } from "react";
import { useRecoilState } from "recoil";

export default function useSelectOperatorModal() {
	const [isOpen, setModalOpen] = useRecoilState(operatorSelectModalStatus);

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
