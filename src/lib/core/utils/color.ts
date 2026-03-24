import { ColorHex } from "./../interfaces";

function convertColorStringToNumber(color: ColorHex): number {
	if (color.length === 7 && color.includes("#")) {
		return parseInt(`0x${color.split("#")[1]}`);
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
