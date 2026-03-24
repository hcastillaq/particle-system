import {
	AdditiveBlending,
	BufferGeometry,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import {
	ColorHex,
	GArtCallbacks,
	GArtCPUConfig,
	GArtOrbitControlConfig,
} from "../interfaces";
import { colorUtils } from "../utils";

const DEFAULT_ORBIT_CONFIG: GArtOrbitControlConfig = {
	enableDamping: true,
	dampingFactor: 0.25,
	enableZoom: true,
	autoRotate: true,
	autoRotateSpeed: 0.5,
};

function buildRenderer(zoom: number): {
	renderer: WebGLRenderer;
	camera: PerspectiveCamera;
} {
	const renderer = new WebGLRenderer({
		antialias: false,
		powerPreference: "high-performance",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 1));
	renderer.setSize(window.innerWidth, window.innerHeight);

	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		10000
	);
	camera.position.z = zoom;

	return { renderer, camera };
}

function buildOrbitControl(
	camera: PerspectiveCamera,
	domElement: HTMLElement,
	config: GArtOrbitControlConfig
): OrbitControls {
	const controls = new OrbitControls(camera, domElement);
	controls.enableDamping = config.enableDamping ?? true;
	controls.dampingFactor = config.dampingFactor ?? 0.25;
	controls.enableZoom = config.enableZoom ?? true;
	controls.autoRotate = false;
	return controls;
}

function buildMaterial(config: GArtCPUConfig): PointsMaterial {
	const m = new PointsMaterial({
		transparent: true,
		opacity: config.material.opacity ?? 0.5,
		color: colorUtils.stringToNumber(config.material.color),
		size: config.material.sizeParticle ?? 0.01,
		sizeAttenuation: true,
	});
	m.blending = AdditiveBlending;
	return m;
}

export function createGArtCPU(config: GArtCPUConfig): GArtCallbacks {
	const system = config.system;
	const orbitConfig = { ...DEFAULT_ORBIT_CONFIG, ...config.orbitConfig };
	const { renderer, camera } = buildRenderer(config.zoom ?? 500);

	const geometry = new BufferGeometry();
	const stats = new Stats();
	const scene = new Scene();
	const material = buildMaterial(config);

	const points = new Points(geometry, material);
	scene.add(points);

	const orbitControl = buildOrbitControl(
		camera,
		renderer.domElement,
		orbitConfig
	);

	function onResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	let idAnimation = 0;
	let running = false;
	let userInteracting = false;

	orbitControl.addEventListener("start", () => {
		userInteracting = true;
	});
	orbitControl.addEventListener("end", () => {
		userInteracting = false;
	});

	function rotate() {
		if (orbitConfig.autoRotate && !userInteracting) {
			const speed = (orbitConfig.autoRotateSpeed ?? 0.5) * Math.PI * 0.001;
			scene.rotateX(-speed);
			scene.rotateY(speed);
		}
	}

	function animate() {
		idAnimation = requestAnimationFrame(animate);
		system.update();
		rotate();
		if (config.stats) stats.update();
		geometry.attributes.position.needsUpdate = true;
		orbitControl.update();
		renderer.render(scene, camera);
	}

	return {
		start() {
			if (running) return;
			running = true;
			config.container.appendChild(renderer.domElement);
			if (config.stats) config.container.appendChild(stats.dom);
			system.setGeometry(geometry);
			window.addEventListener("resize", onResize, false);
			animate();
		},
		stop() {
			running = false;
			cancelAnimationFrame(idAnimation);
			idAnimation = 0;
			window.removeEventListener("resize", onResize, false);
		},
		dispose() {
			cancelAnimationFrame(idAnimation);
			window.removeEventListener("resize", onResize, false);
			orbitControl.dispose();
			material.dispose();
			system.dispose();
			scene.clear();
			renderer.dispose();
			renderer.domElement.remove();
			if (config.stats) stats.dom.remove();
		},
		changeColor(color: ColorHex) {
			material.color.set(colorUtils.stringToNumber(color));
		},
		changeOpacity(opacity: number) {
			material.opacity = opacity;
		},
		takePhoto(fileNameWithoutExtension?: string) {
			renderer.render(scene, camera);
			renderer.domElement.toBlob(
				(blob) => {
					if (!blob) return;
					const a = document.createElement("a");
					a.href = URL.createObjectURL(blob);
					a.download = `${fileNameWithoutExtension ?? "particles"}.png`;
					a.click();
				},
				"image/png",
				1
			);
		},
	};
}
