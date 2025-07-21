export const getAvatarBgColor = (name: string): string => {
	const hue = Math.abs(
		name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360,
	);
	const saturation = 65 + Math.abs(name.charCodeAt(0) % 30);
	const lightness = 75 + Math.abs(name.charCodeAt(name.length - 1) % 10);

	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const getInitials = (name: string): string => {
	if (!name) return "?";
	const words = name.trim().split(/\s+/);
	if (words.length === 1) return name.substring(0, 2).toUpperCase();
	return words
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase();
};
