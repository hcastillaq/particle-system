import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from "three";

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
