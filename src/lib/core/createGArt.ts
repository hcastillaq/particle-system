import { createGArtCPU, GArtSystemCPU } from "./cpu";
import { createGArtGPU } from "./gpu";
import { GArtConfig } from "./interfaces";

export const createGArt = (config: GArtConfig) => {
	const system = config.system;

	if (system instanceof GArtSystemCPU) {
		return createGArtCPU(config);
	} else {
		return createGArtGPU(config);
	}
};
