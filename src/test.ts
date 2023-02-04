import ChenAttractor from "./attractors/chen.attractor";
import {
	ParticleSystemAnimation,
	ParticleSystemAnimationConfig,
} from "./lib/three/config.three";

const system = new ChenAttractor();

const config: ParticleSystemAnimationConfig = {
	system: system,
	container: document.getElementById("app") as HTMLElement,
	stats: true,
	material: {
		color: "#fff",
		opacity: 1,
		sizeParticle: 1,
	},
	orbitConfig: {
		enableZoom: true,
		autoRotate: true,
	},
};
const animation = ParticleSystemAnimation(config);

animation.start();
