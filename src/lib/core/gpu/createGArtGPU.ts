import {
	AdditiveBlending,
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import {
	ColorHex,
	GArtCallbacks,
	GArtGPUConfig,
	GArtOrbitControlConfig,
} from "../interfaces";

const DEFAULT_ORBIT_CONFIG: GArtOrbitControlConfig = {
	enableDamping: true,
	dampingFactor: 0.25,
	enableZoom: true,
	autoRotate: true,
	autoRotateSpeed: 0.5,
};

const VERTEX_SHADER = /* glsl */ `
	uniform sampler2D texturePosition;
	uniform float uSize;

	void main() {
		vec4 pos = texture2D(texturePosition, position.xy);
		vec4 mvPos = modelViewMatrix * vec4(pos.xyz, 1.0);
		gl_PointSize = uSize * (300.0 / -mvPos.z);
		gl_Position = projectionMatrix * mvPos;
	}
`;

const FRAGMENT_SHADER = /* glsl */ `
	uniform vec3 uColor;
	uniform float uOpacity;

	void main() {
		gl_FragColor = vec4(uColor, uOpacity);
	}
`;

export function createGArtGPU(config: GArtGPUConfig): GArtCallbacks {
	const system = config.system;
	const orbitConfig = { ...DEFAULT_ORBIT_CONFIG, ...config.orbitConfig };
	const { width, height } = system.getTextureSize();

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
	camera.position.z = config.zoom ?? 100;

	// ── GPGPU setup ──────────────────────────────────────────────────────────
	const gpuCompute = new GPUComputationRenderer(width, height, renderer);

	const initTexture = gpuCompute.createTexture();
	if (initTexture.image.data) {
		initTexture.image.data.set(system.getInitialTextureData());
	}

	const posVar = gpuCompute.addVariable(
		"texturePosition",
		system.getPositionShader(),
		initTexture
	);
	gpuCompute.setVariableDependencies(posVar, [posVar]);

	const gpuError = gpuCompute.init();
	if (gpuError !== null) {
		throw new Error(`GPUComputationRenderer init error: ${gpuError}`);
	}

	// ── Geometry: each particle stores UV coords to sample the position texture
	const numParticles = system.getNumberParticles();
	const uvs = new Float32Array(numParticles * 3);
	for (let i = 0; i < numParticles; i++) {
		uvs[i * 3] = (i % width) / width;
		uvs[i * 3 + 1] = Math.floor(i / width) / height;
		uvs[i * 3 + 2] = 0;
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(uvs, 3));
	geometry.setDrawRange(0, numParticles);

	// ── Material ─────────────────────────────────────────────────────────────
	const material = new ShaderMaterial({
		uniforms: {
			texturePosition: { value: null },
			uColor: { value: new Color(config.material.color) },
			uOpacity: { value: config.material.opacity ?? 0.5 },
			uSize: { value: config.material.sizeParticle ?? 1.0 },
		},
		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
		transparent: true,
		blending: AdditiveBlending,
		depthWrite: false,
	});

	const scene = new Scene();
	const stats = new Stats();

	const orbitControl = new OrbitControls(camera, renderer.domElement);
	orbitControl.enableDamping = orbitConfig.enableDamping ?? true;
	orbitControl.dampingFactor = orbitConfig.dampingFactor ?? 0.25;
	orbitControl.enableZoom = orbitConfig.enableZoom ?? true;
	orbitControl.autoRotate = false;

	scene.add(new Points(geometry, material));

	let idAnimation = 0;
	let running = false;
	let userInteracting = false;

	orbitControl.addEventListener("start", () => {
		userInteracting = true;
	});
	orbitControl.addEventListener("end", () => {
		userInteracting = false;
	});

	function onResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function rotate() {
		if (orbitConfig.autoRotate && !userInteracting) {
			const speed = (orbitConfig.autoRotateSpeed ?? 0.5) * Math.PI * 0.001;
			scene.rotateX(-speed);
			scene.rotateY(speed);
		}
	}

	function animate() {
		idAnimation = requestAnimationFrame(animate);
		gpuCompute.compute();
		material.uniforms.texturePosition.value =
			gpuCompute.getCurrentRenderTarget(posVar).texture;
		rotate();
		if (config.stats) stats.update();
		orbitControl.update();
		renderer.render(scene, camera);
	}

	return {
		start() {
			if (running) return;
			running = true;
			config.container.appendChild(renderer.domElement);
			if (config.stats) config.container.appendChild(stats.dom);
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
			running = false;
			cancelAnimationFrame(idAnimation);
			idAnimation = 0;
			window.removeEventListener("resize", onResize, false);
			orbitControl.dispose();
			material.dispose();
			geometry.dispose();
			gpuCompute.getCurrentRenderTarget(posVar).dispose();
			scene.clear();
			renderer.dispose();
			renderer.domElement.remove();
			if (config.stats) stats.dom.remove();
		},
		changeColor(color: ColorHex) {
			material.uniforms.uColor.value.set(color);
		},
		changeOpacity(opacity: number) {
			material.uniforms.uOpacity.value = opacity;
		},
		takePhoto(fileName?: string) {
			renderer.render(scene, camera);
			renderer.domElement.toBlob(
				(blob) => {
					if (!blob) return;
					const a = document.createElement("a");
					a.href = URL.createObjectURL(blob);
					a.download = `${fileName ?? "particles"}.png`;
					a.click();
				},
				"image/png",
				1
			);
		},
	};
}
