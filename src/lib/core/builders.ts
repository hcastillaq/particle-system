import { PerspectiveCamera, WebGLRenderer } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GArtOrbitControlConfig } from "./interfaces";

export function buildRenderer(
	container: HTMLElement,
	zoom: number
): { renderer: WebGLRenderer; camera: PerspectiveCamera } {
	const { clientWidth: width, clientHeight: height } = container;

	const renderer = new WebGLRenderer({
		antialias: false,
		powerPreference: "high-performance",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
	renderer.setSize(width, height);

	const camera = new PerspectiveCamera(45, width / height, 0.1, 10000);
	camera.position.z = zoom;

	return { renderer, camera };
}

export function buildOrbitControl(
	camera: PerspectiveCamera,
	domElement: HTMLElement,
	config: GArtOrbitControlConfig
): OrbitControls {
	const controls = new OrbitControls(camera, domElement);
	controls.enableDamping = config.enableDamping ?? true;
	controls.dampingFactor = config.dampingFactor ?? 0.25;
	controls.enableZoom = config.enableZoom ?? true;
	controls.autoRotate = config.autoRotate ?? true;
	controls.autoRotateSpeed = config.autoRotateSpeed ?? 0.1;
	return controls;
}
