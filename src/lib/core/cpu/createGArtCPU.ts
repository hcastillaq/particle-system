import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	Points,
	PointsMaterial,
	Scene,
} from "three";
import Stats from "three/addons/libs/stats.module.js";
import { buildOrbitControl, buildRenderer, takePhoto } from "../builders";
import {
	ColorHex,
	GArtCallbacks,
	GArtConfig,
	GArtOrbitControlConfig,
} from "../interfaces";
import { colorUtils } from "../utils";
import { GArtSystemCPU } from "./GArtSystemCPU";

const DEFAULT_ORBIT_CONFIG: GArtOrbitControlConfig = {
	enableDamping: true,
	dampingFactor: 0.25,
	enableZoom: true,
	autoRotate: true,
	autoRotateSpeed: 0.5,
};

function buildParticleTexture(): CanvasTexture {
	const size = 64;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d")!;
	const half = size / 2;
	const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
	gradient.addColorStop(0, "rgba(255,255,255,1)");
	gradient.addColorStop(1, "rgba(255,255,255,0)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, size, size);
	return new CanvasTexture(canvas);
}

function buildMaterial(config: GArtConfig): PointsMaterial {
	const material = new PointsMaterial({
		transparent: true,
		opacity: config.material.opacity ?? 0.5,
		color: colorUtils.stringToNumber(config.material.color),
		size: config.material.sizeParticle ?? 0.01,
		sizeAttenuation: true,
		map: buildParticleTexture(),
		alphaTest: 0.001,
	});
	material.blending = AdditiveBlending;
	material.depthWrite = false;
	material.toneMapped = false;
	return material;
}

export function createGArtCPU(config: GArtConfig): GArtCallbacks {
	const system = config.system as unknown as GArtSystemCPU;

	const orbitConfig = { ...DEFAULT_ORBIT_CONFIG, ...config.orbitConfig };
	const { renderer, camera } = buildRenderer(
		config.container,
		config.zoom ?? 500
	);

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

	const container = config.container;

	function onResize(width: number, height: number) {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}

	const resizeObserver = new ResizeObserver((entries) => {
		const { inlineSize: width, blockSize: height } =
			entries[0].contentBoxSize[0];
		onResize(width, height);
	});

	let idAnimation = 0;
	let running = false;
	let userInteracting = false;
	let speed = Math.min(2, Math.max(0, config.speed ?? 1));

	let positionAttr: BufferAttribute = new BufferAttribute(
		system.getParticles(),
		system.getParticleAttributesCount()
	);
	geometry.setAttribute("position", positionAttr);

	orbitControl.addEventListener("start", () => {
		userInteracting = true;
	});

	orbitControl.addEventListener("end", () => {
		userInteracting = false;
	});

	function rotate() {
		if (orbitConfig.autoRotate && !userInteracting) {
			const rotSpeed = (orbitConfig.autoRotateSpeed ?? 0.5) * Math.PI * 0.001;
			scene.rotateX(-rotSpeed);
			scene.rotateY(rotSpeed);
		}
	}

	function update() {
		system.update(speed);
		positionAttr.needsUpdate = true;
	}

	function animate() {
		idAnimation = requestAnimationFrame(animate);
		update();
		rotate();
		orbitControl.update();
		renderer.render(scene, camera);
		if (config.stats) stats.update();
	}

	return {
		start() {
			if (running) return;
			running = true;
			container.appendChild(renderer.domElement);
			if (config.stats) container.appendChild(stats.dom);
			resizeObserver.observe(container);
			animate();
		},
		stop() {
			running = false;
			cancelAnimationFrame(idAnimation);
			idAnimation = 0;
			resizeObserver.unobserve(container);
		},
		dispose() {
			cancelAnimationFrame(idAnimation);
			resizeObserver.disconnect();
			orbitControl.dispose();
			material.map?.dispose();
			material.dispose();
			geometry.dispose();
			scene.clear();
			renderer.dispose();
			renderer.domElement.remove();
			if (config.stats) stats.dom.remove();
		},
		setColor(color: ColorHex) {
			material.color.set(colorUtils.stringToNumber(color));
		},
		setOpacity(opacity: number) {
			material.opacity = opacity;
		},
		setAutoRotate(autoRotate: boolean) {
			orbitConfig.autoRotate = autoRotate;
			orbitControl.autoRotate = autoRotate;
		},
		setSpeed(value: number) {
			speed = Math.min(2, Math.max(0, value));
		},
		takePhoto(fileNameWithoutExtension?: string) {
			takePhoto(renderer, camera, scene, fileNameWithoutExtension);
		},
	};
}
