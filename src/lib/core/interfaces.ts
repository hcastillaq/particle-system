import { GArtSystemCPU } from "./cpu/GArtSystemCPU";
import { GArtSystemGPU } from "./gpu";

export interface GArtConfig {
	system: GArtSystemGPU | GArtSystemCPU;
	container: HTMLElement;
	material: GArtMaterialConfig;
	zoom?: number;
	stats?: boolean;
	orbitConfig?: GArtOrbitControlConfig;
	speed?: number;
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
	takePhoto: (fileName?: string) => void;
	setColor: (color: ColorHex) => void;
	setOpacity: (opacity: number) => void;
	setAutoRotate: (autoRotate: boolean) => void;
	setSpeed: (speed: number) => void;
}

export interface GArtOrbitControlConfig {
	enableDamping?: boolean;
	dampingFactor?: number;
	enableZoom?: boolean;
	autoRotate?: boolean;
	autoRotateSpeed?: number;
}

export interface GArtGPUVariable {
	name: string;
	shader: string;
}
