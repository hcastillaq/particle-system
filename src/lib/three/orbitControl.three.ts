import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export type OrbitControlConfig = {
	enableDamping?: boolean;
	dampingFactor?: number;
	enableZoom?: boolean;
	autoRotate?: boolean;
	autoRotateSpeed?: number;
};

const defaultConfig: OrbitControlConfig = {
	enableDamping: true,
	dampingFactor: 0.25,
	enableZoom: true,
	autoRotate: true,
	autoRotateSpeed: 0.5,
};
export const getOrbitControl = (
	camera: PerspectiveCamera,
	element: HTMLElement,
	config: OrbitControlConfig | undefined,
): OrbitControls => {
	config = { ...defaultConfig, ...config };
	const controls: OrbitControls = new OrbitControls(camera, element);
	controls.enableDamping = config.enableDamping;
	controls.dampingFactor = config.dampingFactor;
	controls.enableZoom = config.enableZoom;
	controls.autoRotate = config.autoRotate;
	controls.autoRotateSpeed = config.autoRotateSpeed || 0.3;

	return controls;
};
