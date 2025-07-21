export const getButtonText = (value: string, activeAction: string) => {
	if (value === "0.00" || !value || value === "0") return "Enter an amount";

	switch (activeAction) {
		case "Stake":
			return "Stake";
		case "Unstake":
			return "Unstake";
		case "Withdraw":
			return "Withdraw";
		case "WithdrawL1":
			return "Withdraw";
		case "WithdrawL2":
			return "Withdraw to L2";
		case "Restake":
			return "Restake";
		default:
			return "Submit";
	}
};
