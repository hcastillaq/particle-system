import {
	ParticleSystemAnimation,
	ParticleSystemAnimationConfig,
} from "particle-system";
import ChenAttractor from "./attractors/chen.attractor";

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
