import { GArtSystemCPU } from "./cpu/GArtSystemCPU";
import { GArtSystemGPU } from "./gpu";

interface GArtConfigBase {
	container: HTMLElement;
	material: GArtMaterialConfig;
	zoom?: number;
	stats?: boolean;
	orbitConfig?: GArtOrbitControlConfig;
}

export interface GArtGPUConfig extends GArtConfigBase {
	system: GArtSystemGPU;
}

export interface GArtCPUConfig extends GArtConfigBase {
	system: GArtSystemCPU<GArtParticle>;
}

/** Hex color string, e.g. "#00ffff" or "#ffffff" */
export type ColorHex = `#${string}`;

export interface GArtMaterialConfig {
	color: ColorHex;
	opacity?: number;
	sizeParticle?: number;
}

export interface GArtCallbacks {
	start: () => void;
	stop: () => void;
	dispose: () => void;
	changeColor: (color: ColorHex) => void;
	changeOpacity: (opacity: number) => void;
	takePhoto: (fileName?: string) => void;
}

export interface GArtOrbitControlConfig {
	enableDamping?: boolean;
	dampingFactor?: number;
	enableZoom?: boolean;
	autoRotate?: boolean;
	autoRotateSpeed?: number;
}

export interface GArtParticle {
	x: number;
	y: number;
	z: number;
	[key: string]: unknown;
}
