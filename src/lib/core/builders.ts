import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from "three";
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

export function takePhoto(
	renderer: WebGLRenderer,
	camera: PerspectiveCamera,
	scene: Scene,
	fileName = "particles"
): void {
	const size = renderer.getSize(new Vector2());
	const targetW = 3840;
	const targetH = 2160;

	camera.aspect = targetW / targetH;
	camera.updateProjectionMatrix();
	renderer.setSize(targetW, targetH);
	renderer.render(scene, camera);
	renderer.domElement.toBlob(
		(blob) => {
			if (!blob) return;
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = `${fileName}.png`;
			a.click();
		},
		"image/png",
		1
	);
	// Restore original size and aspect
	camera.aspect = size.x / size.y;
	camera.updateProjectionMatrix();
	renderer.setSize(size.x, size.y);
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
	return controls;
}
