export const actionButtonStyle = (isActive: boolean) => ({
	h: "32px",
	borderRadius: "16px",
	border: "1px",
	borderColor: "#E7EBF2",
	bgColor: isActive ? "#2a72e5" : "white",
	// w: '80px',
	fontSize: "12px",
	fontWeight: 600,
	color: isActive ? "white" : "#808992",
	_hover: {
		bgColor: isActive ? "#1a62d5" : "#f5f7fa",
		borderColor: isActive ? "#1a62d5" : "#d7dbe2",
		transform: "translateY(-1px)",
		boxShadow: "sm",
	},
	transition: "all 0.2s ease-in-out",
});

export const mainButtonStyle = (value: string) => ({
	w: "full",
	variant: "outline",
	bgColor: value !== "0.00" && value && value !== "0" ? "#257EEE" : "#E9EDF1",
	color: value !== "0.00" && value && value !== "0" ? "#fff" : "#86929d",
	h: "60px",
	fontWeight: 500,
	fontSize: "14px",
	justifyContent: "center",
	mb: 6,
	isDisabled: value === "0.00" || !value || value === "0",
	_hover: {
		bgColor: value !== "0.00" && value && value !== "0" ? "#1a62d5" : "#E9EDF1",
	},
	transition: "all 0.2s ease-in-out",
});

export const updateSeigniorageStyle = {
	fontSize: "12px",
	color: "#2a72e5",
	cursor: "pointer",
	// textAlign: 'right',
	fontWeight: 400,
	_hover: {
		color: "#1a62d5",
		textDecoration: "underline",
	},
	transition: "all 0.2s ease",
};

export const withdrawOptionButtonStyle = (isSelected: boolean) => ({
	bgColor: "white",
	color: "#808992",
	border: "none",
	w: "94px",
	fontWeight: 600,
	fontSize: "12px",
	justifyContent: "start",
	_hover: {
		color: "#2a72e5",
	},
});
