import {
	AdditiveBlending,
	BufferGeometry,
	Points,
	PointsMaterial,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { ParticleSystem } from "./../system/index.js";
import { CAMERA, RENDERER, SCENE } from "./globals.three.js";
import { getOrbitControl, OrbitControlConfig } from "./orbitControl.three.js";

export type ParticleSystemAnimationConfig = {
	system: ParticleSystem;
	container: HTMLElement;
	stats?: boolean;
	material: {
		color: string;
		opacity?: number;
		sizeParticle?: number;
	};
	zoom?: number;
	orbitConfig?: OrbitControlConfig;
};

export type ParticleSystemAnimationCallbacks = {
	start: () => void;
	stop: () => void;
	changeColor: (color: number) => void;
	changeOpacity: (opacity: number) => void;
	takePhoto: () => void;
};

export const ParticleSystemAnimation = function (
	config: ParticleSystemAnimationConfig,
): ParticleSystemAnimationCallbacks {
	// render element in the DOM
	config.container.appendChild(RENDERER.domElement);
	let stats: Stats | undefined = undefined;
	//stats
	if (config.stats) {
		stats = Stats();
		config.container.appendChild(stats.domElement);
	}

	//OrbitControl configuration
	const controls = getOrbitControl(
		CAMERA,
		RENDERER.domElement,
		config.orbitConfig,
	);
	CAMERA.position.z = config.zoom ? config.zoom : 500;

	// geometry
	const geometry = new BufferGeometry();
	const material = new PointsMaterial({
		transparent: true,
		opacity: config.material.opacity || 0.5,
		color: config.material.color,
		size: config.material.sizeParticle || 0.01,
		sizeAttenuation: true,
	});
	material.blending = AdditiveBlending;

	config.system.setGeometry(geometry);

	// Points
	const points = new Points(geometry, material);
	SCENE.add(points);
	config.system.setScene(SCENE);

	// Resize
	const resize = () => {
		CAMERA.aspect = window.innerWidth / window.innerHeight;
		CAMERA.updateProjectionMatrix();
		RENDERER.setSize(window.innerWidth, window.innerHeight);
	};

	window.addEventListener("resize", resize, false);

	//rotate
	const rotate = () => {
		if (config.orbitConfig?.autoRotate) {
			SCENE.rotateX(((-90 * Math.PI) / 180) * 0.001);
			SCENE.rotateY(((90 * Math.PI) / 180) * 0.001);
		}
	};

	//change color
	const changeColor = (color: number) => {
		material.color.set(color);
	};

	// change opacity
	const changeOpacity = (opacity: number) => {
		material.opacity = opacity;
	};

	// animation stop
	let idAnimation: number;
	const stopAnimation = () => {
		cancelAnimationFrame(idAnimation);
		points.geometry.dispose();
		points.material.dispose();
		controls.dispose();
		RENDERER.clear();
		CAMERA.position.set(0, 0, 0);
		CAMERA.lookAt(0, 0, 0);
		CAMERA.clear();
		SCENE.rotation.set(0, 0, 0);
		SCENE.remove(points);
		SCENE.remove(CAMERA);
		SCENE.clear();
		config.system.dispose();
		window.removeEventListener("resize", resize, false);
		console.info("stop animations");
	};

	//takePhoto
	const takePhoto = () => {
		RENDERER.render(SCENE, CAMERA);
		RENDERER.domElement.toBlob(
			function (blob) {
				if (blob !== null) {
					var a = document.createElement("a");
					var url = URL.createObjectURL(blob);
					a.href = url;
					a.download = "particles.png";
					a.click();
				}
			},
			"image/png",
			1,
		);
	};
	//animate
	const animate = () => {
		idAnimation = requestAnimationFrame(animate);
		config.system.update();
		rotate();
		controls.update();
		geometry.attributes.position.needsUpdate = true;
		RENDERER.render(SCENE, CAMERA);
		if (config.stats && stats) {
			stats.update();
		}
	};

	return {
		start: animate,
		stop: stopAnimation,
		changeColor,
		changeOpacity,
		takePhoto,
	};
};
