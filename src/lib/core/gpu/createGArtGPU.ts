import {
	AdditiveBlending,
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	Points,
	Scene,
	ShaderMaterial,
	Sphere,
	Vector3,
	WebGLRenderer,
} from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { buildOrbitControl, buildRenderer } from "../builders";
import { ColorHex, GArtCallbacks, GArtConfig } from "../interfaces";
import { DEFAULT_ORBIT_CONFIG, orbitRotate, takePhoto } from "../utils";
import { GArtSystemGPU } from "./GArtSystemGPU";

const FRAGMENT_SHADER = /* glsl */ `
	uniform vec3 uColor;
	uniform float uOpacity;

	void main() {
		float dist = length(gl_PointCoord - vec2(0.5)) * 2.0;
		if (dist > 1.0) discard;
		float alpha = uOpacity * (1.0 - dist);
		gl_FragColor = vec4(uColor, alpha);
	}
`;

function buildGPUCompute(
	system: GArtSystemGPU,
	renderer: WebGLRenderer
): {
	gpuCompute: GPUComputationRenderer;
	varRef: ReturnType<GPUComputationRenderer["addVariable"]>;
} {
	const { width, height } = system.getTextureSize();
	const gpuCompute = new GPUComputationRenderer(width, height, renderer);

	const texture = gpuCompute.createTexture();
	if (texture.image.data) {
		texture.image.data.set(system.getInitialTextureData());
	}
	const varRef = gpuCompute.addVariable(
		"texturePosition",
		system.texturePosition,
		texture
	);
	gpuCompute.setVariableDependencies(varRef, [varRef]);
	varRef.material.uniforms.uSpeed = { value: 1.0 };

	const gpuError = gpuCompute.init();
	if (gpuError !== null) {
		throw new Error(`GPUComputationRenderer init error: ${gpuError}`);
	}

	return { gpuCompute, varRef };
}

function buildGeometry(
	system: GArtSystemGPU,
	width: number,
	height: number
): BufferGeometry {
	const numParticles = system.getParticleCount();
	const uvs = new Float32Array(numParticles * 2);
	const invWidth = 1 / width;
	const invHeight = 1 / height;
	let col = 0;
	let row = 0;
	for (let i = 0; i < numParticles; i++) {
		uvs[i * 2] = col * invWidth;
		uvs[i * 2 + 1] = row * invHeight;
		if (++col >= width) {
			col = 0;
			row++;
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(uvs, 2));
	geometry.setDrawRange(0, numParticles);
	geometry.boundingSphere = new Sphere(new Vector3(0, 0, 0), Infinity);
	return geometry;
}

function buildMaterial(
	system: GArtSystemGPU,
	config: GArtConfig
): ShaderMaterial {
	return new ShaderMaterial({
		uniforms: {
			texturePosition: { value: null },
			uColor: { value: new Color(config.material.color) },
			uOpacity: { value: config.material.opacity ?? 0.5 },
			uSize: { value: config.material.sizeParticle ?? 1.0 },
		},
		vertexShader: system.vertexShader,
		fragmentShader: FRAGMENT_SHADER,
		transparent: true,
		blending: AdditiveBlending,
		depthWrite: false,
	});
}

export function createGArtGPU(config: GArtConfig): GArtCallbacks {
	const system = config.system as unknown as GArtSystemGPU;
	const orbitConfig = { ...DEFAULT_ORBIT_CONFIG, ...config.orbitConfig };

	const container = config.container;
	const { width, height } = system.getTextureSize();

	const { renderer, camera } = buildRenderer(container, config.zoom ?? 100);
	const { gpuCompute, varRef } = buildGPUCompute(system, renderer);
	const geometry = buildGeometry(system, width, height);
	const material = buildMaterial(system, config);

	const scene = new Scene();
	const stats = new Stats();

	const orbitControl = buildOrbitControl(
		camera,
		renderer.domElement,
		orbitConfig
	);
	const points = new Points(geometry, material);
	points.frustumCulled = false;
	scene.add(points);

	let idAnimation = 0;
	let running = false;
	let userInteracting = false;
	let speed = Math.min(2, Math.max(0, config.speed ?? 1));

	orbitControl.addEventListener("start", () => {
		userInteracting = true;
	});
	orbitControl.addEventListener("end", () => {
		userInteracting = false;
	});

	function onResize(w: number, h: number) {
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	}

	const resizeObserver = new ResizeObserver((entries) => {
		const { inlineSize: w, blockSize: h } = entries[0].contentBoxSize[0];
		onResize(w, h);
	});

	function update() {
		varRef.material.uniforms.uSpeed.value = speed;
		gpuCompute.compute();
		material.uniforms.texturePosition.value =
			gpuCompute.getCurrentRenderTarget(varRef).texture;
	}

	function animate() {
		idAnimation = requestAnimationFrame(animate);
		update();
		orbitRotate(orbitConfig, userInteracting, scene);
		orbitControl.update();
		if (config.stats) stats.update();
		renderer.render(scene, camera);
	}

	return {
		start() {
			if (running) return;
			running = true;
			gpuCompute.compute();
			material.uniforms.texturePosition.value =
				gpuCompute.getCurrentRenderTarget(varRef).texture;
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
			running = false;
			cancelAnimationFrame(idAnimation);
			idAnimation = 0;
			resizeObserver.disconnect();
			orbitControl.dispose();
			material.dispose();
			geometry.dispose();
			gpuCompute.getCurrentRenderTarget(varRef).dispose();
			scene.clear();
			renderer.dispose();
			renderer.domElement.remove();
			if (config.stats) stats.dom.remove();
		},
		setColor(color: ColorHex) {
			material.uniforms.uColor.value.set(color);
		},
		setOpacity(opacity: number) {
			material.uniforms.uOpacity.value = opacity;
		},
		setSpeed(value: number) {
			speed = Math.min(2, Math.max(0, value));
		},
		setAutoRotate(autoRotate: boolean) {
			orbitConfig.autoRotate = autoRotate;
			orbitControl.autoRotate = autoRotate;
		},
		takePhoto(fileName?: string) {
			takePhoto(renderer, camera, scene, fileName);
		},
	};
}
