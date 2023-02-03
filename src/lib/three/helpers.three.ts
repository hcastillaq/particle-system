export const particleSystemStringToNumber = (color: string): number => {
	if (color.length === 7 && color.includes("#")) {
		const newColor = `0x${color.split("#")[1]}`;
		return parseInt(newColor);
	}
	return 0xffffff;
};

export const particleSystemNumberToString = (color: number) => {
	return `#${color.toString(16).padStart(6, "0")}`;
};
