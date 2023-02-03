import ChenAttractor from "./attractors/chen.attractor";
import {
	ParticleSystemAnimation,
	ParticleSystemAnimationConfig,
} from "./lib/three/config.three";

const system = new ChenAttractor();

const config: ParticleSystemAnimationConfig = {
	system: system,
	parentNode: document.getElementById("app") as HTMLElement,
	stats: true,
	material: {
		color: "#fff",
		opacity: 1,
		sizeParticle: 0.5,
	},
	orbitConfig: {
		enableZoom: true,
		autoRotate: true,
	},
	zoom: 500,
};
const animation = ParticleSystemAnimation(config);

animation.start();
