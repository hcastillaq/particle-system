import { ColorHex } from "./../interfaces";

function convertColorStringToNumber(color: ColorHex): number {
	if (color.length === 7 && color.charCodeAt(0) === 35) {
		return parseInt(color.slice(1), 16);
	}
	return 0xffffff;
}

function convertColorNumberToString(color: number): ColorHex {
	return `#${color.toString(16).padStart(6, "0")}`;
}

export const colorUtils = {
	stringToNumber: convertColorStringToNumber,
	numberToString: convertColorNumberToString,
};
