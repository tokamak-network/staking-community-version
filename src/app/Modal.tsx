import CalculatorModal from "@/components/modal/CalculatorModal";
import OperatorSelectModal from "@/components/modal/OperatorSelectModal";
import WalletModal from "@/components/modal/WalletModal";

export default function Modals() {
	return (
		<>
			<OperatorSelectModal />
			<CalculatorModal />
			<WalletModal />
		</>
	);
}
