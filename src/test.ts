import {
	ParticleSystemAnimation,
	ParticleSystemAnimationConfig,
} from "particle-system";
import ChenAttractor from "./attractors/chen.attractor";

const chen = new ChenAttractor();

const config: ParticleSystemAnimationConfig = {
	system: chen,
	container: document.getElementById("app") as HTMLElement,
	material: {
		color: "#fff",
		sizeParticle: 0.2,
	},
	orbitConfig: {
		autoRotate: true,
	},
};

const animation = ParticleSystemAnimation(config);
animation.start();
