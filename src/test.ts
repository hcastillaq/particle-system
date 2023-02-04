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
		color: "#ff9d00",
		opacity: 0.5,
		sizeParticle: 0.5,
	},
	orbitConfig: {
		enableZoom: true,
		autoRotate: true,
	},
};
const animation = ParticleSystemAnimation(config);

animation.start();
