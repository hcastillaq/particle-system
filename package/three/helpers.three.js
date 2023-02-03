export const particleSystemStringToNumber = (color) => {
    if (color.length === 7 && color.includes("#")) {
        const newColor = `0x${color.split("#")[1]}`;
        return parseInt(newColor);
    }
    return 0xffffff;
};
export const particleSystemNumberToString = (color) => {
    return `#${color.toString(16).padStart(6, "0")}`;
};
//# sourceMappingURL=helpers.three.js.map