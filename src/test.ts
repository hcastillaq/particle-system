import {
	ParticleSystemAnimation,
	ParticleSystemAnimationConfig,
} from "./lib/three/config.three";

import ChenAttractor from "./attractors/chen.attractor";

const chen = new ChenAttractor();

const config: ParticleSystemAnimationConfig = {
	system: chen,
	container: document.getElementById("app") as HTMLElement,
	material: {
		color: "red",
		sizeParticle: 0.01,
		opacity: 1,
	},
	orbitConfig: {
		autoRotate: true,
	},
	stats: true,
};

const animation = ParticleSystemAnimation(config);
animation.start();
